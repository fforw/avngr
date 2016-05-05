const Explosion = require("./explosion");
const Control = require("./control");
const AABB = require("./util/aabb");
const Shape = require("./shape");

const TAU = Math.PI * 2;
const BOMB_MAX_SPEED = 2;
const THRUST = 0.03;

const BACKGROUND_DAMAGE = 32;

// thrust angle for up/down movement
const thrustAngle = 40 * TAU / 360;

const X_THRUST = Math.cos(thrustAngle) * THRUST;
const Y_THRUST = Math.sin(thrustAngle) * THRUST;

function Player(defPos)
{
    this.x = defPos.x;
    this.y = defPos.y;

    this.dx = 0;
    this.dy = 0;

    this.shape = Shape.ellipse(9, 5, 8);

    this.shieldEnergy = 100;

    this.lasers = [null,null,null];
    this.bombs = [null,null,null];

    this.images = [
        document.getElementById("ship"),
        document.getElementById("shield"),
        document.getElementById("bomb")
    ];

    this.dead = false;
    this.explosion = null;

}

var flip = false;


Player.prototype.render = function (ctx, now, viewAABB)
{
    ctx.save();
    ctx.translate(-viewAABB.x0 + this.x - 14, -viewAABB.y0 + this.y - 14);

    var i;
    var x = 0; //;
    var y = 0; //this.y - 14;

    var isDead = this.dead;
    var shieldEnergy = this.shieldEnergy;
    if (shieldEnergy < 0 && !isDead)
    {
        this.dead = isDead = true;
        this.explosion = Explosion.create(now, 14, 14, 28, 18, 3);
    }

    if (isDead)
    {
        if (Explosion.render(ctx, this.explosion, now))
        {
            this.explosion = null;
        }
    }
    else
    {
        if (this.dx < 0)
        {
            ctx.scale(-1,1);
            x-=28;
        }
        ctx.drawImage(this.images[0], x,y);

        ctx.globalAlpha = shieldEnergy/100 * ( 0.6 + Math.sin((now/800) + (flip ? TAU/3 : 0)) * 0.4);
        ctx.drawImage(this.images[1], x,y);
        ctx.globalAlpha = 1;

        flip = !flip;
    }
    ctx.restore();
    ctx.save();
    ctx.translate(-viewAABB.x0, -viewAABB.y0);

    ctx.strokeStyle = "rgba(255,255,192,1)";
    for (i = 0; i < this.lasers.length; i++)
    {
        var laser = this.lasers[i];
        if (laser)
        {
            ctx.strokeRect(laser.x, laser.y, 2, 1);
        }
    }

    for (i = 0; i < this.bombs.length; i++)
    {
        var bomb = this.bombs[i];
        if (bomb)
        {
            if (bomb.explosion)
            {
                if (Explosion.render(ctx, bomb.explosion, now))
                {
                    this.bombs[i] = null;
                }
            }
            else
            {
                ctx.drawImage(this.images[2], bomb.x, bomb.y);
            }
        }
    }

    ctx.restore();
};

Player.prototype.update = function (now)
{
    var i, laserFired, bombFired;
    laserFired = Control.isActive(Control.ACTION_A);
    bombFired = Control.isActive(Control.ACTION_B);

    for (i = 0; i < this.lasers.length; i++)
    {
        var laser = this.lasers[i];
        if (laser)
        {
            laser.x += laser.dx;
        }
        else if (laserFired)
        {
            this.lasers[i] = {
                x: this.x + (this.dx < 0 ? -12 : 12),
                y: this.y,
                dx: this.dx < 0 ? -8 : 8,
                start: now
            };

            console.log("LASER FIRED", this.lasers[i]);
            laserFired = false;
        }


    }

    for (i = 0; i < this.bombs.length; i++)
    {
        var bomb = this.bombs[i];
        if (bomb)
        {
            bomb.x += bomb.dx;
            bomb.y += bomb.dy;
            if (bomb.dy < BOMB_MAX_SPEED)
            {
                bomb.dy += 0.2;
            }
            bomb.dx *= 0.99;
        }
        else if (bombFired)
        {
            this.bombs[i] = {
                x: this.x + (this.dx < 0 ? -14 : 0),
                y: this.y + 8,
                dx: this.dx,
                dy: 0,
                aabb: new AABB(this.x - 7, this.y - 7 + 8, this.x + 7, this.y + 7 + 8),
                start: now
            };
            console.log("BOMB FIRED", this.bombs[i]);
            bombFired = false;
        }

    }

    if (Control.isActive(Control.UP))
    {
        this.dy -= Y_THRUST;
        this.dx += this.dx < 0 ? -X_THRUST : X_THRUST;
    }
    else if (Control.isActive(Control.DOWN))
    {
        this.dy += Y_THRUST;
        this.dx += this.dx < 0 ? -X_THRUST : X_THRUST;
    }

    if (Control.isActive(Control.LEFT))
    {
        this.dx -= THRUST;
    }
    else if (Control.isActive(Control.RIGHT))
    {
        this.dx += THRUST;
    }

    this.dx *= 0.99;
    this.dy *= 0.99;

    if (Math.abs(this.dx) < 0.001)
    {
        this.dx = 0;
    }
    if (Math.abs(this.dy) < 0.001)
    {
        this.dy = 0;
    }


    this.x += this.dx;
    this.y += this.dy;
};

Player.prototype.collide = function (now, level)
{
    var i;
    var playerX = this.x;
    var playerY = this.y;

    var result = level.collideAABB(playerX, playerY, this.shape);
    if (result.count > 0)
    {
        this.dx += result.fx;
        this.dy += result.fy;

        this.shieldEnergy -= result.count * BACKGROUND_DAMAGE;
    }

    for (i = 0; i < this.bombs.length; i++)
    {
        var bomb = this.bombs[i];
        if (bomb && (now - bomb.start > 3000 || level.collide(bomb.x + 7, bomb.y + 7)))
        {
            if (!bomb.explosion)
            {
                bomb.explosion = Explosion.create(now, bomb.x + 7, bomb.y + 7, 7, 7, 1);
            }
        }
    }

    for (i = 0; i < this.lasers.length; i++)
    {
        var laser = this.lasers[i];
        if (laser && (now - laser.start > 1000 || level.collide(laser.x, laser.y)))
        {
            this.lasers[i] = null;
        }
    }
};

module.exports = Player;
