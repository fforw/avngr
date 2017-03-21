const {_TYPE, _X, _Y, _DX, _DY, _DATA, _DATA2, _OWNER, _START, _SIZE_OF} = require("../entities/constants");

module.exports = function (ctx, tree)
{
    const game = ctx.game;
    const array = ctx.array;
    const id = ctx.id;
    const level = game.level;

    let x = array[id + _X];
    let y = array[id + _Y];

    const playerId = game.player.entityId;

    let playerX = array[playerId + _X];
    let playerY = array[playerId + _Y];

    return (level.sightLine(x, y, playerX, playerY));
};
