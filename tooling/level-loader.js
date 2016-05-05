var jsdom = require("jsdom");
var svgPath = require("svgpath");
var svgUtil = require("./svg");

const LINEARIZATION_THRESHOLD = 5;

function linearizePath(path, threshold)
{
    var vertices = [];

    threshold = threshold || 6;

    path.iterate(function (segment, index, curX, curY)
    {

        var command = segment[0];

        var i, x, y, x2, y2, x3, y3, x4, y4, relative, short;
        var v = [];

        //noinspection FallThroughInSwitchStatementJS
        switch (command)
        {
            case "M":
                for (i = 1; i < segment.length; i += 2)
                {
                    x = segment[i];
                    y = segment[i + 1];

                    vertices.push(x, y);

                    curX = x;
                    curY = y;
                }
                break;
            case "L":
                for (i = 1; i < segment.length; i += 2)
                {
                    v.push(segment[i], segment[i+1]);
                }
                break;
            case "Z":
                break;
            case "Q":
                short = true;
            // intentional fallthrough
            case "C":
                for (i = 1; i < segment.length; i += 6)
                {
                    x = curX;
                    y = curY;
                    x2 = segment[i];
                    y2 = segment[i + 1];
                    x3 = short ? x2 : segment[i + 2];
                    y3 = short ? y2 : segment[i + 3];
                    x4 = short ? segment[i + 2] : segment[i + 4];
                    y4 = short ? segment[i + 3] : segment[i + 5];

                    v.push(x,y);

                    svgUtil.adaptiveLinearization(x,y,x2,y2,x3,y3,x4,y4, threshold, function (x1,y1,x2,y2)
                    {
                        v.push(x2,y2);
                    });

                    curX = x;
                    curY = y;
                }
                break;
            default:
                throw new Error("path command '" + command + "' not supported yet");

        }

        //console.log("SEGMENT ", segment, v);

        vertices = vertices.concat(v);

    }, true);

    return vertices;
}
module.exports = function (source)
{
    this.cacheable();

    var done = this.async();

    if (!done)
    {
        throw new Error("Can't do non async due to jsdom.env");
    }
    var resourcePath = this.resourcePath;

    jsdom.env({
            html: source,
            done: function (errors, window)
            {
                if (errors)
                {
                    return done(errors);
                }

                var document = window.document;

                var objects = [];

                var paths = document.querySelectorAll("path");

                for (var i = 0; i < paths.length; i++)
                {
                    var pathElem = paths[i];

                    var path = svgPath(pathElem.getAttribute("d"));

                    path = svgUtil.transformPath(path, pathElem).unarc().abs();

                    var vertices = linearizePath(path, LINEARIZATION_THRESHOLD);

                    var style = svgUtil.parseStyle(pathElem.getAttribute("style"));

                    if (style.fillStyle || style.strokeStyle)
                    {
                        objects.push({
                            type: path.tagName,
                            style: style,
                            vertices: vertices
                        });
                    }
                }

                var boni = [];

                paths = document.querySelectorAll(".bonus");

                for (i = 0; i < paths.length; i++)
                {
                    pathElem = paths[i];
                    boni.push(
                        svgUtil.transformPoint( +pathElem.getAttribute("cx"), +pathElem.getAttribute("cy"), pathElem)
                    );
                }

                var player = document.querySelector("#player");

                var output = {
                    path: resourcePath,
                    player: player && svgUtil.transformPoint(+player.getAttribute("cx"), +player.getAttribute("cy"), pathElem),
                    objects: objects,
                    boni: boni
                };

                var moduleSource = "module.exports = (" + JSON.stringify(output, null, "    ") + ")";

//                console.log(moduleSource);

                done(null, moduleSource)
            }
        }
    );
};
