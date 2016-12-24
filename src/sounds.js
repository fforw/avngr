var audio;
if (typeof  window !== "undefined")
{
    audio = require("browser-audio");
}
else
{
    audio = {
        create: function ()
        {
            return {
                play: function ()
                {

                },
                duration: 1000

            }

        },
        whenLoaded: function (a, b)
        {
            b();
        }
    }
}

var files = [
    audio.create("audio/coin.mp3"),
    audio.create("audio/laser.mp3"),
    audio.create("audio/explosion.mp3"),
    audio.create("audio/loop.mp3"),
    audio.create("audio/health.mp3"),
    audio.create("audio/alarm.mp3"),
    audio.create("audio/rocket.mp3")
];

var Sounds = {

    COIN: 0,
    LASER: 1,
    EXPLOSION: 2,
    LOOP: 3,
    HEALTH: 4,
    ALARM: 5,
    ROCKET: 6,

    init: function ()
    {
        return new Promise(function (resolve, reject)
        {
            var timer = window.setTimeout(function ()
            {
                reject(new Error("timeout"));
            }, 30000);

            audio.whenLoaded(files, function ()
            {
                window.clearTimeout(timer);
                resolve();
            });
        });
    },
    play: function (index)
    {
        var soundFile = files[index];
        soundFile.play();

        if (index === Sounds.LOOP)
        {
            window.setTimeout(() => this.play(index), (soundFile.duration * 1000) | 0)
        }
    }
};
module.exports = Sounds;

