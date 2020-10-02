const template = require('../templates/template.html.js');
const vfsHandlers = require('../vfs/handlers');

const fs = require('fs');
const path = require('path');

const pathToNamespace = require('../pack/pathToNamespace.js');

const aliases = require('../vfs/aliases');

module.exports = function (snowpackConfig, pluginOptions) {
	vfsHandlers.push({
		test: (fileName, { fs }) => {

			const match = fileName.match(/(.+)\.html\.vnode(\.vnode)?$/);

			const htmlFileName = fileName.replace(/\.vnode/g, '');

			if (fs.existsSync(htmlFileName) && match) {
				aliases[fileName] = htmlFileName;

				return match;
			}
		},

		load: (fileName, { fs, match }) => {
			const htmlFileName = match[1] + '.html';
			const content = fs.readFileSync(htmlFileName);

			return template(content);
		}
	});

	return {
		name: 'html-namespace-plugin',
		resolve: {
			input: ['.vnode'],
			output: ['.js'],
		},
		async load({ filePath }) {
			const fileContents = fs.readFileSync(filePath, 'utf-8');

			const { namespace, camelCaseToDashes } = pathToNamespace({
				path: path.dirname(filePath),
				entryPath: path.join(process.cwd(), 'src')
			});

			return fileContents
			// replace the current namespace sign (i.e. ':') to the current namespace (with dashed instead of camelCase)
			.replace(/(<):|(<\/):/g, `$1$2${camelCaseToDashes(namespace)}.`)
			// handle .. (go up)
			.replace(/[^\.]+\.{3}/g, '')
			// replace all dots in the namespace '.' to underscores '_' so it could be handled by CSS/LESS
			.replace(/(<\/?)([^\s>]+)/g, x => x.replace(/\./g, '_'))
			.replace(/translate=":/g, `translate="${namespace}.`)
			.replace(/\{\{\s*(\(\s*)*(['"]):/g, `{{$1$2${namespace}.`);
		}
	};
};
