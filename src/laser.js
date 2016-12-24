const {_TYPE, _X, _Y,_DX,_DY, _DATA, _OWNER, _SIZE_OF, _START} = require("./entities/constants");

const Sounds = require("./sounds");
const Vector = require("./util/vector");


const SPEED = 8;
const MAX_AGE = 1000;
const UPDATE_INTERVAL = 1000/50;

var Entities;
var EntityType;

function init()
{
    if (!Entities)
    {
        Entities = require("./entities");
        EntityType = Entities.EntityType;
    }
}

var Laser = {
    SPEED: SPEED,
    MAX_AGE: MAX_AGE,
    MAX_DISTANCE: (MAX_AGE * UPDATE_INTERVAL) * SPEED,
    fire: function (x,y,targetX, targetY, callbackId)
    {
        init();

        var vTarget = new Vector(targetX, targetY);
        var vOffset = vTarget.copy().norm(16);
        var vSpeed = vTarget.norm(Laser.SPEED);

        let newId = Entities.create(EntityType.LASER, x + vOffset.x, y + vOffset.y);

        var array = Entities.getArray();
        array[newId + _DX] = vSpeed.x;
        array[newId + _DY] = vSpeed.y;
        array[newId + _OWNER] = callbackId || -1;
        Sounds.play(Sounds.LASER);
    },
    sensor: function (x,y,targetX, targetY, callbackId)
    {
        init();

        let newId = Entities.create(EntityType.SENSOR, x, y);

        var v = new Vector(targetX, targetY).norm(Laser.SPEED);
        var array = Entities.getArray();
        array[newId + _DX] = v.x;
        array[newId + _DY] = v.y;
        array[newId + _OWNER] = callbackId || -1;
    }
};

module.exports = Laser;
