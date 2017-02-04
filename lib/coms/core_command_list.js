// This is our list of commands for the bot. It includes information about the
// command name, the filename if it differs from the command name, the required
// permissions (in a partnered channel, not, using params, etc.), if parameters
// are required, and whether or not the command is available. I suggest keeping
// them in alphabetical order in this list.
// Permissions correspond with the `command.getPermissions` object. If the value
// is `true`, then permission is granted by default.
module.exports = [
{
	name: 'created',
	alias: ['accountage','usercreated','creted'],
	permissions: {
		partner: 'subUp',
		notPartner: true,
		useParams: 'modUp',
		useParamsPartner: 'subUp'
	},
	hasParams: false,
	action: null
},{
	name: 'followers',
	alias: ['followcount','follows','folowers','folows'],
	fileName: 'followcount',
	permissions: {
		partner: 'subUp',
		notPartner: true,
		useParams: 'modUp'
	},
	hasParams: false,
	action: null
}
];
