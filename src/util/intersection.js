var Vector = require("./vector");

var Math_sqrt = Math.sqrt;

/**
 * findLineCircleIntersections result structure
 *
 * @param a         intersection point on the side of the first point or null
 * @param b         intersection point on the side of the second point or null
 * @param tangent   line is a tangent and a is the only intersection
 * @param inside    (?bool) in the case of no intersection, this is true if both points are inside the circle, false otherwise
 * @constructor
 */
function Result(a,b, tangent, inside)
{
    this.a = a;
    this.b = b;
    this.tangent = tangent;
    this.inside = inside;
}

var EMPTY_OUTSIDE = new Result(null,null,false, false);
var EMPTY_INSIDE = new Result(null,null,false, true);

module.exports = {
    pointInPolygon: function (pt, points)
    {

        var x = pt.x;
        var y = pt.y;
        var len = points.length;
        var i, j = len - 1;
        var oddNodes = false;
        for (i = 0; i < len; i++)
        {
            if (points[i].y < y && points[j].y >= y || points[j].y < y && points[i].y >= y)
            {
                if (points[i].x + (y - points[i].y) / (points[j].y - points[i].y) * (points[j].x - points[i].x) < x)
                {
                    oddNodes = !oddNodes;
                }
            }
            j = i;
        }
        return oddNodes;
    },
    /**
     * Full Line / circle intersection test returning intersection coordinates
     *
     * @param cx
     * @param cy
     * @param radius
     * @param x0
     * @param y0
     * @param x1
     * @param y1
     * @returns {Result}
     */
    findLineCircleIntersections: function (cx, cy, radius, x0, y0, x1, y1)
    {
        var dx, dy, A, B, C, det, t, vA, vB, detRoot, xt, yt;

        dx = x1 - x0;
        dy = y1 - y0;

        A = dx * dx + dy * dy;

        xt = (x0 - cx);
        yt = (y0 - cy);

        B = 2 * (dx * xt + dy * yt);
        C = xt * xt + yt * yt - radius * radius;

        det = B * B - 4 * A * C;
        if (det == 0)
        {
            // One solution.
            t = -B / (2 * A);
            if (t >= 0 && t <=1)
            {
                return new Result(new Vector(x0 + t * dx, y0 + t * dy), null, true, null);
            }
        }
        else if (det > 0)
        {
            // Two solutions.
            vA = null;
            vB = null;
            detRoot = Math_sqrt(det);
            t = (-B + detRoot) / (2 * A);
            if (t >= 0 && t <= 1)
            {
                vA = new Vector(x0 + t * dx, y0 + t * dy)
            }
            t = (-B - detRoot) / (2 * A);
            if (t >= 0 && t <= 1)
            {
                vB = new Vector(x0 + t * dx, y0 + t * dy);
            }
            if (vA || vB)
            {
                return new Result(vA, vB, false, null);
            }
        }
        return C < 0 ? EMPTY_INSIDE : EMPTY_OUTSIDE;
    },
    /**
     * Binary test for line / circle intersections
     *
     * @param cx
     * @param cy
     * @param radius
     * @param x0
     * @param y0
     * @param x1
     * @param y1
     * @returns {boolean}
     */
    lineIntersectsCircle: function (cx, cy, radius, x0, y0, x1, y1)
    {
        var dx, dy, A, B, C, det, t, xt, yt;

        dx = x1 - x0;
        dy = y1 - y0;

        A = dx * dx + dy * dy;

        xt = (x0 - cx);
        yt = (y0 - cy);

        B = 2 * (dx * xt + dy * yt);
        C = xt * xt + yt * yt - radius * radius;

        det = B * B - 4 * A * C;
        if (det == 0)
        {
            // One solution.
            t = -B / (2 * A);
            if (t >= 0 && t <=1)
            {
                return true;
            }
        }
        else if (det > 0)
        {
            // Two solutions.
            return true;
        }
        return false;
    }
};

