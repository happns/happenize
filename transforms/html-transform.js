const path = require('path');
const pathToNamespace = require('../pack/pathToNamespace.js');

module.exports = function (code, id, { entryPath }) {
    const filePath = id;
	const solvedNamespace = pathToNamespace({
		path: path.dirname(filePath),
		entryPath: entryPath || path.join(process.cwd(), 'src')
	});

	if (!solvedNamespace) {
		return code;
	}

	const { namespace, camelCaseToDashes } = solvedNamespace;

	return code
		// replace the current namespace sign (i.e. ':') to the current namespace (with dashed instead of camelCase)
		.replace(/(<):|(<\/):/g, `$1$2${camelCaseToDashes(namespace)}.`)
		// handle .. (go up)
		.replace(/[^.]+\.{3}/g, '')
		// replace all dots in the namespace '.' to underscores '_' so it could be handled by CSS/LESS
		.replace(/(<\/?)([^\s>]+)/g, x => x.replace(/\./g, '_'))
		.replace(/translate=":/g, `translate="${namespace}.`)
		.replace(/\{\{\s*(\(\s*)*(['"]):/g, `{{$1$2${namespace}.`);
}
