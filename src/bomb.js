const {_TYPE, _X, _Y,_DX,_DY, _OWNER, _SIZE_OF, _START} = require("./entities/constants");

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

var Bomb = {
    init: function (array, id, x, y)
    {
        array[id + _OWNER] = -1;
    },
    drop: function (x, y, dx, dy, callbackId)
    {
        init();

        let newId = Entities.create(EntityType.BOMB, x, y);

        var array = Entities.getArray();
        array[newId + _DX] = dx;
        array[newId + _DY] = dy;
        array[newId + _OWNER] = callbackId;
    }
};

module.exports = Bomb;
