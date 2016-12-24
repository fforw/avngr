const Sounds = require("../sounds");

const {_TYPE, _X, _Y, _DX, _DY, _DATA, _OWNER, _START, _SIZE_OF} = require("./constants");

const MAX_TIME = 2000;

var Entities;
var EntityType;

function initEntities()
{
    if (!Entities)
    {
        Entities = require("./index");
        EntityType = Entities.EntityType
    }
}

module.exports = {
    init: function (array, off, x, y)
    {
    },

    render: function (ctx, now, viewAABB, array, id, image)
    {
        var start = array[id + _START];
        ctx.save();
        ctx.globalAlpha = Math.min(1, 3 - (now - start) * 3 / MAX_TIME);
        ctx.drawImage(image, array[id + _X] , array[id + _Y]);
        ctx.restore();
    },
    update: function (now, array, id, game)
    {
        initEntities();
        var start = array[id + _START];
        array[id + _Y] += array[id + _DY];

        if (now - start > MAX_TIME)
        {
            Entities.remove(id);
        }
    }
};
