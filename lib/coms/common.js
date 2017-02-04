// Load the format module.
const format = require('../format'),
	// Load the twitchAPI module.
	twitchAPI = require('../twitch-api'),
	// Load the utils module.
	utils = require('../utils');

// Export the loaded modules along with some aliases.
module.exports = {
	twitchAPI,
	tAPI: twitchAPI,
	utils,
	u: utils,
	format,
	f: format
};
