const {_TYPE, _X, _Y, _DX, _DY, _DATA, _DATA2, _START, _SIZE_OF} = require("./constants");


const Vector = require("../util/vector");

const Laser = require("../laser");

const TAU = Math.PI * 2;

const FIRE_DELAY = 2000;
const SENSOR_DELAY = 500;

var Entities;
var EntityType;

const _SHOTS = _DATA;
const _LAST_SHOT = _DATA2;

function initEntities()
{
    if (!Entities)
    {
        Entities = require("./index");
        EntityType = Entities.EntityType
    }
}
const MAX_DISTANCE = 500;

module.exports = {

    init: function (array, id, x, y)
    {
        array[id + _SHOTS] = 1;
        array[id + _LAST_SHOT] = 0;
    },

    callback: function(now, array, ownerId, id, targetId, game)
    {
        var type = array[id + _TYPE];

        if (type === EntityType.SENSOR)
        {
            if (targetId === game.player.entityId)
            {
                array[ownerId + _LAST_SHOT ] = now - FIRE_DELAY;
            }
            else
            {
                array[ownerId + _LAST_SHOT] = 0;
            }
        }
        else
        {
            array[ownerId + _SHOTS]++;
        }
    },
    update: function (now, array, id, game)
    {
        initEntities();

        var playerId = game.player.entityId;

        var sentinelX = array[id + _X];
        var sentinelY = array[id + _Y];
        var lastShot = array[id + _LAST_SHOT ];
        var shots = array[id + _SHOTS ];
        var start = array[id + _START ];

        var playerX = array[playerId + _X];
        var playerY = array[playerId + _Y];
        var playerDX = array[playerId + _DX];
        var playerDY = array[playerId + _DY];
        var alive = array[playerId + _DATA] >= 0;
        var targetVector = new Vector(playerX - sentinelX, playerY - sentinelY);

        var distance = targetVector.len();
        var stepsToTarget = distance / Laser.SPEED;
        targetVector.add(playerDX * stepsToTarget, playerDY * stepsToTarget).norm();

        if (lastShot === 0)
        {
            array[id + _LAST_SHOT ] = -1;
            Laser.sensor(sentinelX, sentinelY, targetVector.x, targetVector.y, id);
        }
        else if (lastShot > 0)
        {
            if (alive && shots > 0 && distance < MAX_DISTANCE && now - lastShot > FIRE_DELAY)
            {
                array[id + _SHOTS ]--;
                array[id + _LAST_SHOT ] = now;

                Laser.fire(sentinelX, sentinelY, targetVector.x, targetVector.y, id);
            }
        }
    }
};
