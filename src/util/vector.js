var Math_atan2 = Math.atan2;
var Math_sqrt = Math.sqrt;


function Vector(x, y)
{
    this.x = x;
    this.y = y;
}

Vector.prototype.add = function (x, y)
{
    if (y === undefined)
    {
        this.x += x.x;
        this.y += x.y;
    }
    else
    {
        this.x += x;
        this.y += y;
    }
    return this;
};

Vector.prototype.subtract = function (x, y)
{
    if (y === undefined)
    {
        this.x -= x.x;
        this.y -= x.y;
    }
    else
    {
        this.x -= x;
        this.y -= y;
    }
    return this;
};

Vector.prototype.scale = function (s)
{
    this.x *= s;
    this.y *= s;
    return this;
};

Vector.prototype.len = function ()
{
    return Math_sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.norm = function (len)
{
    var invLen = (len || 1) / this.len();
    return this.scale(invLen);
};

Vector.prototype.copy = function ()
{
    return new Vector(this.x, this.y);
};

Vector.prototype.toString = function ()
{
    return "( " + this.x + ", " + this.y + ")";
};

Vector.prototype.dot = function(v)
{
    return this.x * v.x + this.y * v.y;
};

Vector.prototype.projectOnto = function(b)
{
    var dp = this.dot(b);
    return new Vector(( dp / (b.x * b.x + b.y * b.y) ) * b.x, ( dp / (b.x * b.x + b.y * b.y) ) * b.y);
};

Vector.prototype.angleTo = function(v)
{
    var deltaX = this.x - v.x;
    var deltaY = this.y - v.y;
    return Math_atan2(deltaY, deltaX);
};

Vector.prototype.rotateCW = function()
{
    var h = -this.x;
    //noinspection JSSuspiciousNameCombination
    this.x = this.y;
    this.y = h;
    return this;
};

Vector.prototype.rotateCCW = function()
{
    var h = this.x;
    this.x = -this.y;
    this.y = h;
    return this;
};

module.exports = Vector;
