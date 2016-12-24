var assign = require("object.assign").getPolyfill();

const Images = require("../images");

const AABB = require("../util/aabb");
const Score = require("../score");
const AIStates = require("./ai-states");

const MAX_ENTITIES = 1000;

const EntityType = require("./type");
const {_TYPE, _X, _Y, _DX, _DY, _DATA, _SIZE_OF, _OWNER, _START} = require("./constants");

const ARRAY_LEN = MAX_ENTITIES * _SIZE_OF;
var array = new Float64Array(ARRAY_LEN);

// Current end index of the allocated buffer
var allocationEnd;

// number of currently removed entities
var removedEntities;

// starting point for the next id reclamation
var reclaimStart;

var nameToNumericType = {
    "bonus" : EntityType.BONUS,
    "rocket" : EntityType.ROCKET,
    "collateral" : EntityType.COLLATERAL,
    "health" : EntityType.HEALTH,
    "end" : EntityType.END,
    "sentinel" : EntityType.SENTINEL,
    "patrol" : EntityType.PATROL_ROUTE
};

var defaultOpts = {
    playerCollision: false,
    canShoot: false,
    canBomb: false,
    scoreValue: 100
};

var entityHandlers = {
    "bonus" : require("./bonus"),
    "rocket" : require("./rocket"),
    "collateral" : require("./collateral"),
    "health" : require("./health"),
    "end" : require("./end"),
    "sentinel" : require("./sentinel")
};

var handlersByType = (function ()
{
    var handlers = {};
    for (var name in entityHandlers)
    {
        if (entityHandlers.hasOwnProperty(name))
        {
            handlers[nameToNumericType[name]] = entityHandlers[name];
        }
    }
    console.log("NUMERIC HANDLERS", handlers);

    return handlers;

})();

handlersByType[EntityType.PLAYER] = require("./player");

const scoreHandler = require("./score.js");
handlersByType[EntityType.SCORE_100] = scoreHandler;
handlersByType[EntityType.SCORE_200] = scoreHandler;
handlersByType[EntityType.SCORE_500] = scoreHandler;
handlersByType[EntityType.SCORE_1000] = scoreHandler;

handlersByType[EntityType.EXPLOSION] = require("./explosion");
handlersByType[EntityType.BOMB] = require("./bomb");
handlersByType[EntityType.LASER] = require("./laser");
handlersByType[EntityType.SENSOR] = require("./sensor");
handlersByType[EntityType.PATROL] = require("./patrol");

var images;

var offsets = [];

var game;


function ensureValid(id)
{
    if (id % _SIZE_OF !== 0)
    {
        throw new Error("Invalid index");
    }

    if (id >= allocationEnd)
    {
        throw new Error("No index #" + id + " exists yet");
    }
}

