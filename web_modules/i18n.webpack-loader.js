var fs = require('fs');
var path = require('path');

module.exports = function(content) {
	var handler = context => `"${context.namespace.replace(/\.?i18n$/, '')}": ${content}`;

	return require('./namespace.webpack-loader')
		.call(this, content, handler);
};
