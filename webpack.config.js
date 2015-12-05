var getConfig = require('hjs-webpack');
var fs = require('fs');	

module.exports = getConfig({
	in: 'src/index.js',
	out: 'public',
	isDev: (process.env.NODE_ENV !== 'production') || true,
	html: function () {
		return String(fs.readFileSync(__dirname + '/src/index.html'));
	}
});