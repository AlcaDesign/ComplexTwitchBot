// Export an object.
module.exports = {
	// Enable debugging.
	debug: true,
	// Twitch-related configurations.
	twitch: {
		// This Twitch bot configuration.
		bot: {
			// The username of the owner, lowercase.
			owner: 'username',
			// The identity of the bot.
			identity: {
				// The username it will use.
				username: 'username',
				// The OAuth token for the bot, must match the username.
				password: 'OAuth_token'
			},
			// The channels to initially connect to.
			channels: [
				'username'
			]
		},
		// Configuration for the Twitch API.
		api: {
			// The Twitch Kraken API client ID
			clientID: 'client_ID'
		}
	}
};
