const messages = {
		worked: '%name%, %cName% has %count% follower%s%.',
		notFound: 'User not found'
	};

module.exports = ({ tAPI, utils }) => function({ channel, params, perms }) {
	let prom = Promise.resolve(channel);
	if(params.length && perms.modUp) {
		prom = tAPI.getUserByName(params[0])
			.then(utils.throwOnNull);
	}
	return prom
	.then(check => {
		return tAPI.followers(check._id)
		.then(({ res, body: { _total, _cursor, follows } }) => {
			let msg = messages.worked,
				context = {
					cName: check.name,
					count: _total,
					s: utils.s(_total)
				};
			return this.reply(msg, context);
		});
	})
	.catch(err => {
		// Channel doesn't exist or is inaccessible.
		if(err === null) {
			return this.reply(messages.notFound);
		}
	});
};
