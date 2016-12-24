const {_TYPE, _X, _Y,_DX,_DY, _DATA, _OWNER, _SIZE_OF, _START} = require("./constants");
const Vector = require("../util/vector");
const Explosion = require("../explosion");
const Sounds = require("../sounds");
const Score = require("../score");

var Entities;
var EntityType;

var Math_sqrt = Math.sqrt;
var Math_abs = Math.abs;

const ENEMY_SIZE = 12;
const BOMB_MAX_SPEED = 2;

module.exports = {
    update: function (now, array, id, game)
    {
        if (!Entities)
        {
            Entities = require("./index");
            EntityType = Entities.EntityType;
        }

        var level = game.level;

        var bombX = array[id + _X];
        var bombY = array[id + _Y];
        var bombDX = (array[id + _DX] *= 0.99);
        var bombDY = array[id + _DY];
        var start = array[id + _START];

        if (bombDY < BOMB_MAX_SPEED)
        {
            bombDY = (array[id + _DY] += 0.2);
        }

        array[id + _X] += bombDX;
        array[id + _Y] += bombDY;

        if ((now - start > 3000 || level.collide(bombX + 7, bombY + 7)))
        {
            Explosion.init(id, bombX, bombY, 1);
        }

        var end = Entities.getAllocationEnd();
        for (var entityId = 0; entityId < end; entityId+= _SIZE_OF)
        {
            if (array[entityId + _TYPE] === EntityType.PATROL)
            {
                var x = array[entityId + _X] - bombX;
                if (Math_abs(x) < ENEMY_SIZE)
                {
                    var y = array[entityId + _Y] - bombY;
                    if (Math_abs(y) < ENEMY_SIZE)
                    {
                        var dist = Math_sqrt(x*x+y*y);
                        if (dist < ENEMY_SIZE)
                        {
                            Score.create(EntityType.SCORE_100, x, y, game);
                            console.log("bomb killed patrol");
                            Explosion.init(entityId, array[entityId + _X], array[entityId + _Y], 0.7);
                            Explosion.init(id, bombX, bombY, 1);
                        }
                    }
                }
            }
        }

    }
};
