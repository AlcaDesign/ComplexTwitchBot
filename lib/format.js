// Regex for formatting parts of strings
let regex = /[@%](\w+)[@%]/g;

// Used for replacing a section of a string indicated as a word surrounded by
// "%" and/or "@" characters. For example: "Hello, %name%!" with { name: 'Dan' }
// as the context becomes "Hello, Dan!"
function format(string = '', context = null) {
	// Making sure if it needs to do anything or not.
	if(typeof string !== 'string' || string.length <= 2 || context === null) {
		// Return early.
		return string;
	}
	// Do the replacing now.
	return string.replace(regex, (match, param, offset, str) => {
		/*if(match[0] !== match[match.length - 1]) {
			return match;
		}*/
		// If the parameter, like "name" is in the context.
		if(param in context) {
			// Get the value from the context.
			let p = context[param];
			// If it's a number, we can format it to include the commas for
			// thousands places and also reduce the decimal to 2 places, if
			// available.
			if(typeof p === 'number') {
				return p.toLocaleString();
			}
			// Return that value.
			return p;
		}
		// Didn't find it, so just return the initial match.
		return match;
	});
}

// Export just the format function.
module.exports = format;
