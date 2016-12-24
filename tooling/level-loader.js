var jsdom = require("jsdom");
var svgPath = require("svgpath");
var svgUtil = require("./svg");

const LINEARIZATION_THRESHOLD = 5;

function linearizePath(path, threshold, repeat)
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
                //console.log("M segment", segment);
                for (i = 1; i < segment.length; i += 2)
                {
                    x = segment[i];
                    y = segment[i + 1];

                    v.push(x, y);

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
                //console.log("C segment", segment);
                for (i = 1; i < segment.length; i += short ? 4 : 6)
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
                        x = x2;
                        y = y2;
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
        throw new Error("This plugin needs to work async.");
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

                var sceneObjects = [];

                var paths = document.querySelectorAll("path");

                for (var i = 0; i < paths.length; i++)
                {
                    var pathElem = paths[i];

                    var hasObjClass = Array.prototype.indexOf.call(pathElem.classList, "obj") >= 0;
                    //console.log("hasObjClass", hasObjClass);
                    if (pathElem.id === "player" || hasObjClass)
                    {
                        continue;
                    }

                    //console.log("ID", pathElem.id);

                    var style = svgUtil.parseStyle(pathElem.getAttribute("style"));

                    if (style.fillStyle || style.strokeStyle)
                    {
                        var path = svgPath(pathElem.getAttribute("d"));

                        path = svgUtil.transformPath(path, pathElem).unarc().unshort().abs();

                        vertices = linearizePath(path, LINEARIZATION_THRESHOLD);

                        // repeat first points
                        vertices.push(vertices[0], vertices[1]);

                        sceneObjects.push({
                            type: path.tagName,
                            style: style,
                            vertices: vertices
                        });
                    }
                }

                var entities = {};

                paths = document.querySelectorAll(".obj");

                for (i = 0; i < paths.length; i++)
                {
                    var objElem = paths[i];

                    var classes = objElem.className;

                    //console.log("CLASSES", classes);
                    var m = /obj:([^ ]+)/.exec(classes);

                    if (m)
                    {
                        var type = m[1];
                        var array = entities[type];
                        if (!array)
                        {
                            array = [];
                            entities[type] = array;
                        }

                        if (objElem.tagName === "rect")
                        {
                            var x = +objElem.getAttribute("x");
                            var y = +objElem.getAttribute("y");
                            var width = +objElem.getAttribute("width");
                            var height = +objElem.getAttribute("height");

                            path = svgPath("M"+x+","+y+" L"+(x+width)+","+y+" L"+(x+width)+","+(y+height)+" L"+x+","+(y+height)+"Z");
                            path = svgUtil.transformPath(path, objElem);

                            vertices = linearizePath(path, LINEARIZATION_THRESHOLD);

                            array.push(
                                {
                                    vertices: vertices
                                }
                            );
                        }
                        else if (objElem.tagName === "path")
                        {
                            path = svgPath(objElem.getAttribute("d"));
                            path = svgPath(svgUtil.transformPath(path, objElem).unarc().unshort().abs().toString());
                            //console.log("parse " + type);
                            vertices = linearizePath(path, 10);

                            // repeat first points
                            vertices.push(vertices[0], vertices[1]);

                            array.push(
                                {
                                    x: vertices[0],
                                    y: vertices[1],
                                    vertices: vertices
                                }
                            );
                        }
                        else
                        {
                            array.push(
                                svgUtil.transformPoint( +objElem.getAttribute("cx"), +objElem.getAttribute("cy"), objElem)
                            );
                        }
                    }
                }
                var playerElem = document.querySelector("#player");

                var player = null;
                if (playerElem)
                {
                    var playerPath = svgPath(playerElem.getAttribute("d"));
                    playerPath = svgUtil.transformPath(playerPath, playerElem).abs();

                    var vertices = linearizePath(playerPath, LINEARIZATION_THRESHOLD);
                    var centerX = 0, centerY = 0;
                    var len = vertices.length;
                    for (var i = 0; i < len; i+=2)
                    {
                        centerX += vertices[i];
                        centerY += vertices[i+1];
                    }

                    centerX /= len/2;
                    centerY /= len/2;

                    //console.log("player", vertices);

                    player = {
                        x: centerX,
                        y: centerY,
                        dx : Math.sign(vertices[2] - vertices[0])
                    }
                }

                var svgElem = document.querySelector("svg");
                var output = {
                    path: resourcePath,
                    player: player,
                    objects: sceneObjects,
                    entities: entities,
                    width: +svgElem.getAttribute("width"),
                    height: +svgElem.getAttribute("height")
                };

                var moduleSource = "module.exports = (" + JSON.stringify(output, null, "    ") + ")";

//                console.log(moduleSource);

                done(null, moduleSource)
            }
        }
    );
};
