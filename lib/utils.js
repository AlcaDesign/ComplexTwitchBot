// Load the countdown module.
const countdown = require('countdown'),
	
	// Set the units for the ago command using the countdown moudle. This is a 
	agoUnits = 158; /*['seconds', 'minutes', 'hours', 'days', 'years']
		.reduce((p, n) => p |= countdown[n.toUpperCase()], 0);*/

// Set options for the countdown module.
countdown.setLabels(
		'ms|s|m|h|d|w|mo|y|de|c|me',
		'ms|s|m|h|d|w|mo|y|de|c|me',
		' ', ' '
	);

// If `n` is null, this function throws `null`.
function throwOnNull(n) {
	if(n === null) {
		throw null;
	}
	return n;
}

// Convert kebab-style to snake_style.
function kebabToSnake(obj) {
	// Get the keys for `obj`
	return Object.keys(obj)
		// Reduce the Array into an object similar to the original.
		.reduce((p, key) => {
			// Replace the key's hyphens with underscores and set it to the new
			// object.
			p[key.replace(/-/g, '_')] = obj[key];
			// Return the new object for the next loop.
			return p;
		// This is the object that things will be merged to.
		}, {});
}

// Check if value is NaN.
function isNaN(value) {
	return typeof value == 'number' && value != +value;
}

// Get a formatted time difference.
function ago(start, end = Date.now(), withoutSuffix = false) {
	// The start time in milliseconds.
	start = new Date(start).getTime();
	// The end time in milliseconds.
	end = end === null ? Date.now() : new Date(end).getTime();
	// Ensure that the times were valid.
	if(isNaN(start) || isNaN(end)) {
		return null;
	}
	// Use the countdown module to do most of the work.
	let c = countdown(start, end, agoUnits).toString() || '0s';
	// If withoutSuffix is undefined or false, it will add a simple suffix to
	// the end of the string depending on if the time difference is positive or
	// negative.
	if(!withoutSuffix) {
		c += ' ' + (start < end ? 'ago' : 'from now');
	}
	// Return the final string.
	return c;
}

// If `n` is not 1, it returns the passed `plural` or "s".
function s(n, plural) {
	return n === 1 ? '' : plural || 's';
}

// Export the utility functions.
module.exports = {
	ago,
	isNaN,
	kebabToSnake,
	s,
	throwOnNull
};
