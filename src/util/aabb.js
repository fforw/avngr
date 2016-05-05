function AABB(x0,y0,x1,y1)
{
    this.x0 = Math.min(x0, x1);
    this.y0 = Math.min(y0, y1);
    this.x1 = Math.max(x0, x1);
    this.y1 = Math.max(y0, y1);
}

AABB.prototype.inside = function(x,y)
{
    return (
        x >= this.x0 && y >= this.y0 &&
        x < this.x1 && y < this.y1
    );
};

AABB.prototype.offset = function(x,y)
{
    return new AABB(this.x0 + x, this.y0 + y, this.x1 + x, this.y1 + y);
}

/**
 * Returns true if the given aabb intersects with this one.
 *
 * @param x0    {number|AABB} x0 coordinate or AABB
 * @param y0    {number?}
 * @param x1    {number?}
 * @param y1    {number?}
 * @returns {boolean}
 */
AABB.prototype.intersects = function(x0,y0,x1,y1)
{
    if (x0 instanceof AABB)
    {
        y0 = x0.y0;
        x1 = x0.x1;
        y1 = x0.y1;
        x0 = x0.x0;
    }

    return !(x0 > this.x1 ||
    x1 < this.x0 ||
    y0 > this.y1 ||
    y1 < this.y0);

};

AABB.fromArray = function(vertices)
{
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;

    for (var i = 0; i < vertices.length; i+=2 )
    {
        var x = vertices[i];
        var y = vertices[i+1];

        if (x < minX)
        {
            minX = x;
        }
        if (y < minY)
        {
            minY = y;
        }

        if (x > maxX)
        {
            maxX = x;
        }
        if (y > maxY)
        {
            maxY = y;
        }
    }
    return new AABB(minX, minY, maxX, maxY);
};

AABB.prototype.center = function ()
{
    return {
        x: (this.x0 + this.x1) / 2,
        y: (this.y0 + this.y1) / 2
    }
};

module.exports = AABB;
