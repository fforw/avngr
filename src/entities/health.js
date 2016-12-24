const {_TYPE, _X, _Y,_DX,_DY, _SIZE_OF} = require("./constants");

module.exports = {
    update: function (now, array, id, game)
    {
        var x = array[id + _X] += (array[id + _DX] *= 0.99);
        var y = array[id + _Y] += (array[id + _DY] *= 0.99);

        if (game.level.collide(x + 8, y + 8))
        {
            array[id + _DX] = -array[id + _DX];
            array[id + _DY] = -array[id + _DY];
            array[id + _X] += array[id + _DX];
            array[id + _Y] += array[id + _DY];
        }
    }

};
