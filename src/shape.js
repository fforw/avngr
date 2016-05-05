
const AABB = require("./util/aabb");

const TAU = Math.PI * 2;

/**
 * Create ellipse shape
 * @param width         ellipse width
 * @param height        ellipse height
 * @param numPoints     number of control points on the ellipse
 * @returns {{points: Array, aabb}}
 */
function ellipse(width, height, numPoints)
{
    var step = TAU / numPoints;
    var pts = [];
    for (var a = 0; a < TAU; a += step)
    {
        pts.push(
            Math.cos(a) * width,
            Math.sin(a) * height
        );
    }
    return {
        points: pts,
        aabb: AABB.fromArray(pts)
    };
}

/**
 *  Simple shape based collision based on a list of collision point offsets and the resulting AABB box for quick checking.
 * @type {{ellipse: ellipse, circle: module.exports.circle}}
 */
module.exports = {
    ellipse: ellipse,
    /**
     * Creates a circle shape
     *
     * @param radius
     * @param numPoints
     * @returns {{points: Array, aabb}}
     */
    circle: function(radius, numPoints)
    {
        return ellipse(radius, radius, numPoints);
    }
};
