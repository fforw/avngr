const Shape = require("./shape");

const Entities = require("./entities");
const EntityType = require("./entities/type");

const {_TYPE, _X, _Y, _DX, _DY, _DATA, _START, _SIZE_OF} = require("./entities/constants");

function Player(defPos)
{
    this.shape = Shape.ellipse(9, 5, 8);
    this.entityId = Entities.create(EntityType.PLAYER, defPos.x, defPos.y);
    Entities.getArray()[this.entityId + _DATA] = 100;
    Entities.getArray()[this.entityId + _DX] = defPos.dx < 0 ? -0 : 0;
}

Player.prototype.getAABB = function()
{
    var array = Entities.getArray();
    return this.shape.aabb.offset(array[this.entityId + _X], array[this.entityId + _Y]);
};

module.exports = Player;
