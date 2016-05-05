

var svgUtil = require("../tooling/svg");

var path ="<path d=\"M";


var count = 0;
svgUtil.adaptiveLinearization(0,0, 500,100, -100, 100, 400, 0, 4, function (x1,y1,x2,y2)
{
    path += " " + x1 + "," + y1 + " " + x2 +"," + y2;
    count++;
});

console.log(path + "\" fill=\"transparent\" stroke=\"#0f0\"/>");
console.log(count + " lines");
