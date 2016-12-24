
var isArray = require("./util/isArray");

function getById(id)
{
    if (!id)
    {
        return null;
    }
    var elem = document.getElementById(id);
    if (!elem)
    {
        throw new Error("Image #" + id + " does not exist");
    }
    else if (elem.tagName !== "IMG")
    {
        console.log(elem.tagName);
        throw new Error("#" + id + " is not an image");
    }
    else if (!elem.complete)
    {
        throw new Error("Image #" + id + " not fully loaded");
    }
    return elem;
}

module.exports = {
    getById: function(ids)
    {
        //console.log(ids);

        if (typeof ids === "string")
        {
            return getById(ids);
        }
        else
        {
            return Array.prototype.map.call(ids, getById);
        }
    }
};
