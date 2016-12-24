var level = require("./level/level-1.svg");

for (var i = 0; i < level.objects.length; i++)
{
    var obj = level.objects[i];
    console.log("#"+i, obj.vertices.length, obj.scaled.length);

}
console.log(level.objects);
