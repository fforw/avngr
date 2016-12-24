module.exports = function (candidate)
{
    return candidate && typeof candidate == "object" && candidate.length && candidate[0];
};
