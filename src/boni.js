
function Boni(boni)
{
    console.log("CREATE BONI", boni);

    this.boni = boni;

    this.images = [
        document.getElementById("coin")
    ];
}

Boni.prototype.render = function (ctx, now, viewAABB)
{

    ctx.save();
    ctx.translate( -viewAABB.x0, -viewAABB.y0);
    var boni = this.boni;
    for (var i = 0; i < boni.length; i++)
    {
        var bonus = boni[i];

        if (bonus)
        {
            ctx.save();
            ctx.translate(bonus.x , bonus.y);
            var scale = Math.sin(now/100);

            ctx.scale(scale * 0.7,0.7);
            bonus && ctx.drawImage(this.images[0], -8 ,-8);
            ctx.restore();
        }
    }

    ctx.restore();
};

Boni.prototype.collide = function (playerAABB)
{
    var pickedUp = 0;
    var boni = this.boni;
    for (var i = 0; i < boni.length; i++)
    {
        var bonus = boni[i];

        if (bonus && playerAABB.inside(bonus.x, bonus.y))
        {
            console.log("PICK UP");
            boni[i] = null;
            pickedUp++;
        }
    }
    return pickedUp;
};

module.exports = Boni;
