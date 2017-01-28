// Load the tmi.js library.
const tmi = require('tmi.js'),
	
	// Command utlity functions.
	commands = require('./lib/commands'),
	// Formatting utility functions.
	format = require('./lib/format'),
	// Twitch API functions.
	tAPI = require('./lib/twitch-api'),
	// General utility functions.
	utils = require('./lib/utils'),
	
	// Your config file.
	config = require('./config');

// Create the client.
let client = new tmi.client({
		// Basic options for tmi.js.
		options: {
			// Whether or not to log tmi.js debug information.
			debug: config.debug,
			// Your Twitch application API client ID.
			clientID: config.twitch.api.clientID
		},
		// tmi.js options about the connection to the servers.
		connection: {
			// Use wss:// instead of ws:// for the connection.
			secure: true,
			// Automatically reconnect to the servers if the connection is lost.
			reconnect: true
		},
		// The "identity" of the bot. Username and OAuth token from the config.
		identity: config.twitch.bot.identity,
		// The channels to automatically join upon connecting.
		channels: config.twitch.bot.channels
	});

commands.load();

// Attach the listener and some basic setup.
client.on('message', function(_channel, _userstate, message, self) {
	// Quickly filter out definitely-not-command messages.
	if(self || !commands.testMessage(message)) {
		// Return early.
		return;
	}
	
	// Convert keys like "display-name" to "display_name" for relative ease.
	let userstate = utils.kebabToSnake(_userstate),
		// Remove the "#" from the channel name. This might change, so it's pre-
		// pared for if the "#" is no longer passed with it from the library.
		chan = _channel[0] === '#' ? _channel.slice(1) : channel;
	
	// "userstate.name" is good for when you're actually talking in the chat. It
	// will use the display name of the user if available and fallback to the
	// lowercase "login" username from the userstate.
	userstate.name = userstate.display_name || userstate.username;
	
	// Skip the first character and split the message by spaces.
	let params = message.slice(1).split(' '),
		// Just the command name out of the params, lowercased.
		commandName = params.shift().toLowerCase(),
		// The permissions for the user.
		perms = commands.getPermissions(chan, userstate),
		// A basic channel object for use in commands.
		channel = {
			// The Twitch ID of the channel.
			_id: userstate.room_id,
			// The "login" form of the channel name.
			username: chan,
			// A display name for the channel. If the user is the broadcaster,
			// then use the display name from the userstate.
			name: perms.broadcaster ? userstate.name : chan
		},
	
		// Major context from the message.
		messageContext = {
			// The name of the user.
			name: userstate.name,
			// The channel from which the message is from.
			chan
		},
		// Basic actions to take on the user.
		actions = {
			reply: (msg, _context) => {
				// Create a new context object to include the major context from
				// the message and the context from the function call.
				let context = Object.assign({}, messageContext, _context);
				// Format and send the message, return the Promise.
				return client.say(_channel, format(msg, context));
			}
		},
		// Group our data.
		data = {
			chan, userstate, message, self,
			params, commandName, perms, channel,
			actions
		},
		// Find the command from the core list.
		command = commands.find(commandName);
	
	// No commands found.
	if(command === null) {
		return;
	}
	
	// Let's try it out! Bind the actions object and use the better arguments.
	command.action.call(actions, data)
		// Looks like everything probably went well.
		.then(data => {
			// Congratulations.
			console.log(data);
		})
		// Something probably didn't happen or some error occurred.
		.catch(err => {
			// There /is/ an error.
			if(err) {
				// Log the error, etc.
				console.log(err);
			}
			// All clear. Something still could have gone wrong, but it wasn't
			// a bad issue.
			else {
				// Handle this somehow.
			}
		});
});

// Connect the client to the servers.
client.connect();
