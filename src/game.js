var raf = require("raf");

var AABB = require("./util/aabb");

var Player = require("./player");

const TAU = Math.PI * 2;

var Level = require("./level");

var Boni = require("./boni");

var score = 0;

function Game(canvas, Control)
{
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;

    var levelData = require("./level/level-1.svg");
    var level = new Level(levelData);

    var boni = new Boni(levelData.boni);

    this.player = new Player(level.player);

    this.render = () =>
    {
        var now = Date.now();

        this.update(now);

        var ctx = this.ctx;

        ctx.fillStyle = "#444";
        ctx.strokeStyle = "#fff";
        ctx.fillRect(0,0, this.width, this.height);


        var hw = this.width/2;
        var hh = this.height/2;
        var playerX = this.player.x;
        var playerY = this.player.y;

        var viewAABB = new AABB(playerX - hw, playerY - hh,playerX + hw, playerY + hh)
        level.render(ctx, viewAABB);

        boni.render(ctx, now, viewAABB);
        this.player.render(ctx, now, viewAABB);

        ctx.fillStyle = "#fff";
        ctx.fillText("Score: " + score, 4, 14);

        raf(this.render);
    };

    this.update = (now) =>
    {

        if (this.player.dead)
        {
            return;
        }
        this.player.update(now);
        this.player.collide(now,level);

        var coins = boni.collide(this.player.shape.aabb.offset(this.player.x, this.player.y));
        score += coins * 100;
    };

    this.render();
}


var x = 0, angle=0;


module.exports = Game;
