var path = require('path');
var fs = require('fs');

module.exports = function () {
	var compiler = this;
	var entryPath = path.join(this.context, 'src');

	compiler.plugin('environment', function () {
		var autoGenerated = [];

		compiler.inputFileSystem.stat = function (path, callback) {
			if (path.indexOf(entryPath) !== -1 && path.match(/index\.js$/)) {
				this.__proto__.stat.call(this, path, function (err, stats) {
					if (err) {
						autoGenerated.push(path);

						stats = new fs.Stats();
						stats.mode = 33206;

						callback(null, stats);
					}
					else {
						callback(err, stats);
					}
				});
			} else {
				this.__proto__.stat.apply(this, arguments);
			}
		};

		compiler.inputFileSystem.readFile = function (path, callback) {
			if (autoGenerated.indexOf(path) !== -1) {
				callback(null, "'auto-generate'");
			} else {
				this.__proto__.readFile.apply(this, arguments);
			}
		};
	});
};
