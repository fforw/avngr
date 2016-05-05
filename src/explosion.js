
var EXPLOSION_TIME = 600;
var EXPLOSION_MIN_SIZE = 4;
var EXPLOSION_MAX_SIZE = 16;

const TAU = Math.PI * 2;
const EXPLOSION_RANGE = EXPLOSION_MAX_SIZE - EXPLOSION_MIN_SIZE;

module.exports = {
    create: function(now, x, y, w, h, size)
    {

        var vertices = new Array(size * 3);
        for (var i=0; i < vertices.length ; i+= 3)
        {
            var ringSize = size == 1 ? 1 : Math.random();
            var a = Math.random() * TAU;
            var d = w / ( 3 + (1 - ringSize));
            vertices[i    ] = x + Math.cos(a) * d;
            vertices[i + 1] = y + Math.sin(a) * d;
            vertices[i + 2] = ringSize;
        }

        return {
            start: now,
            vertices: vertices
        };
    },
    render: function (ctx, explosion, now)
    {
        if (!explosion)
        {
            return false;
        }

        var size, delta = now - explosion.start;
        if (delta < EXPLOSION_TIME * 2)
        {
            if (delta < EXPLOSION_TIME)
            {
                size = delta / EXPLOSION_TIME;
                size = size * size;
            }
            else
            {

                size = 1 - (delta - EXPLOSION_TIME)/ EXPLOSION_TIME;
            }

            ctx.fillStyle = "rgba(255, 204, 0, 0.66)";
            ctx.strokeStyle = "rgba(255,32,0, 0.5)";


            var vertices = explosion.vertices;
            //console.log("RENDER", vertices, size);

            for (var i = 0; i < vertices.length; i+= 3)
            {
                ctx.beginPath();
                ctx.arc(vertices[i], vertices[i + 1], EXPLOSION_MIN_SIZE + size * vertices[i + 2] * (EXPLOSION_RANGE), 0, TAU);
                ctx.fill();
                ctx.stroke();
            }

            return false;
        }

        console.log("explosion end");
        return true;
    }
};
