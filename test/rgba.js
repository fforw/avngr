var assert = require("power-assert");

var rgba = require("../tooling/rgba");

describe("RGBA conversion", function ()
{

    it("converts short RGB", function ()
    {

        assert(rgba("#000", 0.5) === "rgba(0,0,0,0.5)");
        assert(rgba("#def", 0.25) === "rgba(221,238,255,0.25)");

    });

    it("converts long RGB", function ()
    {
        assert(rgba("#abcdef", 0.1) === "rgba(171,205,239,0.1)");
    });

    it("is neutral for opacity = 1", function ()
    {
        assert(rgba("#000", 1) === "#000");
    });
});
