var Game = require("./game");
var Control = require("./control");

var Sounds = require("./sounds");

const Behavior = require("ff-behavior");

Behavior.registerFromRequireContext(require.context("./behavior/", true, /\.js$/));

// Game resolution: Determines how much we scale up the canvas via CSS
//const RESOLUTION = 2;

const LOADING_TEXT = "Loading...";


var game;

window.onload = (function ()
{
    var canvas = document.getElementById("screen");

    var screenWidth = (window.innerWidth - 1);
    var screenHeight = window.innerHeight;

    var resolution = (screenWidth / 800)|0;
    var width = (screenWidth / resolution)|0;
    var height = (screenHeight / resolution)|0;

    canvas.width = width;
    canvas.height = height;

    if (resolution !== 1)
    {
        canvas.setAttribute("style", "transform: translate(0,0); width: "+ screenWidth + "px; height: " + screenHeight + "px");
    }

    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fff";

    //var textWidth = ctx.measureText(LOADING_TEXT).width;
    //ctx.fillText(LOADING_TEXT, (screenWidth / 2 - textWidth / 2)|0, (screenHeight/2)|0);

    Sounds.init().then(function ()
    {
        //Sounds.play(Sounds.LOOP);

        game = new Game(canvas,Control, resolution);

        document.addEventListener("keydown", Control.onKeyDown);
        document.addEventListener("keyup", Control.onKeyUp);

        window.addEventListener("beforeunload", game.checkExit, true);


        //alert("AVNGR A\n\nWASD/cursor for movement\nSPACE = shoot, B = bomb");

    }).catch(function (err)
    {
        console.error(err);
    });

});

