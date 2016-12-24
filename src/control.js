var keyState = {

};

var Mapping = [null,
    [87, 38],
    [65, 37],
    [83,40],
    [68,39],
    [32],
    [66]
];

const USED_CODES = (function ()
{
    var codes = {};
    for (var i = 1; i < Mapping.length; i++)
    {
        var keys = Mapping[i];
        for (var j = 0; j < keys.length; j++)
        {
            codes[keys[j]] = true;
        }
    }

    console.log("MAPPED KEY CODES", codes);

    return codes;
})();


// controls that trigger only once and need to be released to retrigger
var controlsExecuteOnce = {
    5: true,
    6: true
};


var Control = {

    UP: 1,
    LEFT: 2,
    DOWN: 3,
    RIGHT: 4,
    ACTION_A: 5,
    ACTION_B: 6,

    isActive: function (ctrl)
    {
        var keys = Mapping[ctrl];

        if (!keys)
        {
            return false;
        }

        for (var i = 0; i < keys.length; i++)
        {
            if (keyState[keys[i]])
            {
                if (controlsExecuteOnce[ctrl])
                {
                    keyState[keys[i]] = null;
                }
                //console.log("ACTIVE:", ctrl )
                return true;
            }
        }
        return false;
    },

    onKeyDown: function (ev)
    {
        var keyCode = ev.keyCode;
        if (!USED_CODES.hasOwnProperty(String(keyCode)) || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.metaKey)
        {
            return;
        }
        ev.preventDefault();
        if (keyState[keyCode] !== null)
        {
            keyState[keyCode] = true;
        }
        return false;
    },
    onKeyUp: function (ev)
    {
        var keyCode = ev.keyCode;

        if (!USED_CODES.hasOwnProperty(String(keyCode)) || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.metaKey)
        {
            return;
        }
        ev.preventDefault();
        keyState[keyCode] = false;
        return false;
    }
};
module.exports = Control;
