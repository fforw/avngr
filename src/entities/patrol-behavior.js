const Behavior = require("ff-behavior");

/**
 * Patrol behavior as its own module to provide patrol-routes during level-load.
 *
 * @type {Behavior}
 */
module.exports = Behavior.load( require("../behavior/behaviors/patrol.json"));
