var fs = require('fs');
const generateIndexForDirectory = require('../templates/index.js');

module.exports = function(content) {
	this.cacheable();
	this.addContextDependency(this.context);

	if (content.indexOf("'auto-generate'") !== -1) {
		return generateIndexForDirectory({ path: this.context });
	}
	
	return content;
};
