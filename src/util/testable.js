/**
 * Test helper module. Is used in sources as neutral function just returning its input.
 *
 * In tests, the module can be replaced with proxyquire to instrument the internal module data based on either the
 * data itself or the optional opts
 * @param input     data input
 * @param opts      {*?}    opts to react to in test
 * @returns {*}
 */
module.exports = function(input, opts)
{
    return input;
};
