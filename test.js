
var Vector = require("./src/util/vector");

var v = new Vector(1,0);

console.log("CCW", v.y, -v.x);
console.log("CW", -v.y, v.x);
