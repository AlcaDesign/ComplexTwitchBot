function throwOnNull(n) {
	if(n === null) {
		throw null;
	}
	return n;
}

function kebabToSnake(obj) {
	return Object.keys(obj)
		.reduce((p, key) => {
			p[key.replace(/-/g, '_')] = obj[key];
			return p;
		}, {});
}

function s(n, plural) {
	return n === 1 ? '' : plural || 's';
}

module.exports = {
	kebabToSnake,
	s,
	throwOnNull
};
