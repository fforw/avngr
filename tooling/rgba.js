
module.exports = function(color, opacity)
{
    var m, r, g, b, hex;

    if (opacity === undefined || opacity === 1)
    {
        return color;
    }

    m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/gi.exec(color);
    if (!m)
    {
        throw new Error("Invalid color: " + color);
    }


    hex = m[1];
    if (hex.length === 3)
    {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    }
    else
    {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4), 16);
    }

    return "rgba(" + r + "," + g + "," + b + "," +  opacity + ")";
};

