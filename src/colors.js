
function mix(colorA, colorB, ratio)
{
    return {
        r: colorA.r + (colorB.r - colorA.r) * ratio,
        g: colorA.g + (colorB.g - colorA.g) * ratio,
        b: colorA.b + (colorB.b - colorA.b) * ratio,
        a: colorA.a + (colorB.a - colorA.a) * ratio
    };
}

var Colors = {
    /**
     * Converts the given color string to an rgba color
     *
     * @param color         {string} color string. can be #abc hex or rgb() or rgba()
     * @param opacity       {number?} opacity to use (default 1 or the alpha value of the given rgba())
     * @returns {{r: number, g: number, b: number, a: number}} rgba color object
     */
    rgba: function(color, opacity)
    {
        var m, r, g, b, hex;

        m = /^(#([0-9a-f]{3}|[0-9a-f]{6})|(rgb|rgba)\((.*)\))$/gi.exec(color);
        if (!m)
        {
            throw new Error("Invalid color: " + color);
        }

        var colorArgs = m[4];
        if (colorArgs)
        {

            //console.log("rgbaNums", rgbaNums);

            var nums = colorArgs.split(",").map(function(v) { return +v });

            var expected = m[3] === "rgb" ? 3 : 4

            if (nums.length !== expected)
            {
                throw new Error(m[3] + " must have " + expected + " arguments");
            }

            r = nums[0];
            g = nums[1];
            b = nums[2];
            opacity = opacity !== undefined ? opacity : nums.length == 4 ? nums[3] : 1;
        }
        else
        {
            hex = m[2];

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
        }

        return {
            r: r,
            g: g,
            b: b,
            a: opacity !== undefined ? opacity : 1
        };
    },
    /**
     * Renders a two phase color gradient based on a shadow color, a mid tone and light color.
     *
     * @param baseColor         mid color
     * @param shadowColor       shadow color
     * @param lightColor        light color
     * @param resolution        number of colors to generate
     * @param basePoint         position of the mid point within the range (0..1) (default 0.5)
     * @param maxShadow         maximum shadow weight (0..1) (default 0.9)
     * @param maxLight          maximum light weight (0..1) (default 0.5)
     * @returns {Array} array of rgba color objects
     */
    lightGradient: function (baseColor, shadowColor, lightColor, resolution, basePoint, maxShadow, maxLight)
    {
        basePoint = basePoint || 0.5;
        maxShadow = maxShadow || 0.9;
        maxLight = maxLight|| 0.5;


        basePoint = (basePoint * resolution)|0;

        var array = new Array(resolution);

        Colors.spread(shadowColor, maxShadow, baseColor, 1, array, 0, basePoint);
        Colors.spread(baseColor, 1, lightColor, maxLight, array, basePoint, resolution);

        return array;
    },
    /**
     * Renders the given color object as rgb/rgba string
     * @param color
     * @returns {string}
     */
    renderColor: function(color)
    {
        if (isNaN(color.r) || isNaN(color.g)|| isNaN(color.b))
        {
            console.error("Nan-Alert");
        }

        var rgbArgs = + Math.round(color.r) + ", " + Math.round(color.g) + ", " + Math.round(color.b);

        if (color.a === 1)
        {
            return "rgb("  + rgbArgs + ")";
        }
        else
        {
            return "rgba("  + rgbArgs + ", " + Math.round(color.a * 255)/255 + ")";
        }
    },
    /**
     * Base spread function.
     *
     * Will fill the array from start index inclusive to end index exclusive with the color
     * gradient defined by the given parameters.
     *
     * @param colorA    First color
     * @param maxA      Maximum weight for first color at start  (0..1)
     * @param colorB    second color
     * @param maxB      Maximum weight for second color at start (0..1)
     * @param array     array
     * @param start     start index
     * @param end       end index
     */
    spread: function (colorA, maxA, colorB, maxB, array, start, end)
    {
        var color = mix(colorA, colorB, 1 - maxA);
        var endColor = mix(colorA, colorB, maxB);

        var numSteps = ( end - start);
        var dr = ( endColor.r - color.r ) / numSteps;
        var dg = ( endColor.g - color.g ) / numSteps;
        var db = ( endColor.b - color.b ) / numSteps;
        var da = ( endColor.a - color.a ) / numSteps;

        for (var i = start; i < end; i++)
        {
            array[i] = {
                r: color.r,
                g: color.g,
                b: color.b,
                a: color.a
            };

            color.r += dr;
            color.g += dg;
            color.b += db;
            color.a += da;
        }
    }

};
module.exports = Colors;
