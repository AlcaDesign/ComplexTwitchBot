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
		channels: config.twitch.bot.channels.slice()
	});

// Load the commands.
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
		chan = _channel[0] === '#' ? _channel.slice(1) : _channel;
	
	// "userstate.name" is good for when you're actually talking in the chat. It
	// will use the display name of the user if available and fallback to the
	// lowercase "login" username from the userstate.
	userstate.name = userstate.display_name || userstate.username;
	userstate._id = userstate.user_id;
	
	// Skip the first character and split the message by spaces.
	let params = message.slice(1).split(' '),
		// Just the command name out of the params, lowercased.
		commandName = params.shift().toLowerCase(),
		// Find the command from the core list.
		command = commands.find(commandName);
	
	// No command found. You may wish to use custom channel commands and this is
	// the point where you should check wherever for this channel's custom
	// commands. This function may need to be changed slightly to accommodate
	// for the async calls to the database.
	if(command === null) {
		return;
	}
	
	// The permissions for the user.
	let perms = commands.getPermissions(chan, userstate),
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
		// Get the channel object from the API when the bot loaded.
		channelAPI = config.twitch.bot.channels
			.find(n => n.name === chan) || null,
	
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
		};

	// If the API data is available for this channel, add it to the channel
	// object for use in commands.
	if(channelAPI !== null) {
		Object.assign(channel, channelAPI);
	}
	
	// Check if there are parameters to use.
	params.has = params.length > 0;
	// Use which channel permissions?
	let comPerm = true,
		// Use which channel permissions for params?
		comPP = false;
	// Check for the partner permissions.
	if(channel.partner && 'partner' in command.permissions) {
		comPerm = command.permissions.partner;
	}
	else {
		// Check for the non-partner permissions.
		comPerm = 'notPartner' in command.permissions ?
			command.permissions.notPartner : comPerm;
	}
	// If comPerm is null, it's the default "true."
	if(comPerm === null) {
		comPerm = true;
	}
	
	// Check for the partner permissions.
	if(channel.partner && 'useParamsPartner' in command.permissions) {
		comPP = command.permissions.useParamsPartner;
	}
	else {
		// Check for the non-partner permissions.
		comPP = 'useParams' in command.permissions ?
			command.permissions.useParams : comPP;
	}
	
	// Check if there are parameters to use and the user has permission to use
	// them for this command.
	params.use = params.has &&
		(
			// Check that "useParams" is a key in the permissions for the
			// command.
			'useParams' in command.permissions &&
			(
				// The params could be "true" or "null" meaning true.
				[true, null].indexOf(comPP) > -1 ||
				// Or, check them against the permissions object.
				perms[comPP]
			)
		);
	
	// Check that the user has permission to use the command.
	if(comPerm === false || (typeof comPerm === 'string' && !perms[comPerm])) {
		return;
	}
	// Check that the user has the necessary parameters for the command.
	else if(
		(comPP === true && !params.has) ||
		(typeof comPP === 'number' && comPP > 0 && params.length < comPP)
	) {
		return;
	}
	
	
	// Let's try it out! Bind the actions object and use the better arguments.
	command.action.call(actions, data)
	// Looks like everything probably went well.
	.then(data => {
		// Congratulations.
		if(data !== undefined) {
			console.log(data);
		}
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

// Get data from the Twitch API about each channel.
let proms = config.twitch.bot.channels.map((n, i, a) =>
		new Promise((resolve, reject) => {
			let p = () => tAPI.userByName(n)
				.then(data => {
					if(data === null) {
						return;
					}
					return tAPI.channel(data._id)
					.then(({ res, body }) =>
						a[i] = res.statusCode === 200 ? body : {}
					);
				})
				.then(resolve)
				.catch(reject);
			setTimeout(p, 80 * i);
		})
	);

// Wait for all of the channel API requests.
Promise.all(proms)
// Connect the client to the servers.
.then(() => client.connect())
.catch(err => {
	if(err) {
		console.log(err);
	}
});
