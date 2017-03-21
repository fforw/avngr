const {_TYPE, _X, _Y, _DX, _DY, _DATA, _DATA2, _OWNER, _START, _SIZE_OF} = require("../entities/constants");

module.exports = function (ctx, tree)
{
    const game = ctx.game;
    const array = ctx.array;
    const playerId = game.player.entityId;

    tree.playerX = array[playerId + _X];
    tree.playerY = array[playerId + _Y];

    return true;
};
