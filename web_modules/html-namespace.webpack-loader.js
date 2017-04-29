var fs = require('fs');
var path = require('path');

module.exports = function(content) {
	var handler = context => content
		// replace the current namespace sign (i.e. ':') to the current namespace (with dashed instead of camelCase)
		.replace(/(<):|(<\/):/g, `$1$2${context.camelCaseToDashes(context.namespace)}.`)
		// handle .. (go up)
		.replace(/[^\.]+\.{3}/g, '')
		// replace all dots in the namespace '.' to underscores '_' so it could be handled by CSS/LESS
		.replace(/(<\/?)([^\s>]+)/g, x => x.replace(/\./g, '_'))
		.replace(/translate=":/g, `translate="${context.namespace}.`)
		.replace(/\{\{\s*(\(\s*)*(['"]):/g, `{{$1$2${context.namespace}.`);

	return require('./namespace.webpack-loader')
		.call(this, content, handler);
};
