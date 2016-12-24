var AABB = require("./util/aabb");

const COLLISION_PUSH = 0.2;

const TAU = Math.PI * 2;

const SCALE = 1.07;

const Colors = require("./colors");

var gradients = {};

const BACK = 1;
const FRONT = 1/SCALE;

const LIGHT_COLOR = Colors.rgba("#ffe",1);
const SHADOW_COLOR = Colors.rgba("#447",1);

const FRONT_OFF_Y = 5;

const RASTER_RESOLUTION = 24;

function Level(data)
{


    this.path = data.path;
    this.player = data.player;

    var objects = data.objects;

    var aabb = new AABB(0,0,0,0);

    for (var i = 0; i < objects.length; i++)
    {
        var obj = objects[i];
        obj.aabb = AABB.fromArray(obj.vertices);

        aabb.merge(obj.aabb);
    }

    this.objects = objects;

    this.createScaled();

    this.aabb = aabb;

    this.width = data.width;
    this.height = data.height;

    this.raster = this.createRaster();
}

function scaleVertex(v)
{
    return v * SCALE;
}

Level.prototype.createScaled = function()
{
    for (var i = 0; i < this.objects.length; i++)
    {
        var obj = this.objects[i];
        obj.scaled = obj.vertices.map(scaleVertex);
    }
};

Level.prototype.checkRaster = function(x,y)
{
    var aabb = this.aabb;

    x = ((x - aabb.x0)/RASTER_RESOLUTION)|0;
    y = ((y - aabb.y0)/RASTER_RESOLUTION)|0;

    var result;
    if (x < 0 || x > this.rasterWidth || y < 0 || y > this.rasterHeight)
    {
        result = false;
    }
    else
    {
        result = this.raster[y * this.rasterWidth + x];
    }

    return result;
};

Level.prototype.setRaster = function(x,y,v)
{
    var aabb = this.aabb;

    x = ((x - aabb.x0)/RASTER_RESOLUTION)|0;
    y = ((y - aabb.y0)/RASTER_RESOLUTION)|0;

    var result;
    if (!(x < 0 || x > this.rasterWidth || y < 0 || y > this.rasterHeight))
    {
        this.raster[y * this.rasterWidth + x] = !!v;
    }
};


Level.prototype.validRasterPosition = function (x,y)
{
    return x >= 0 && x <= this.rasterWidth && y >= 0 && y <= this.rasterHeight;
};

Level.prototype.sightLine = function (x0, y0, x1, y1)
{
    var aabb = this.aabb;

    x0 = ((x0 - aabb.x0)/RASTER_RESOLUTION)|0;
    y0 = ((y0 - aabb.y0)/RASTER_RESOLUTION)|0;
    x1 = ((x1 - aabb.x0)/RASTER_RESOLUTION)|0;
    y1 = ((y1 - aabb.y0)/RASTER_RESOLUTION)|0;

    var dx = Math.abs(x1-x0);
    var dy = Math.abs(y1-y0);
    var sx = (x0 < x1) ? 1 : -1;
    var sy = (y0 < y1) ? 1 : -1;
    var err = dx-dy;

    while(true)
    {
        if (this.validRasterPosition(x0,y0) && !this.raster[y0 * this.rasterWidth + x0])
        {
            return false;
        }
        //setPixel(x0,y0);

        if ((x0 == x1) && (y0 == y1))
        {
            return true;
        }
        var e2 = 2 * err;
        if (e2 > -dy)
        {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx)
        {
            err += dx;
            y0 += sy;
        }
    }
};


Level.prototype.createRaster = function()
{
    var aabb = this.aabb;
    var hr = RASTER_RESOLUTION / 2;

    var w = Math.ceil((aabb.x1 - aabb.x0) / RASTER_RESOLUTION);
    var h = Math.ceil((aabb.y1 - aabb.y0) / RASTER_RESOLUTION);

    this.rasterWidth = w;
    this.rasterHeight = h;

    var array = new Array( w * h);

    var pos= 0;
    for (var y = aabb.y0; y < aabb.y1; y += RASTER_RESOLUTION)
    {
        for (var x = aabb.x0; x < aabb.x1; x += RASTER_RESOLUTION)
        {
            array[pos++] = (
                !this.collide(                    x + hr, y + hr) &&
                !this.collide(                         x, y) &&
                !this.collide( x + RASTER_RESOLUTION - 1, y) &&
                !this.collide( x + RASTER_RESOLUTION - 1, y + RASTER_RESOLUTION - 1) &&
                !this.collide(                         x, y + RASTER_RESOLUTION - 1)
            );
        }
    }

    return array;
};

