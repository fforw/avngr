const {_TYPE, _X, _Y,_DX,_DY, _DATA, _SIZE_OF, _START} = require("./entities/constants");

const raf = require("raf");

const AABB = require("./util/aabb");
const Player = require("./player");
const Score = require("./score");
const Level = require("./level");
const Laser = require("./laser");
const PlayerHandler = require("./entities/player");
const Entities = require("./entities");
const Explosion = require("./explosion");
const Images = require("./images");
const XORShift = require("xorshift").constructor;

const LevelState = require("./level-state");

const UPDATE_INTERVAL = 1000/50;

const RANDOM_SEED = [
    35968.71975298156,
    90592.154790930217,
    54050.57749325177,
    18783.32343124319
];

var logo;

function coords(canvas, ev)
{

    var x;
    var y;
    if (ev.pageX || ev.pageY) {
        x = ev.pageX;
        y = ev.pageY;
    }
    else {
        x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    return {
        x: x,
        y:y
    }
}

var levelCount = 0;

var levels = [
    require("./level/level-1.svg"),
    require("./level/level-2.svg")
];

function Game(canvas, Control, RESOLUTION)
{
    logo = Images.getById("logo");

    this.canvas = canvas;

    var ctx = this.canvas.getContext("2d");
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;

    this.random = new XORShift(RANDOM_SEED);
    this.player = null;

    Entities.init(this);

    var array = Entities.getArray();

    this.nextLevel = () =>
    {
        var levelData = levels[levelCount++];
        if (!levelData)
        {
            alert("End of game");
        }
        var level = new Level(levelData);
        this.level = level;
        Entities.clear();
        Entities.createEntities(levelData.entities);
        this.player = new Player(level.player);

        this.levelState = LevelState.RUNNING;
    };

    this.bg = Images.getById("bg");

    this.stopped = false;
    document.body.className = this.stopped ? "bright" : "";

    this.nextLevel();
    Score.score = 0;

    canvas.addEventListener("click", (e) =>
    {
        var pos = coords(canvas, e);
        var viewAABB = this.getViewAABB();

        var playerId = this.player.entityId;

        var playerX = array[playerId + _X];
        var playerY = array[playerId + _Y];
        var x = pos.x / RESOLUTION + viewAABB.x0 - playerX;
        var y = pos.y / RESOLUTION + viewAABB.y0 - playerY;
        PlayerHandler.shoot(array, playerId, x,y);

        console.log(x,y)

    }, true);

    this.getViewAABB = () =>
    {
        var hw = this.width / 2;
        var hh = this.height / 2;

        var entityId = this.player.entityId;
        var playerX = array[entityId + _X];
        var playerY = array[entityId + _Y];
        var aabb = new AABB(playerX - hw, playerY - hh, playerX + hw, playerY + hh);

        //console.log("view AABB:", aabb);

        return aabb;
    };

    this.renderParallaxBackground = (ctx, viewAABB) =>
    {
        // we move the background in a fixed ratio to the movement of the view
        var startX = viewAABB.x0 * 0.61;
        var startY = viewAABB.y0 * 0.61;
        var bgWidth = this.width * RESOLUTION;
        var bgHeight = this.height * RESOLUTION;


        // now it can happen that we start drawing the background a bit after the screen starts or ends in both directions
        // So we need to make sure to clear the portions of the screen not overdrawn by the background image
        if (startX < 0)
        {
            ctx.clearRect(0, 0, -startX / RESOLUTION, this.height);
        }

        if (startX + bgWidth > this.bg.width)
        {
            ctx.clearRect((startX + bgWidth - this.bg.width) / RESOLUTION, 0, this.width, this.height);
        }

        if (startY < 0)
        {
            ctx.clearRect(0, 0, this.width, -startY / RESOLUTION);
        }

        if (startY + bgHeight > this.bg.height)
        {
            ctx.clearRect(0, (startY + bgHeight - this.bg.height) / RESOLUTION, this.width, this.height);
        }

        ctx.drawImage(this.bg, startX, startY, bgWidth, bgHeight, 0, 0, this.width, this.height);
    };

    this.render = () =>
    {
        var now;

        while ((now = Date.now()) - this.time > UPDATE_INTERVAL)
        {
            this.time += UPDATE_INTERVAL;
            this.update(this.time);
        }

        if (!this.stopped)
        {
            var ctx = this.ctx;

            var viewAABB = this.getViewAABB();

            ctx.fillStyle = "#222";
            ctx.fillRect(0,0,this.width,this.height);

            Entities.renderPlayer(ctx, now, viewAABB, this.player.entityId);
            this.level.render(ctx, viewAABB);
            Entities.render(ctx, now, viewAABB);
            Entities.renderPlayer(ctx, now, viewAABB, this.player.entityId, 0.1);
            this.level.renderFront(ctx, viewAABB);
            //this.level.drawRaster(ctx, viewAABB);

            ctx.fillStyle = "#fff";
            ctx.fillText("Score: " + Score.score, 4, 14);

            ctx.fillText("Shield", 96, 14);


            var shieldEnergy = Math.max(0, Entities.getArray()[ this.player.entityId + _DATA ]);

            ctx.fillStyle = shieldEnergy < 10 ? "#f00" : shieldEnergy < 33 ?"#f88" : "#0f0";
            ctx.fillRect(130, 9, shieldEnergy * 3, 4);
        }

        raf(this.render);
    };

    this.millis = 0;
    this.frames = 0;

    this.update = (now) =>
    {
        var start = Date.now();
        if (this.stopped)
        {
            if (Control.isActive(Control.ACTION_A))
            {
                this.stopped = false;
                document.body.className = "";
            }
        }
        else
        {
            Entities.update(now, this);
        }

        if (this.levelState === LevelState.ENDED)
        {
            this.nextLevel();
        }
        this.millis += (Date.now() - start);
        this.frames++;

        if (!(this.frames & 255))
        {
            console.log("Average time: " + (this.millis/this.frames));
        }


    };

    this.checkExit = (ev) =>
    {
        console.log("check");
        if (Score.score > 0 && array[this.player.entityId + _DATA] >= 0)
        {
            var message = 'Stop playing?';
            ev.returnValue = message;
            return message;
        }
    };


    var iw = logo.width;
    var ih = logo.height;

    document.body.className = "bright";

    var text = "Press SPACE to start";
    var textWidth = ctx.measureText(text).width;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,this.width,this.height);
    ctx.drawImage(logo,this.width/2 - iw/2, this.height/2 - ih/2 - 20);
    ctx.fillStyle = "#000";
    ctx.fillText(text,this.width/2 - textWidth/2, this.height/2 + ih/2);

    this.time = Date.now();

    this.render();
}

module.exports = Game;
