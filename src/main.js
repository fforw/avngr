var Game = require("./game");
var Control = require("./control");

// Game resolution: Determines how much we scale up the canvas via CSS
const RESOLUTION = 2;

var game;

window.onload = (function ()
{
    var canvas = document.getElementById("screen");

    var screenWidth = (window.innerWidth - 1);
    var screenHeight = window.innerHeight;

    var width = (screenWidth / RESOLUTION)|0;
    var height = (screenHeight / RESOLUTION)|0;

    canvas.width = width;
    canvas.height = height;

    if (RESOLUTION !== 1)
    {
        canvas.setAttribute("style", "transform: translate(0,0); width: "+ screenWidth + "px; height: " + screenHeight + "px");
    }

    game = new Game(canvas,Control);

    document.addEventListener("keydown", Control.onKeyDown);
    document.addEventListener("keyup", Control.onKeyUp);

    alert("WASD/cursor for movement\nSPACE = shoot, B = bomb");
});

