const {_TYPE, _X, _Y,_DX,_DY, _DATA, _SIZE_OF, _START} = require("./constants");
const Vector = require("../util/vector");
const Score = require("../score");
const EntityType = require("./type");

var Entities;

const EXPLOSION_TIME = 600;
const EXPLOSION_MIN_SIZE = 4;
const EXPLOSION_MAX_SIZE = 16;

const TAU = Math.PI * 2;
const EXPLOSION_RANGE = EXPLOSION_MAX_SIZE - EXPLOSION_MIN_SIZE;

const EXPLOSION_PUSH_RADIUS = 40;
const EXPLOSION_PUSH_POWER = 0.2;


const COLLATERAL_SCORE_ID = [
    EntityType.SCORE_100,
    EntityType.SCORE_500,
    EntityType.SCORE_200
];

const IMPERVIOUS_TO_EXPLOSION = {
    [EntityType.EXPLOSION]: true,
    [EntityType.SCORE_100]: true,
    [EntityType.SCORE_200]: true,
    [EntityType.SCORE_500]: true,
    [EntityType.SCORE_1000]: true
};

module.exports = {
    render: function (ctx, now, viewAABB, array, id, image)
    {
        var start = array[id + _START];
        if (!start)
        {
            return;
        }

        var size, delta = now - start;
        if (delta < EXPLOSION_TIME * 2)
        {
            if (delta < EXPLOSION_TIME)
            {
                size = delta / EXPLOSION_TIME;
                size = size * size;
            }
            else
            {
                size = 1 - (delta - EXPLOSION_TIME) / EXPLOSION_TIME;
            }

            ctx.fillStyle = "rgba(255, 204, 0, 0.66)";
            ctx.strokeStyle = "rgba(255,32,0, 0.5)";

            var x = array[id + _X];
            var y = array[id + _Y];
            var ringSize = array[id + _DATA];

            ctx.beginPath();
            ctx.arc(x, y, EXPLOSION_MIN_SIZE + size * ringSize * (EXPLOSION_RANGE), 0, TAU);
            ctx.fill();
            ctx.stroke();
        }
    },
    update: function (now, array, id, game)
    {
        if (!Entities)
        {
            Entities = require("./index");
        }

        var playerId = game.player.entityId;

        var start = array[id + _START];
        if (start === 0)
        {
            start = array[id + _START] = now;

            var explosionX = array[id + _X];
            var explosionY = array[id + _Y];
            var radius = EXPLOSION_PUSH_RADIUS * array[id + _DATA];

            var len = Entities.getAllocationEnd();
            for (var i = 0; i < len; i += _SIZE_OF)
            {
                var type = array[i + _TYPE];

                if (type !== EntityType.NONE && !IMPERVIOUS_TO_EXPLOSION[type])
                {
                    var x = array[i + _X] - explosionX;
                    if (Math.abs(x) < radius)
                    {
                        var y = array[i + _Y] - explosionY;
                        if (Math.abs(y) < radius)
                        {
                            var v = new Vector(x, y);
                            var d = v.len();
                            if (d < radius)
                            {
                                var power = Math.sqrt( (radius - d)) * EXPLOSION_PUSH_POWER;
                                v.norm(power);
                                array[i + _DX] += v.x;
                                array[i + _DY] += v.y;

                                var damage = power * 75;
                                if (i === playerId)
                                {
                                    array[playerId + _DATA]-= damage;
                                }

                                if (type === EntityType.COLLATERAL && damage > 10)
                                {
                                    var scoreType = COLLATERAL_SCORE_ID[array[i + _DATA]];
                                    Score.toScore(i, scoreType, game);
                                }

                                if (type === EntityType.ROCKET && damage > 60)
                                {
                                    console.log("ROCKET HIT", damage);

                                    Score.create(EntityType.SCORE_200, array[i + _X], array[i + _Y], game);
                                    require("../explosion").init(i, array[i + _X], array[i + _Y], 0.7);
                                }

                                if (type === EntityType.SENTINEL && damage > 65)
                                {
                                    console.log("SENTINEL HIT", damage);

                                    Score.create(EntityType.SCORE_500, array[i + _X], array[i + _Y], game);
                                    require("../explosion").init(i, array[i + _X], array[i + _Y], 0.7);
                                }

                                if (type === EntityType.PATROL && damage > 40)
                                {
                                    console.log("PATROL HIT", damage);

                                    Score.create(EntityType.SCORE_200, array[i + _X], array[i + _Y], game);
                                    require("../explosion").init(i, array[i + _X], array[i + _Y], 0.7);
                                }
                            }
                        }
                    }
                }
            }
        }

        var delta = now - start;
        if (delta >= EXPLOSION_TIME * 2)
        {
            Entities.remove(id);
        }
    }
};
