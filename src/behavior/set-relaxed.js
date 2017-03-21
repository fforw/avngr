module.exports = function (ctx, tree, node)
{
    tree.relaxed = node.value !== "false";
    return true;
};
