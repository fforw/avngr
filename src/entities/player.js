const {_TYPE, _X, _Y,_DX,_DY, _DATA, _SIZE_OF, _START} = require("./constants");
const Vector = require("../util/vector");
const Explosion = require("../explosion");
const Sounds = require("../sounds");
const Images = require("../images");
const Control = require("../control");

const Score = require("../score");
const Laser = require("../laser");
const Bomb = require("../bomb");

const isNegZero = require("../util/negative-zero");
const LevelState = require("../level-state");

var Entities;
var EntityType;

var images;

var flip;

const TAU = Math.PI * 2;
const THRUST = 0.03;

const BACKGROUND_DAMAGE = 6;

// thrust angle for up/down movement
const thrustAngle = 40 * TAU / 360;

const X_THRUST = Math.cos(thrustAngle) * THRUST;
const Y_THRUST = Math.sin(thrustAngle) * THRUST;

const INVINCIBLE = true;

console.log("CONTROL", Control);

var lasers = 3, bombs = 3;

function init()
{
    if (!Entities)
    {
        Entities = require("./index");
        EntityType = Entities.EntityType;
    }
}

const MIN_MOVEMENT = 0.01;

/**
 * Makes sure that the absolute speed value is not below MIN_MOVEMENT while
 * preserving negative zero to have the player face the direction in which
 * they last moved.
 *
 * @param speed
 * @returns limited speed
 */
function limit(speed)
{
    if (speed !== 0)
    {
        if (speed < 0)
        {
            if (speed > -MIN_MOVEMENT)
            {
                //console.log("set to -0");
                speed = -0;
            }

        }
        else
        {
            if (speed < MIN_MOVEMENT)
            {
                //console.log("set to 0");
                speed = 0;
            }
        }
    }
    return speed;
}

var PlayerHandler = {
    init: function (array, id, x, y)
    {
    },
    render: function (ctx, now, viewAABB, array, id, image)
    {
        if (!images)
        {
            images = Images.getById([
                "ship",
                "shield"
            ]);
        }

        var playerX = array[id + _X];
        var playerY = array[id + _Y];
        var playerDX = array[id + _DX];

        if (INVINCIBLE)
        {
            array[id + _DATA] = 100;
        }
        var shieldEnergy = array[id + _DATA];

        ctx.save();
        ctx.translate(playerX - 14, playerY - 14);

        var x = 0;
        var y = 0;

        if (shieldEnergy < 0)
        {
            if (shieldEnergy > -1000)
            {
                Explosion.create(now, playerX, playerY, 28, 18, 3);
                array[id + _DATA] = -1000;
            }

            //window.setTimeout(function ()
            //{
            //    Sounds.play(Sounds.EXPLOSION);
            //}, 50 + 100 * Math.random())
        }
        else
        {
            if (playerDX < 0 || isNegZero(playerDX))
            {
                ctx.scale(-1, 1);
                x -= 28;
            }
            ctx.drawImage(images[0], x, y);

            ctx.globalAlpha = Math.min(100, shieldEnergy) / 100 * ( 0.6 + Math.sin((now / 800) + (flip ? TAU / 3 : 0)) * 0.4);
            ctx.drawImage(images[1], x, y);

            flip = !flip;
        }
        ctx.restore();
    },
    callback: function(now, array, ownerId, id, targetId, game)
    {
        init();

        if (array[id + _TYPE] == EntityType.LASER)
        {
            lasers++;
        }
        else
        {
            bombs++;
        }
    },
    update: function (now, array, id, game)
    {
        init();

        var playerX = array[id + _X];
        var playerY = array[id + _Y];
        var playerDX = array[id + _DX];
        var playerDY = array[id + _DY];
        var shieldEnergy = array[id + _DATA];

        if (shieldEnergy < 0)
        {
            return;
        }

        if (game.levelState === LevelState.RUNNING)
        {
            var laserFired, bombFired;
            laserFired = Control.isActive(Control.ACTION_A);
            bombFired = Control.isActive(Control.ACTION_B);

            if (laserFired)
            {
                PlayerHandler.shoot(array, id, playerDX < 0 ? -8 : 8, 0);
            }

            if (bombFired && bombs > 0)
            {
                Bomb.drop(
                    playerX + (playerDX < 0 ? -6 : 8),
                    playerY + 8,
                    playerDX,
                    playerDY,
                    id
                );
                bombs--;
            }


            if (Control.isActive(Control.UP))
            {
                playerDY -= Y_THRUST;
                playerDX += playerDX < 0 ? -X_THRUST : X_THRUST;
            }
            else if (Control.isActive(Control.DOWN))
            {
                playerDY += Y_THRUST;
                playerDX += playerDX < 0 ? -X_THRUST : X_THRUST;
            }

            if (Control.isActive(Control.LEFT))
            {
                playerDX -= THRUST;
            }
            else if (Control.isActive(Control.RIGHT))
            {
                playerDX += THRUST;
            }

            var width = game.level.width;
            var height = game.level.height;

            if (playerX < 0)
            {
                playerDX += 0.1;
            }
            if (playerX > width)
            {
                playerDX -= 0.1;
            }
            if (playerY < 0)
            {
                playerDY += 0.1;
            }
            if (playerY > height)
            {
                playerDY -= 0.1;
            }
        }

        playerDX = limit(playerDX * 0.99);
        playerDY = limit(playerDY * 0.99);

        playerX += playerDX;
        playerY += playerDY;


        // COLLISION

        var result = game.level.collideAABB(playerX, playerY, game.player.shape);
        if (result.count > 0)
        {
            playerDX += result.fx;
            playerDY += result.fy;

            var damage = result.count * BACKGROUND_DAMAGE * Math.sqrt(result.fx * result.fx + result.fy * result.fy);
            array[id + _DATA] -= damage;

            //console.log("BGDAMAGE", damage, "force:", result.fy, result.fy);
        }

        var playerAABB = game.player.getAABB();

        var allocationEnd = Entities.getAllocationEnd();
        for (let i = 0; i < allocationEnd; i += _SIZE_OF)
        {
            var type = array[i + _TYPE];
            if (type === EntityType.BONUS && playerAABB.inside(array[i + _X], array[i + _Y]))
            {
                Score.toScore(i, EntityType.SCORE_100, game);
            }
            else if (type === EntityType.HEALTH && playerAABB.inside(array[i + _X], array[i + _Y]))
            {
                array[id + _DATA] += 100;
                Sounds.play(Sounds.HEALTH);
                Entities.remove(i);
            }
        }

        array[id + _X] = playerX;
        array[id + _Y] = playerY;
        array[id + _DX] = playerDX;
        array[id + _DY] = playerDY;
    },
    shoot: function (array, id, x, y)
    {
        var playerX = array[id + _X];
        var playerY = array[id + _Y];

        if (lasers > 0)
        {
            Laser.fire(
                playerX, playerY,
                x, y,
                id
            );
            lasers--;
        }
    }
};
module.exports = PlayerHandler;
