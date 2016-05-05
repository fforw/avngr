
var jsdom = require("jsdom");
var svgPath = require("svgpath");
var rgba = require("./rgba");

var blacklist = {
    "fill-rule": true,
    "clip-rule": true,
    "display": true,
    "overflow": true,
    "visibility": true,
    "isolation": true,
    "mix-blend-mode": true,
    "color-interpolation": true,
    "color-interpolation-filters": true,
    "solid-color": true,
    "solid-opacity": true,
    "fill-opacity": true,
    "filter-blend-mode": true,
    "filter-gaussianBlur-deviation": true,
    "color-rendering": true,
    "image-rendering": true,
    "shape-rendering": true,
    "text-rendering": true,
    "stroke-linecap": true,
    "stroke-linejoin": true,
    "stroke-miterlimit": true,
    "stroke-dasharray": true,
    "stroke-dashoffset": true
};

function adaptiveLinearization(x1, y1, x2, y2, x3, y3, x4, y4, threshold, lineConsumer)
{
    if(Math.abs(x1 + x3 - x2 - x2) +
        Math.abs(y1 + y3 - y2 - y2) +
        Math.abs(x2 + x4 - x3 - x3) +
        Math.abs(y2 + y4 - y3 - y3) <= threshold)
    {
        // Draw and stop
        //----------------------
        lineConsumer(x1, y1, x4, y4);
    }
    else
    {
        // Calculate all the mid-points of the line segments
        //----------------------
        var x12   = (x1 + x2) / 2;
        var y12   = (y1 + y2) / 2;
        var x23   = (x2 + x3) / 2;
        var y23   = (y2 + y3) / 2;
        var x34   = (x3 + x4) / 2;
        var y34   = (y3 + y4) / 2;
        var x123  = (x12 + x23) / 2;
        var y123  = (y12 + y23) / 2;
        var x234  = (x23 + x34) / 2;
        var y234  = (y23 + y34) / 2;
        var x1234 = (x123 + x234) / 2;
        var y1234 = (y123 + y234) / 2;

        // Continue subdivision
        //----------------------
        adaptiveLinearization(x1, y1, x12, y12, x123, y123, x1234, y1234, threshold, lineConsumer);
        adaptiveLinearization(x1234, y1234, x234, y234, x34, y34, x4, y4, threshold, lineConsumer);
    }
}

var reNumeric = /^[0-9.]+$/g;

var SVGUtil = {
    parseStyle: function (str)
    {
        var regEx = /([a-z-]*):(.*?);/gi;

        var m;

        var styles = {};

        var strokeColor,strokeWidth,fillColor,opacity,strokeOpacity;

        while (m = regEx.exec(str))
        {
            var cssProp = m[1];
            var value = m[2];

            if (!blacklist.hasOwnProperty(cssProp))
            {
                if (reNumeric.exec(value))
                {
                    value = +value;
                }


                if (cssProp == "stroke")
                {
                    if (value !== "none" && value !== "transparent")
                    {
                        strokeColor = value;
                    }
                }
                else if (cssProp == "stroke-width")
                {
                    strokeWidth = +value;
                }
                else if (cssProp == "stroke-opacity")
                {
                    strokeOpacity = value;
                }
                else if (cssProp == "fill")
                {
                    fillColor = value;
                }
                else if (cssProp == "opacity")
                {
                    opacity = value;
                }

                if (fillColor && fillColor !== "none" && fillColor !== "transparent" && opacity !== 0)
                {
                    styles.fillStyle = rgba(fillColor, opacity);
                }

                if (strokeColor && strokeOpacity !== 0)
                {
                    styles.strokeStyle = rgba(strokeColor, strokeOpacity);
                    if (strokeWidth)
                    {
                        styles.lineWidth = strokeWidth;
                    }
                }
            }

        }

        //console.log("STYLES", styles);

        return styles;
    },

    transformPath: function (path, elem)
    {
        while (elem && elem.nodeType === 1)
        {
            var transform = elem.getAttribute("transform");
            if (transform)
            {
                //console.log("transform", transform);
                path = path.transform(transform);
            }
            elem = elem.parentNode;
        }

        return path;
    },

    transformPoint: function (x, y, pathElem)
    {
        var p = svgPath("M" + x + " " + y);

        p = SVGUtil.transformPath(p, pathElem);

        var m = /M([0-9.-]+)\s*([0-9.-]+)/.exec(p.toString());
        if (!m)
        {
            throw new Error("Extraction failed: " + x + ", " + y);
        }

        var result = {
            x: +m[1],
            y: +m[2]
        };

        //console.log("transformPoint", x,y, " => ", result);

        return result;
    },

    adaptiveLinearization: adaptiveLinearization
};
/**
 *
 * @type {{parseStyle: module.exports.parseStyle, transformPath: module.exports.transformPath, transformPoint: module.exports.transformPoint, adaptiveLinearization: adaptiveLinearization}}
 */
module.exports = SVGUtil;
