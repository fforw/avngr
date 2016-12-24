const {_TYPE, _X, _Y,_DX,_DY, _DATA, _OWNER, _SIZE_OF, _START} = require("./constants");
const Vector = require("../util/vector");

const Laser = require("../laser");
const Explosion = require("../explosion");

var Entities;
var EntityType;


var Math_sqrt = Math.sqrt;
var Math_abs = Math.abs;

const TAU = Math.PI * 2;

const Score = require("../score");

const ENEMY_SIZE = 12;

module.exports = {
    init: function (array, id, x, y)
    {
    },

    render: function (ctx, now, viewAABB, array, id, image)
    {
        var laserX = array[id + _X];
        var laserY = array[id + _Y];
        ctx.strokeStyle = "rgba(255,255,240, 0.8)";
        ctx.strokeRect(laserX, laserY, 2, 1);
    },
    update: function (now, array, id, game)
    {
        if (!Entities)
        {
            Entities = require("./index");
            EntityType = Entities.EntityType;
        }

        var laserX = array[id + _X];
        var laserY = array[id + _Y];
        var start = array[id + _START];
        array[id + _X] += array[id + _DX];
        array[id + _Y] += array[id + _DY];

        var targetId = null;
        if (game.level.collide(laserX, laserY))
        {
            targetId = -1;
        }

        if (game.player.getAABB().inside(laserX,laserY))
        {
            array[game.player.entityId + _DATA] -= 20;
            targetId = game.player.entityId;
        }

        var end = Entities.getAllocationEnd();
        for (var entityId = 0; entityId < end; entityId+= _SIZE_OF)
        {
            var type = array[entityId + _TYPE];
            if (type === EntityType.PATROL || type === EntityType.SENTINEL)
            {
                var x = array[entityId + _X] - laserX;
                if (Math_abs(x) < ENEMY_SIZE)
                {
                    var y = array[entityId + _Y] - laserY;
                    if (Math_abs(y) < ENEMY_SIZE)
                    {
                        var dist = Math_sqrt(x*x+y*y);
                        if (dist < ENEMY_SIZE)
                        {
                            targetId = entityId;
                            x = array[entityId + _X];
                            y = array[entityId + _Y];
                            Score.create(EntityType.SCORE_100, x, y, game);
                            console.log("Laser shot killed "+ (type === EntityType.PATROL ? "patrol" : "sentinel"));
                            Explosion.init(entityId, x, y, 0.7)
                        }
                    }
                }
            }
        }

        if (now - start > Laser.MAX_AGE)
        {
            targetId = -2;
        }

        if (targetId !== null)
        {
            Entities.remove(id, targetId);
        }
    }
};