var Entities = {
    createEntities: function (entitiesData)
    {
        if (!images)
        {
            images = Images.getById([
                null,
                "coin",
                "rocket",
                null, //"collateral",
                "sentinel",
                null,
                null,
                "score100",
                "score200",
                "score500",
                "score1000",
                null,
                "bomb",
                null,
                null,
                "health",
                null,
                null,
                "patrol"
            ]);

            for (let i = 0; i < images.length; i++)
            {
                var image = images[i];
                if (image)
                {
                    offsets[i] = { x: -(image.width/2)|0, y: -(image.height/2)|0};
                }
            }

        }

        var now = Date.now();

        for (var typeName in entitiesData)
        {
            if (entitiesData.hasOwnProperty(typeName))
            {
                var objs = entitiesData[typeName];

                for (let i = 0; i < objs.length; i++)
                {
                    var objData = objs[i];
                    var type = nameToNumericType[typeName];

                    if (type === EntityType.END)
                    {
                        var endAABB = AABB.fromArray(objData.vertices);
                        var endId = Entities.create(type, endAABB.x0, endAABB.y0, now);
                        array[endId + _DX] = endAABB.x1;
                        array[endId + _DY] = endAABB.y1;
                        console.log("Init end AABB = ", endAABB);
                    }
                    else if (type === EntityType.PATROL_ROUTE)
                    {
                        var vertices = objData.vertices;
                        var off = (vertices.length/2) & ~1;
                        var patrolId = Entities.create(EntityType.PATROL, vertices[0], vertices[1], now);
                        console.log("POS", array[patrolId + _X], array[patrolId + _Y]);
                        var aiState = AIStates.aiStateById[patrolId];
                        aiState.vertices = vertices;
                        aiState.index = 0;

                        patrolId = Entities.create(EntityType.PATROL, vertices[off], vertices[off + 1], now);

                        console.log("POS", array[patrolId + _X], array[patrolId + _Y]);

                        aiState = AIStates.aiStateById[patrolId];
                        aiState.vertices = vertices;
                        aiState.index = off/2;
                    }
                    else
                    {
                        var entityId = Entities.create(type, objData.x, objData.y, now);

                        // make sure sentinels and collaterals are generously marked as off-limits for AI

                        if (type === EntityType.SENTINEL || type == EntityType.COLLATERAL)
                        {
                            // + + +
                            // + + +
                            // + + +

                            game.level.setRaster(objData.x, objData.y, false);
                            game.level.setRaster(objData.x - 15, objData.y, false);
                            game.level.setRaster(objData.x + 15, objData.y, false);
                            game.level.setRaster(objData.x, objData.y - 15, false);
                            game.level.setRaster(objData.x, objData.y + 15, false);
                            game.level.setRaster(objData.x - 15, objData.y - 15, false);
                            game.level.setRaster(objData.x + 15, objData.y - 15, false);
                            game.level.setRaster(objData.x + 15, objData.y + 15, false);
                            game.level.setRaster(objData.x - 15, objData.y + 15, false);
                        }
                    }
                }
            }
        }
    },
    newId: function ()
    {
        if (removedEntities == 0)
        {
            if (allocationEnd >= ARRAY_LEN)
            {
                throw new Error("Max entries reached");
            }

            var newId = allocationEnd;
            allocationEnd += _SIZE_OF;
            return newId;
        }
        else
        {
            for (var i = reclaimStart; i >= 0; i -= _SIZE_OF)
            {
                if (!array[i + _TYPE])
                {
                    removedEntities--;
                    reclaimStart = i - _SIZE_OF;
                    return i;
                }
            }

            throw new Error("deletedEntities not 0 but no free index found");
        }
    },

    remove: function (id, relatedId)
    {
        ensureValid(id);

        if (array[id + _TYPE] == EntityType.NONE)
        {
            throw new Error("Entity already removed");
        }

        var ownerId = array[id + _OWNER];
        if (ownerId >= 0)
        {
            Entities.callback(Date.now(), ownerId, id, relatedId)
        }
        array[id + _TYPE] = EntityType.NONE;
        array[id + _OWNER] = -1;

        if (removedEntities == 0 || id > reclaimStart)
        {
            reclaimStart = id;
        }
        removedEntities++;
    },
    /**
     * Allocates a new entry
     *
     * @param type      entity type
     * @param x         initial x
     * @param y         initial y
     * @param start     {number?} creation time
     */
    create: function (type, x, y, start)
    {
        var id = Entities.newId();

        array[id + _TYPE] = type;
        array[id + _X] = x;
        array[id + _Y] = y;
        array[id + _DX] = 0;
        array[id + _DY] = 0;
        array[id + _DATA] = 0;
        array[id + _OWNER] = -1;
        array[id + _START] = start || Date.now();

        var typeHandler = handlersByType[type];

        if (!typeHandler)
        {
            throw new Error("No type handler for type " + type);
        }

        if (typeHandler.init)
        {
            typeHandler.init(array, id, x, y, game);
        }

        return id;
    },
    renderPlayer: function (ctx, now, viewAABB, playerId, opacity)
    {
        if (array[playerId + _TYPE] !== EntityType.PLAYER)
        {
            return;
        }

        ctx.save();
        ctx.translate(-viewAABB.x0, -viewAABB.y0);

        if (opacity && opacity < 1 && opacity >= 0)
        {
            ctx.globalAlpha = opacity;
        }

        handlersByType[EntityType.PLAYER].render(ctx, now, viewAABB, array, playerId, null);

        ctx.restore();
    },
    render: function (ctx, now, viewAABB)
    {
        ctx.save();
        ctx.translate(-viewAABB.x0, -viewAABB.y0);

        for (var i = 0; i < allocationEnd; i += _SIZE_OF)
        {
            var type = array[i + _TYPE];

            if (type && type !== EntityType.PLAYER)
            {
                var handler = handlersByType[type];
                var image = images[type];
                if (handler.render)
                {
                    handler.render(ctx, now, viewAABB, array, i, image)
                }
                else if (image)
                {
                    var x = array[i + _X];
                    var y = array[i + _Y];
                    var off = offsets[type];
                    ctx.drawImage(image, off.x + x, off.y + y);
                }
            }
        }
        ctx.restore();
    },
    callback: function(now, ownerId, id, targetId)
    {
        ensureValid(ownerId);

        var type = array[ownerId + _TYPE];
        if (type !== EntityType.NONE)
        {
            var handler = handlersByType[type];
            if (handler.callback)
            {
                handler.callback(now, array, ownerId, id, targetId, game)
            }
        }
    },
    update: function (now, game)
    {
        for (var i = 0; i < allocationEnd; i += _SIZE_OF)
        {
            var type = array[i + _TYPE];
            if (type !== EntityType.NONE)
            {
                var handler = handlersByType[type];
                if (handler.update)
                {
                    handler.update(now, array, i, game)
                }
            }
        }
    },

    // removes all entities
    clear: function()
    {
        allocationEnd = 0;
        removedEntities = 0;
        AIStates.aiStateById = {};
    },

    getArray: function ()
    {
        return array;
    },

    getAllocationEnd: function ()
    {
        return allocationEnd;
    },

    opts: function (opts)
    {
        assign({}, defaultOpts, opts);
    },

    init: function(_game)
    {
        game = _game;
    },

    MAX_ENTITIES: MAX_ENTITIES,
    EntityType: EntityType
};

Entities.clear();

if (typeof  window !== "undefined")
{
    window.Entities = Entities;
}

module.exports = Entities;