Level.prototype.drawRaster = function(ctx, viewAABB)
{
    var aabb = this.aabb;

    var w = this.rasterWidth;
    var h = this.rasterHeight;

    ctx.save();
    ctx.translate(-viewAABB.x0, -viewAABB.y0);

    ctx.globalAlpha = 0.2;

    var xStart = Math.floor((viewAABB.x0 - aabb.x0)/ RASTER_RESOLUTION);
    var yStart = Math.floor((viewAABB.y0 - aabb.y0)/ RASTER_RESOLUTION);
    var xEnd = Math.floor((viewAABB.x1 - aabb.x0)/ RASTER_RESOLUTION);
    var yEnd = Math.floor((viewAABB.y1 - aabb.y0)/ RASTER_RESOLUTION);


    for (var y = yStart; y <= yEnd; y++)
    {
        for (var x = xStart; x <= xEnd; x++)
        {
            if (x > 0 && y > 0 && x < w && y < h)
            {
                ctx.fillStyle = this.raster[y * w + x] ? "#080" : "#800";
                ctx.fillRect(x * RASTER_RESOLUTION + aabb.x0, y * RASTER_RESOLUTION + aabb.y0, RASTER_RESOLUTION, RASTER_RESOLUTION);
            }
        }
    }

    ctx.restore();
};

function getGradient(color)
{
    var str = Colors.renderColor(color);

    var gradient = gradients[str];
    if (!gradient)
    {
        gradient =
            Colors.lightGradient(color, SHADOW_COLOR, LIGHT_COLOR, 256, 0.5, 1, 0.5)
            .map(Colors.renderColor);
        gradients[str] = gradient;
    }

    return gradient;
}

const DEG2RAD_FACTOR = TAU / 360;


function lightValue(x1,y1,z1,x2,y2,z2)
{
    return Math.cos(Math.atan2(
        z1 * x2 - x1 * z2,
        y1 * z2 - z1 * y2
    ) + 135 * DEG2RAD_FACTOR);
}



function drawFace(ctx, gradient, x0, y0, z0, x1, y1, z1, x2, y2, z2)
{
    if (((x2 - x0) * (y1 - y0) - (y2 - y0) * (x1 - x0)) <= 0)
    {
        return;
    }

    var v = lightValue(
            x1 - x0,
            y1 - y0,
            z1 - z0,
            x2 - x0,
            y2 - y0,
            z2 - z0
        );

    if (v !== null)
    {
        var idx = 128 + (v * 127)|0;
        var color = gradient[idx];

        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        ctx.beginPath();
        ctx.moveTo(x0,y0);
        ctx.lineTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.lineTo(x0,y0);
        ctx.fill();
        ctx.stroke();
    }
}


function drawSides(ctx, front, back, viewAABB, gradient)
{
    var backX = -viewAABB.x0;
    var backY = -viewAABB.y0;
    var frontX = -viewAABB.x0 * SCALE + (viewAABB.x1 - viewAABB.x0) / 2 * (1 - SCALE);;
    var frontY = -viewAABB.y0 * SCALE + FRONT_OFF_Y;

    var scaledLength = front.length;

    if (scaledLength < back.length || scaledLength >= back.length * 2)
    {
        throw new Error("Scaled Length must be between back length and twice that");
    }

    // precise step
    var step = scaledLength / back.length;

    var bx = back[0];
    var by = back[1];


    ctx.save();

    var lastFrontIndex = 0;
    var off = 1;
    var lastI = 0;
    for (var i= 2; i < back.length; i+=2)
    {
        var frontIndex = (off|0);

        if (frontIndex - lastFrontIndex == 2)
        {
            var frontMiddleIndex = lastFrontIndex + 1;

            drawFace(ctx, gradient,
                back[lastI] + backX, back[lastI + 1] + backY, BACK,
                front[lastFrontIndex*2] + frontX, front[lastFrontIndex*2 + 1] + frontY, FRONT,
                front[frontMiddleIndex*2] + frontX, front[frontMiddleIndex*2 + 1] + frontY, FRONT
            );
            drawFace(ctx, gradient,
                back[lastI] + backX, back[lastI + 1] + backY, BACK,
                front[frontMiddleIndex*2] + frontX, front[frontMiddleIndex*2 + 1] + frontY, FRONT,
                back[i] + backX, back[i + 1] + backY, BACK
            );
            drawFace(ctx, gradient,
                back[i] + backX, back[i + 1] + backY, BACK,
                front[frontMiddleIndex*2] + frontX, front[frontMiddleIndex*2 + 1] + frontY, FRONT,
                front[frontIndex*2] + frontX, front[frontIndex*2 + 1] + frontY, FRONT
            );
        }
        else if (frontIndex - lastFrontIndex == 1)
        {
            drawFace(ctx, gradient,
                back[lastI] + backX, back[lastI + 1] + backY, BACK,
                front[lastFrontIndex*2] + frontX, front[lastFrontIndex*2 + 1] + frontY, FRONT,
                back[i] + backX, back[i + 1] + backY, BACK
            );
            drawFace(ctx, gradient,
                back[i] + backX, back[i + 1] + backY, BACK,
                front[lastFrontIndex*2] + frontX, front[lastFrontIndex*2 + 1] + frontY, FRONT,
                front[frontIndex*2] + frontX, front[frontIndex*2 + 1] + frontY, FRONT
            );
        }
        else
        {
            throw new Error("This shouldn't happen");
        }

        lastFrontIndex = frontIndex;
        off += step;
        lastI = i;
    }
}

