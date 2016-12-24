const {_TYPE, _X, _Y,_DX,_DY, _DATA, _SIZE_OF} = require("./constants");

const Score = require("../score");
const LevelState = require("../level-state");
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
    //render: function (ctx, now, viewAABB, array, id, image)
    //{
    //    var x0 = array[id + _X];
    //    var y0 = array[id + _Y];
    //    var x1 = array[id + _DX];
    //    var y1 = array[id + _DY];
    //
    //    ctx.save();
    //    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    //    ctx.strokeRect(x0,y0,x1-x0,y1-y0);
    //    ctx.restore();
    //},
    callback: function(now, array, ownerId, id, targetId, game)
    {
        game.levelState = LevelState.ENDED;
    },
    update: function (now, array, id, game)
    {
        initEntities();

        var x0 = array[id + _X];
        var y0 = array[id + _Y];
        var x1 = array[id + _DX];
        var y1 = array[id + _DY];

        var playerId = game.player.entityId;
        var playerX = array[playerId + _X];
        var playerY = array[playerId + _Y];

        //console.log(playerX, playery, x0, y0, x1, y1);

        if ( playerX >= x0 && playerY >= y0 && playerX < x1 && playerY < y1)
        {
            if (game.levelState === LevelState.RUNNING)
            {
                game.levelState = LevelState.ENDING;
                Score.create(EntityType.SCORE_1000, playerX, playerY, game, id);
            }
            array[playerId + _DX] *= 0.99;
            array[playerId + _DY] *= 0.99;
        }
    }
};
