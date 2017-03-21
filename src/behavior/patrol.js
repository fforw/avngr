const {_TYPE, _X, _Y, _DX, _DY, _DATA, _DATA2, _OWNER, _START, _SIZE_OF} = require("../entities/constants");

const Vector = require("../util/vector");

const State = require("ff-behavior").State;
const BehaviorInstances = require("../entities/behavior-instances");

const PATROL_THRUST = 2;

module.exports = {
    init: function (ctx, tree, node)
    {
        const array = ctx.array;
        const id = ctx.id;

        const vertices = tree.vertices;
        const off = tree.index * 2;

        const x2 = vertices[off];
        const y2 = vertices[off + 1];

        const x = array[id + _X];
        const y = array[id + _Y];

        const level = ctx.game.level;

        tree.failed = !level.sightLine(x,y,x2,y2);

        if (tree.failed)
        {
            console.error("No sight line to target");
        }
    },
    update: function (ctx, tree, node)
    {
        if (tree.failed)
        {
            return State.FAILURE;
        }

        const array = ctx.array;
        const id = ctx.id;

        const vertices = tree.vertices;
        const off = tree.index * 2;

        const x2 = vertices[off];
        const y2 = vertices[off + 1];

        let x = array[id + _X];
        let y = array[id + _Y];
        const dx = array[id + _DX];
        const dy = array[id + _DY];

        const vTarget = new Vector(x2 - x, y2 - y);

        x += dx;
        y += dy;

        if (vTarget.len() < 4)
        {
            tree.index++;
            if (tree.index == vertices.length)
            {
                tree.index = 0;
            }

            console.log("index", tree.index);

            return State.SUCCESS;
        }

        vTarget.norm(PATROL_THRUST);

        array[id + _X] = x;
        array[id + _Y] = y;
        array[id + _DX] = (dx + dx + vTarget.x)/3;
        array[id + _DY] = (dy + dy + vTarget.y)/3;

        return State.RUNNING;
    }
};
