const {_TYPE, _X, _Y, _DX, _DY, _DATA, _START, _SIZE_OF} = require("./entities/constants");

const Sounds = require("./sounds");

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

var Score = {
    score: 0,

    create: function(type, x, y, game, ownerId)
    {
        init();
        var id = Entities.create(type, x,y);
        Score.toScore(id, type, game, ownerId);
        return id;
    },
    toScore: function( id, type, game, ownerId)
    {
        init();
        var array = Entities.getArray();

        array[id + _TYPE] = type;
        array[id + _START] = Date.now();
        array[id + _DX] = 0;
        array[id + _DY] = -0.4;
        array[id + _DATA] = ownerId || -1;

        var score;

        if (type === EntityType.SCORE_100)
        {
            score = 100;
        }
        else if (type === EntityType.SCORE_200)
        {
            score = 200;
        }
        else if (type === EntityType.SCORE_500)
        {
            score = 500;
        }
        else if (type === EntityType.SCORE_1000)
        {
            score = 1000;
        }

        Score.score += score;
        Sounds.play(Sounds.COIN);
    }
};
module.exports = Score;
