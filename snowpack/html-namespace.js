const fs = require('fs');
const path = require('path');

const template = require('../templates/template.html.js');
const vfsHandlers = require('../vfs/handlers');

const pathToNamespace = require('../pack/pathToNamespace.js');

const aliases = require('../vfs/aliases');

const containsEntryPath = require('../pack/containsEntryPath');
const { before } = require('../vfs/hooks.js');

const render = function (filePath, { fs, entryPath }) {
	const fileContents = fs.readFileSync(filePath, 'utf-8');

	const solvedNamespace = pathToNamespace({
		path: path.dirname(filePath),
		entryPath: entryPath || path.join(process.cwd(), 'src')
	});

	if (!solvedNamespace) {
		return fileContents;
	}

	const { namespace, camelCaseToDashes } = solvedNamespace;

	return fileContents
		// replace the current namespace sign (i.e. ':') to the current namespace (with dashed instead of camelCase)
		.replace(/(<):|(<\/):/g, `$1$2${camelCaseToDashes(namespace)}.`)
		// handle .. (go up)
		.replace(/[^.]+\.{3}/g, '')
		// replace all dots in the namespace '.' to underscores '_' so it could be handled by CSS/LESS
		.replace(/(<\/?)([^\s>]+)/g, x => x.replace(/\./g, '_'))
		.replace(/translate=":/g, `translate="${namespace}.`)
		.replace(/\{\{\s*(\(\s*)*(['"]):/g, `{{$1$2${namespace}.`);
}

module.exports = function (snowpackConfig) {
	before('readdir', ({ fs }, dir) => {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const fileName = path.join(dir, file);

            if (fileName.match(/\.html$/)) {
				const alias = fileName + '.vnode.js';
				aliases[alias] = fileName;
			}
        });
	});

	const vfsHandler = {
		test: (fileName, { fs }) => {
			const sanitizedFileName = fileName.indexOf('.vnode') !== -1 ? fileName : fileName.replace(`${path.sep}public${path.sep}_dist_${path.sep}`, `${path.sep}src${path.sep}`);
			const entryPath = containsEntryPath(sanitizedFileName, snowpackConfig.entryPaths);

			if (entryPath) {
				const match = fileName.match(/(.+)\.html(\.vnode)*(\.js)?$/);

				if (match) {
					const htmlFileName = sanitizedFileName
						.replace(/\.vnode(\.js)?/g, '')

					if (fs.existsSync(htmlFileName)) {
						if (fileName !== htmlFileName) {
							aliases[fileName] = htmlFileName;
						}

						return match;
					}
				}
			}
		},

		load: (fileName, { fs }) => {
			const htmlFileName = aliases[fileName] || fileName;
			const content = render(htmlFileName, { fs, entryPath: snowpackConfig.entryPaths });

			if (fileName.slice(-6) === '.vnode') {
				return template(content);
			}

			if (!content.toString().match(/<head(\s|\/|>)/)) {
				return `export default ${JSON.stringify(content.toString())}` + '/* <head></head> */';
			}

			return content;
		}
	};

	vfsHandlers.push(vfsHandler);

	return {
		name: 'html-namespace-plugin',
		resolve: {
			input: ['.vnode'],
			output: ['.js'],
		},
		async load({ filePath }) {
			const fileContents = fs.readFileSync(filePath, 'utf-8');

			return fileContents;
		}
	};
};
