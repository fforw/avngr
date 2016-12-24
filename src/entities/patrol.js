const {_TYPE, _X, _Y, _DX, _DY, _DATA, _DATA2, _OWNER, _START, _SIZE_OF} = require("./constants");

const TAU = Math.PI * 2;

const _LAST_SHOT = _DATA;

const FIRE_DELAY = 2000;
const DECISION_INTERVAL = 200;

const Vector = require("../util/vector");
const Explosion = require("../explosion");
const Sounds = require("../sounds");
const Laser = require("../laser");
const Intersection = require("../util/intersection");

const AIStates = require("./ai-states");

var Entities;
var EntityType;

const THRUST = 2;
const PATROL_THRUST = 2;

const PATROL_SIZE = 12;

function initEntities()
{
    if (!Entities)
    {
        Entities = require("./index");
        EntityType = Entities.EntityType
    }
}

let aiContext = {
    array: null,
    id: null,
    now: 0
};

function moveToTarget(array, id, targetPosition)
{
    var x = array[id + _X];
    var y = array[id + _Y];

    var vTarget = new Vector(targetPosition.x - x, targetPosition.y - y);
    var vPower = vTarget.norm(THRUST);

    array[id + _DX] = (array[id + _DX] * 2 + vPower.x) / 3;
    array[id + _DY] = (array[id + _DX] * 2 + vPower.y) / 3;

    array[id + _X] += array[id + _DX];
    array[id + _Y] += array[id + _DY];
}

var Behaviours = {
    approach: {
        //score: function(now, x, y, playerX, playerY, aiState)
        score: function (now, array, id, playerX, playerY, aiState, game)
        {
            var vTarget;
            var x = array[id + _X];
            var y = array[id + _Y];

            if (aiState.contact)
            {
                vTarget = new Vector(playerX, playerY);
            }
            else
            {
                vTarget = new Vector(aiState.lastSeen.x, aiState.lastSeen.y);
            }

            var distance = vTarget.subtract(x,y).len();
            return distance > 120 ? 20 : 0;
        },
        execute: function (now, array, id, playerX, playerY, aiState, game)
        {
            var vTarget;
            if (aiState.contact)
            {
                vTarget = new Vector(playerX, playerY);
            }
            else
            {
                vTarget = new Vector(aiState.lastSeen.x, aiState.lastSeen.y);
            }

            moveToTarget(array,id, vTarget);
        }
    },
    evade: {
        //score: function(now, x, y, playerX, playerY, aiState)
        score: function (now, array, id, playerX, playerY, aiState, game)
        {
            var x = array[id + _X];
            var y = array[id + _Y];

            var allocationEnd = Entities.getAllocationEnd();
            for (var i = 0; i < allocationEnd; i += _SIZE_OF)
            {
                if (array[i + _TYPE] === EntityType.LASER)
                {
                    var vPos = new Vector(array[i + _X], array[i + _Y]);
                    var vDir = new Vector(array[i + _DX], array[i + _DY]);

                    var vLaser = vPos.copy().subtract(x, y);

                    if (vLaser.x < Laser.MAX_DISTANCE && vLaser.y < Laser.MAX_DISTANCE)
                    {
                        var level = game.level;
                        if (level.sightLine(x, y, vPos.x, vPos.y))
                        {
                            var vEnd = vDir.copy().norm(Laser.MAX_DISTANCE).add(vPos);

                            if (Intersection.lineIntersectsCircle(
                                    x, y, PATROL_SIZE,
                                    vPos.x, vPos.y, vEnd.x, vEnd.y
                                ))
                            {
                                var vLeft = vDir.copy().rotateCCW().norm(50).add(x, y);
                                var vRight = vDir.copy().rotateCW().norm(50).add(x, y);

                                var leftFirst = game.random.random() > 0.5;
                                var vFirst = leftFirst ? vLeft : vRight;
                                var vSecond = leftFirst ? vRight : vLeft;

                                if (level.checkRaster(vFirst.x, vFirst.y))
                                {
                                    aiState.targetPosition = vFirst;
                                    return 50;
                                }

                                if (level.checkRaster(vSecond.x, vSecond.y))
                                {
                                    aiState.targetPosition = vSecond;
                                    return 50;
                                }

                                // both left and right are blocked, check retreat
                                var vRetreat = vDir.copy().norm(-50).add(x, y);
                                if (level.checkRaster(vRetreat.x, vRetreat.y))
                                {
                                    aiState.targetPosition = vRetreat;
                                    return 50;
                                }
                            }
                        }
                    }
                }
            }

            // no laser or none we can flee from
            // aiState.targetPosition = null;
            return 0;
        },
        execute: function (now, array, id, playerX, playerY, aiState, game)
        {
            moveToTarget(array,id, aiState.targetPosition);
        }
    },
    strafe: {
        //score: function(now, x, y, playerX, playerY, aiState)
        score: function (now, array, id, playerX, playerY, aiState, game)
        {
            if (!aiState.contact)
            {
                return 0;
            }

            var x = array[id + _X];
            var y = array[id + _Y];

            var vPlayer = new Vector(playerX - x , playerY -y);

            var vLeft = vPlayer.copy().rotateCCW().norm(50).add(x, y);
            var vRight = vPlayer.copy().rotateCW().norm(50).add(x, y);

            var leftFirst = game.random.random() > 0.5;
            var vFirst = leftFirst ? vLeft : vRight;
            var vSecond = leftFirst ? vRight : vLeft;

            var level = game.level;
            if (level.checkRaster(vFirst.x, vFirst.y))
            {
                aiState.strafePosition = vFirst;
                return 10;
            }

            if (level.checkRaster(vSecond.x, vSecond.y))
            {
                aiState.strafePosition = vSecond;
                return 10;
            }

            var vRetreat = vPlayer.norm(-50).add(x, y);
            if (level.checkRaster(vRetreat.x, vRetreat.y))
            {
                aiState.strafePosition = vRetreat;
                return 10;
            }

            return 0;
        },
        execute: function (now, array, id, playerX, playerY, aiState, game)
        {
            moveToTarget(array,id, aiState.strafePosition);
        }
    }
};

