var assert = require("power-assert");

var Colors = require("../src/colors");

describe("Colors", function ()
{

    it("creates gradients", function ()
    {
        var gradient = Colors.lightGradient(Colors.rgba("#00f",1), Colors.rgba("#000",1), Colors.rgba("#fff",1), 6, 0.5, 1, 1);


        assert(gradient.length === 6);

        assert.deepEqual(gradient, [
            {
                "r": 0,
                "g": 0,
                "b": 0,
                "a": 1
            },
            {
                "r": 0,
                "g": 0,
                "b": 85,
                "a": 1
            },
            {
                "r": 0,
                "g": 0,
                "b": 170,
                "a": 1
            },
            {
                "r": 0,
                "g": 0,
                "b": 255,
                "a": 1
            },
            {
                "r": 85,
                "g": 85,
                "b": 255,
                "a": 1
            },
            {
                "r": 170,
                "g": 170,
                "b": 255,
                "a": 1
            }
        ]);

        gradient = Colors.lightGradient(Colors.rgba("#0f0",1), Colors.rgba("#005",1), Colors.rgba("#ffe",1), 6);

        assert.deepEqual(gradient,[
                {
                    "r": 0,
                    "g": 25.499999999999993,
                    "b": 76.5,
                    "a": 1
                },
                {
                    "r": 0,
                    "g": 102,
                    "b": 51,
                    "a": 1
                },
                {
                    "r": 0,
                    "g": 178.5,
                    "b": 25.5,
                    "a": 1
                },
                {
                    "r": 0,
                    "g": 255,
                    "b": 0,
                    "a": 1
                },
                {
                    "r": 42.5,
                    "g": 255,
                    "b": 39.666666666666664,
                    "a": 1
                },
                {
                    "r": 85,
                    "g": 255,
                    "b": 79.33333333333333,
                    "a": 1
                }
            ]
        );

        //console.log(JSON.stringify(gradient, null, "    "));

    });


    describe("RGBA conversion", function ()
    {

        it("reads #abc", function ()
        {
            assert.deepEqual(Colors.rgba("#000", 0.5) , { r:0,g:0,b:0,a:0.5});
            assert.deepEqual(Colors.rgba("#def", 0.25), {r:221,g:238,b:255,a:0.25});

        });

        it("reads #abcdef", function ()
        {
            assert.deepEqual(Colors.rgba("#abcdef", 0.1), {r:171,g:205,b:239,a:0.1});
        });

        it("reads rgb()/rgba()", function ()
        {
            var col = Colors.rgba("rgba(1,2,3,4)");

            assert.deepEqual(col, {
                r: 1,
                g: 2,
                b: 3,
                a: 4
            });

            col = Colors.rgba("rgb(1,2,3)");

            assert.deepEqual(col, {
                r: 1,
                g: 2,
                b: 3,
                a: 1
            });
            assert(Colors.rgba("rgba(1,2,3,4)", 0.5).a === 0.5);

            assert(Colors.rgba("rgb(1,2,3)", 0.5).a === 0.5);

            assert(Colors.rgba("rgba(1,2,3,4)", 0).a === 0);
            assert(Colors.rgba("rgba(1,2,3,0)").a === 0);
        });

        it("checks rgb/rgba argument numbers", function()
        {
            assert.throws(function ()
            {
                Colors.rgba("rgba(1,2,3)");
            }, /rgba must have 4 argument/);
            assert.throws(function ()
            {
                Colors.rgba("rgb(1,2,3,1)");
            }, /rgb must have 3 argument/);
            assert.throws(function ()
            {
                Colors.rgba("rgb(1)");
            }, /rgb must have 3 argument/);
            assert.throws(function ()
            {
                Colors.rgba("rgba(1,2)");
            }, /rgba must have 4 argument/);

        });
        it("renders color objects", function()
        {
            assert(Colors.renderColor({r:1,g:2,b:3,a:4}) === "rgba(1, 2, 3, 4)");
            assert(Colors.renderColor({r:1,g:2,b:3,a:1}) === "rgb(1, 2, 3)");

        })
    });

});
