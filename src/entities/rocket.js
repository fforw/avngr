const {_TYPE, _X, _Y, _DX, _DY, _DATA, _DATA2, _START, _SIZE_OF} = require("./constants");

const TAU = Math.PI * 2;

const _ACTIVE = _DATA;
const _ANGLE = _DATA2;

const Vector = require("../util/vector");
const Explosion = require("../explosion");
const Sounds = require("../sounds");
var Entities;
var EntityType;

function initEntities()
{
    if (!Entities)
    {
        Entities = require("./index");
        EntityType = Entities.EntityType
    }
}

const ROCKET_THRUST = 4;
const ROCKET_DEVIATION = 45 * TAU / 360;

module.exports = {
    init: function (array, id, x, y)
    {
        array[id + _ACTIVE] = 0;
        array[id + _ANGLE] = -TAU/4;

    },

    render: function (ctx, now, viewAABB, array, id, image)
    {
        var angle = array[id + _ANGLE];

        ctx.save();
        ctx.translate(array[id + _X] , array[id + _Y]);
        ctx.rotate(angle + TAU/4);
        ctx.drawImage(image, -4,  -9);
        ctx.restore();
    },

    update: function (now, array, id, game)
    {
        initEntities();

        var playerId = game.player.entityId;

        var active = array[id + _ACTIVE] !== 0;

        var rocketX = array[id + _X];
        var rocketY = array[id + _Y];
        var start = array[id + _START ];
        var angle = array[id + _ANGLE ];

        var playerX = array[playerId + _X];
        var playerY = array[playerId + _Y];
        var playerDX = array[playerId + _DX];
        var targetVector = new Vector(playerX - rocketX, playerY - rocketY);

        if (!active)
        {
            // player moving in our direction?
            if (playerDX && Math.sign(playerDX) !== Math.sign(targetVector.x) && targetVector.y < 0)
            {
                var stepsAtCurrentSpeed = Math.abs(targetVector.x / playerDX);
                var stepsToHeight = Math.sqrt((-targetVector.y * 2) / ROCKET_THRUST);

                if (Math.abs(1 - stepsAtCurrentSpeed / stepsToHeight) < 0.4)
                {
                    active = array[id + _ACTIVE] = 1;
                    start = array[id + _START ] = now;
                    Sounds.play(Sounds.ROCKET);
                }
            }
        }

        if (active)
        {
            var targetAngle = Math.atan2(targetVector.y, targetVector.x);

            if (targetAngle < -TAU/4 -ROCKET_DEVIATION)
            {
                targetAngle = -TAU/4 -ROCKET_DEVIATION;
            }
            else if (targetAngle > -TAU/4 + ROCKET_DEVIATION)
            {
                targetAngle = -TAU/4 + ROCKET_DEVIATION;
            }

            if (angle < targetAngle)
            {
                angle = array[id + _ANGLE ] += 0.1;
            }
            else if (angle > targetAngle)
            {
                angle = array[id + _ANGLE ] -= 0.1;
            }

            array[id + _X] += Math.cos(angle) * ROCKET_THRUST;
            array[id + _Y] += Math.sin(angle) * ROCKET_THRUST;
        }

        var dist = targetVector.len();
        if (dist < 20 || (active && now - start > 1100))
        {
            //player.shieldEnergy -= 101 * Math.sqrt( 1 - (dist/30));
            Explosion.init(id, rocketX, rocketY, 1);
        }
    }
};

