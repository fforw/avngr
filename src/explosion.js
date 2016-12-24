const Sounds = require("./sounds");

var Entities;
var EntityType;

function initEntities()
{
    if (!Entities)
    {
        Entities = require("./entities");
        EntityType = Entities.EntityType
    }
}
const {_TYPE, _X, _Y, _DX, _DY, _DATA, _OWNER, _SIZE_OF, _START} = require("./entities/constants");

const TAU = Math.PI * 2;

var Explosion = {
    create: function(now, x, y, w, h, size)
    {
        initEntities();

        for (var i=0; i < size ; i++)
        {
            var ringSize = size == 1 ? 1 : Math.random();
            var a = Math.random() * TAU;
            var d = w / ( 3 + (1 - ringSize));

            let id = Entities.newId();

            Explosion.init(
                id,
                x + Math.cos(a) * d,
                y + Math.sin(a) * d,
                ringSize
            );
        }
    },
    init: function(id, x, y, ringSize)
    {
        initEntities();

        var array = Entities.getArray();

        var ownerId = array[id + _OWNER];
        if (ownerId > 0)
        {
            Entities.callback(Date.now(), ownerId, id, -1);
            array[id + _OWNER] = -1;
        }

        array[id + _TYPE] = EntityType.EXPLOSION;
        array[id + _X] = x;
        array[id + _Y] = y;
        array[id + _START] = 0;
        array[id + _DATA] = ringSize;

        Sounds.play(Sounds.EXPLOSION);

    }
};
module.exports = Explosion;