function sortStack(a,b)
{
    return b.score - a.score;
}

module.exports = {
    init: function (array, id, x, y, game)
    {
        array[id + _LAST_SHOT] = Date.now();

        AIStates.aiStateById[id] = {
            lastSeen: {
                x: 0,
                y: 0
            },
            contact: false,
            vertices: null,
            index: 0
        };
    },

    update: function (now, array, id, game)
    {
        initEntities();

        var x = array[id + _X];
        var y = array[id + _Y];
        var dx = array[id + _DX];
        var dy = array[id + _DY];
        var lastShot = array[id + _LAST_SHOT];

        x+= dx;
        y+= dy;

        var behavior ,level = game.level;
        var playerId = game.player.entityId;
        var playerX = array[playerId + _X];
        var playerY = array[playerId + _Y];
        var playerDX = array[playerId + _DX];
        var playerDY = array[playerId + _DY];
        var alive = array[playerId + _DATA] >= 0;

        var aiState = AIStates.aiStateById[id];
        var patrolIndex = aiState.index;
        if (patrolIndex < 0)
        {
            if (level.sightLine(x, y, playerX, playerY))
            {
                aiState.lastSeen.x = playerX;
                aiState.lastSeen.y = playerY;
                aiState.contact = true;

                var targetVector = new Vector(playerX - x, playerY - y);

                var distance = targetVector.len();
                var stepsToTarget = distance / Laser.SPEED;
                targetVector.add(playerDX * stepsToTarget, playerDY * stepsToTarget);

                if (alive && now - lastShot > FIRE_DELAY)
                {
                    array[id + _LAST_SHOT ] = now;
                    Laser.fire(x, y, targetVector.x, targetVector.y, id);
                }
            }
            else
            {
                aiState.contact = false;
            }

            if (!aiState.stack || now - aiState.lastDecision > DECISION_INTERVAL)
            {
                var stack = [];

                for (var name in Behaviours)
                {
                    if (Behaviours.hasOwnProperty(name))
                    {
                        behavior = Behaviours[name];

                        var score = behavior.score;
                        if (typeof score === "function")
                        {
                            score = behavior.score(now, array, id, playerX, playerY, aiState, game);
                        }
                        stack.push({
                            score: score,
                            name: name
                        });
                    }
                }

                stack.sort(sortStack);
                aiState.stack = stack;
                aiState.lastDecision = now;

                //console.log("Best Ranked Behavior: ", aiState.stack[0]);
            }

            behavior = aiState.stack[0];
            if (behavior.score > 0)
            {
                Behaviours[behavior.name].execute(now, array, id, playerX, playerY, aiState, game);
            }
        }
        else
        {

            var idx = patrolIndex * 2;

            var vertices = aiState.vertices;

            var vCur = new Vector(vertices[idx] - x,vertices[idx + 1] - y);

            if (vCur.len() < 10)
            {
                patrolIndex++;
                if (patrolIndex == vertices.length/2)
                {
                    patrolIndex = 0;
                }
                vCur = new Vector(vertices[patrolIndex*2] - x ,vertices[patrolIndex*2 + 1] - y);
            }

            vCur.norm(PATROL_THRUST);
            dx = (dx + dx + vCur.x)/3;
            dy = (dy + dy + vCur.y)/3;


            array[id + _X] = x;
            array[id + _Y] = y;
            array[id + _DX] = dx;
            array[id + _DY] = dy;


            if (level.sightLine(x, y, playerX, playerY))
            {
                console.log("Spotted player while on patrol");
                Sounds.play(Sounds.ALARM);
                aiState.index = -1;
            }
            else
            {
                aiState.index = patrolIndex;
            }
        }
    }
};

