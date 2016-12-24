const {_TYPE, _X, _Y, _DX, _DY, _DATA, _START, _SIZE_OF} = require("./constants");

const Vector = require("../util/vector");
const Images = require("../images");
var Entities;
var EntityType;

var images, offsets = [];


function init()
{
    if (!Entities)
    {
        Entities = require("./index");
        EntityType = Entities.EntityType
    }

    if (!images)
    {
        images = Images.getById([
            "collateral",
            "collateral2",
            "collateral3"
        ]);

        for (var i = 0; i < images.length; i++)
        {
            var img = images[i];
            offsets[i] = {
                x: -img.width/2,
                y: -img.height/2
            }
        }

    }
}

module.exports = {
    init: function (array, off, x, y, game)
    {
        init();

        array[off + _DATA] = (game.random.random() * 3) | 0;
    },
    render: function (ctx, now, viewAABB, array, id, image)
    {
        var x = array[id + _X];
        var y = array[id + _Y];
        var type = array[id + _DATA];

        var offset = offsets[type];
        ctx.drawImage(images[type], x + offset.x, y + offset.y )
    }
};

