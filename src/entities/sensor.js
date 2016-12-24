const {_TYPE, _X, _Y,_DX,_DY, _DATA, _SIZE_OF, _START} = require("./constants");
const Vector = require("../util/vector");
var Entities;
var EntityType;

const TAU = Math.PI * 2;

const MAX_SENSOR_AGE = 2000;

module.exports = {
    render: function (ctx, now, viewAABB, array, id, image)
    {
        // invisible
    },
    update: function (now, array, id, game)
    {
        if (!Entities)
        {
            Entities = require("./index");
            EntityType = Entities.EntityType;
        }

        var sensorX = array[id + _X];
        var sensorY = array[id + _Y];
        var start = array[id + _START];
        array[id + _X] += array[id + _DX];
        array[id + _Y] += array[id + _DY];

        var targetId;
        if (game.level.collide(sensorX, sensorY))
        {
            //console.log("sensor level");
            targetId = -1;
        }

        if (game.player.getAABB().inside(sensorX,sensorY))
        {
            //console.log("sensor player");
            targetId = game.player.entityId;
        }

        if (now - start > MAX_SENSOR_AGE)
        {
            //console.log("sensor level");
            targetId = -2;
        }

        if (targetId !== undefined)
        {
            Entities.remove(id, targetId);
        }
    }
};
