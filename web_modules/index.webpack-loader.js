const generateIndexForDirectory = require('../templates/index.webpack.js');

module.exports = function (content) {
	this.cacheable();
	this.addContextDependency(this.context);

	if (content.indexOf("'auto-generate'") !== -1) {
		return generateIndexForDirectory({ path: this.context }, { justImportExt: [] });
	}

	return content;
};
