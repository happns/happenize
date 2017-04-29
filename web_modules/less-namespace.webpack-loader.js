var fs = require('fs');
var path = require('path');

module.exports = function(content) {
	var shouldScopeLessContent = context =>
		// partials and components have own directives, but e.g. dialogs and bottomSheets don't 
		(context.itemCollectionName === 'partials' || context.itemCollectionName === 'components') &&
		// root components are not used as directives so there won't be tag name associated with it
		!context.isRootComponent;
		
	
	var handler = context => shouldScopeLessContent(context) ? `${context.nsToDirectiveTagName(context.namespace)}, [_c_${context.nsToDirectiveTagName(context.namespace)}] { ${content} }` : content;

	return require('./namespace.webpack-loader')
		.call(this, content, handler);
};
