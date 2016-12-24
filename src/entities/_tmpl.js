const {_TYPE, _X, _Y, _DX, _DY, _DATA, _DATA2, _START, _SIZE_OF} = require("./constants");

const TAU = Math.PI * 2;

const _ACTIVE = _DATA;
const _ANGLE = _DATA2;

const Vector = require("../util/vector");
const Explosion = require("../explosion");
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

// NEW HANDLER
module.exports = {
    init: function (array, id, x, y)
    {

    },

    render: function (ctx, now, viewAABB, array, id, image)
    {
        initEntities();
    },

    update: function (now, array, id, game)
    {
        initEntities();
    }
};

