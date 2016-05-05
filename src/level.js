var AABB = require("./util/aabb");

const COLLISION_PUSH = 0.2;

const TAU = Math.PI * 2;


function Level(data)
{
    this.path = data.path;
    this.player = data.player;

    var objects = data.objects;

    for (var i = 0; i < objects.length; i++)
    {
        var obj = objects[i];
        obj.aabb = AABB.fromArray(obj.vertices);
    }

    this.objects = objects;
}

Level.prototype.render = function (ctx, viewAABB)
{
    ctx.save();

    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#000";
    ctx.lineWidth = 1;

    ctx.translate( -viewAABB.x0, -viewAABB.y0);

    var objects = this.objects;
    for (var i = 0; i < objects.length; i++)
    {
        var obj = objects[i];
        var style = obj.style;
        var vertices = obj.vertices;

        if (viewAABB.intersects(obj.aabb))
        {
            for (var name in style)
            {
                if (style.hasOwnProperty(name))
                {
                    ctx[name] = style[name];
                }
            }

            ctx.beginPath();
            ctx.moveTo(vertices[0],vertices[1]);

            for (var j = 2; j < vertices.length; j+=2)
            {
                ctx.lineTo(vertices[j], vertices[j + 1]);
            }
            ctx.lineTo(vertices[0], vertices[1  ]);

            if (style.strokeStyle)
            {
                ctx.stroke();
            }
            if (style.fillStyle)
            {
                ctx.fill();
            }
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
