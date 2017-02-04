// Require the configuration file.
const config = require('../config'),
	
	// The core list of commands that needs loading.
	coreList = require('./coms/core_command_list'),
	
	// Command modules for the commands.
	common = require('./coms/common'),
	
	// Command identifiers
	regex = /^[!@#$%^]\w+/;

// Load the commands.
function loadCommands() {
	// Go through each command.
	coreList.forEach(n => {
			// If the action is false, assume the command is disabled.
			if(n.action === false) {
				return;
			}
			// Format the script filename for the command and then try to load
			// the command. A try/catch is used in case there's an issue with
			// loading the command script.
			try {
				n.fileName = './coms/command_scripts/' + (n.fileName || n.name);
				n.action = require(n.fileName);
			} catch(e) {
				// Error loading the command script. Set action to `null`.
				n.action = null;
				// Log the error.
				console.log(e);
				return;
			}
			// Pass the common modules to the command script and set the
			// resulting function to the command's action.
			n.action = n.action(common);
		});
	return coreList;
}

// Text the message to see if it's probably like a command.
function testMessage(str) {
	return regex.test(str);
}

// Get a permissions object which relates to the user in a channel.
function getPermissions(chan, userstate) {
	// If they're a subscriber.
	let sub = userstate.subscriber,
		// If they're a moderator.
		mod = userstate.mod || userstate.user_type === 'mod',
		// If they're a global moderator.
		globalMod = userstate.user_type === 'global_mod',
		// If they're an admin.
		admin = userstate.user_type === 'admin',
		// If they're staff.
		staff = userstate.user_type === 'staff',
		// If they're the broadcaster.
		broadcaster = chan === userstate.username,
		// If they're the owner of the bot.
		owner = userstate.username === config.twitch.bot.owner,
		
		// Combine multiple permissions.
		supreme = broadcaster || staff || admin || owner,
		modUp = mod || supreme,
		subUp = sub || modUp;
	
	// The object to return with all of the data.
	return {
		sub, mod, broadcaster, admin, staff, owner,
		subUp, modUp, supreme
	};
}

// Find a command by name in a list of commands. Defaults to the core list.
function findCommand(name, list = coreList) {
	// If `name` is not a string or there's nothing in it, return null.
	if(typeof name !== 'string' || !name.length) {
		return null;
	}
	
	// Try to find the command.
	let command = list.find(n =>
			// If the action is a function.
			typeof n.action === 'function' &&
			// And the name matches or is in the alias Array.
			(
				n.name === name ||
				n.alias.includes(name)
			)
		);
	// Return the command or null if it wasn't found.
	return command || null;
}

// Export the functions.
module.exports = {
	coreList,
	getPermissions,
	find: findCommand,
	load: loadCommands,
	testMessage
};