Level.prototype.render = function (ctx, viewAABB)
{
    ctx.save();

    var objects = this.objects;
    for (var i = 0; i < objects.length; i++)
    {
        var obj = objects[i];
        var style = obj.style;

        if (viewAABB.intersects(obj.aabb))
        {
            var gradient = getGradient(style.fillStyle);

            drawSides(ctx, obj.scaled, obj.vertices, viewAABB, gradient);
        }
    }

    ctx.restore();
};

Level.prototype.renderFront = function (ctx, viewAABB)
{
    ctx.save();

    var objects = this.objects;
    for (var i = 0; i < objects.length; i++)
    {
        var obj = objects[i];
        var style = obj.style;

        if (viewAABB.intersects(obj.aabb))
        {
            for (var name in style)
            {
                if (style.hasOwnProperty(name))
                {
                    if (name === "strokeStyle" || name == "fillStyle")
                    {
                        ctx[name] = Colors.renderColor(style[name]);
                    }
                    else
                    {
                        ctx[name] = style[name];
                    }

                }
            }

            // draw FRONT

            ctx.save();
            ctx.globalAlpha = 0.8;
            var frontXOff = -viewAABB.x0 * SCALE + (viewAABB.x1 - viewAABB.x0) / 2 * (1 - SCALE);
            var frontYOff = -viewAABB.y0 * SCALE + FRONT_OFF_Y;
            ctx.translate(frontXOff,frontYOff);

            var vertices = obj.scaled;

            ctx.beginPath();
            ctx.moveTo(vertices[0],vertices[1]);

            for (let j = 2; j < vertices.length; j+=2)
            {
                ctx.lineTo(vertices[j], vertices[j + 1]);
            }
            ctx.lineTo(vertices[0], vertices[1  ]);
            //ctx.clip();
            ctx.fill();

            ctx.translate(-frontXOff - viewAABB.x0,-frontYOff - viewAABB.y0);

            ctx.strokeStyle = "#000";
            ctx.globalAlpha = 0.1;


            vertices = obj.vertices;


            ctx.beginPath();
            ctx.moveTo(vertices[0],vertices[1]);

            for (let j = 2; j < vertices.length; j+=2)
            {
                ctx.lineTo(vertices[j], vertices[j + 1]);
            }
            ctx.lineTo(vertices[0], vertices[1]);
            ctx.stroke();

            ctx.restore();

        }
    }

    ctx.restore();
};



//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]

function isPointInPoly(poly, px, py){
    for(var c = false, i = -2, l = poly.length, j = l - 2; (i +=2) < l; j = i)
    {
        ((poly[i + 1] <= py && py < poly[j + 1]) || (poly[j + 1] <= py && py < poly[i + 1]))
        && (px < (poly[j] - poly[i]) * (py - poly[i + 1]) / (poly[j + 1] - poly[i + 1]) + poly[i])
        && (c = !c);
    }
    return c;
}

Level.prototype.collideAABB = function (x,y,shape)
{
    var collisionCount = 0;
    var fx = 0;
    var fy = 0;

    var shapeAABB = shape.aabb.offset(x,y);


    var objects = this.objects;
    for (var i = 0; i < objects.length; i++)
    {
        var obj = objects[i];
        if (shapeAABB.intersects(obj.aabb))
        {
            var pos = shapeAABB.center();
            var controlPoints = shape.points;
            for (var j = 0; j < controlPoints.length; j+=2)
            {
                var offX = controlPoints[j];
                var offY = controlPoints[j + 1];
                var px = pos.x + offX;
                var py = pos.y + offY;

                if (isPointInPoly(obj.vertices, px, py))
                {
                    fx -= offX * COLLISION_PUSH;
                    fy -= offY * COLLISION_PUSH;

                    collisionCount++;
                }
            }
        }
    }

    return {
        count: collisionCount,
        fx: fx,
        fy: fy
    };
};

Level.prototype.collide = function (x,y)
{
    var objects = this.objects;
    for (var i = 0; i < objects.length; i++)
    {
        var obj = objects[i];
        if (obj.aabb.inside(x,y))
        {
            if (isPointInPoly(obj.vertices, x, y))
            {
                return true;
            }
        }
    }

    return false;
};


module.exports = Level;
