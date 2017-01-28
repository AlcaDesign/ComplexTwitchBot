// Require the configuration file.
const config = require('../config'),
	
	coreList = require('./coms/core_command_list'),
	
	common = require('./coms/common'),
	
	regex = /^[!@#$%^]\w+/;

function loadCommands() {
	coreList.forEach(n => {
			if(n.action === false) {
				return;
			}
			try {
				n.fileName = './coms/command_scripts/' + (n.fileName || n.name);
				n.action = require(n.fileName);
			} catch(e) {
				n.action = null;
				console.log(e);
				return;
			}
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

function findCommand(name, list = coreList) {
	if(typeof name !== 'string') {
		return null;
	}
	
	let command = list.find(n =>
			typeof n.action === 'function' &&
			(
				n.name === name ||
				n.alias.includes(name)
			)
		);
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
