const pathToNamespace = require('../pack/pathToNamespace.js');

const compiler = require('less');
const fs = require('fs');
const path = require('path');

const render = async (filepath, options, entryPath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, { encoding: 'utf-8' }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                const solvedNamespace = pathToNamespace({
                    path: path.dirname(filepath),
                    entryPath: entryPath || path.join(process.cwd(), 'src')
                });

                if (solvedNamespace) {
                    const { namespace, nsToDirectiveTagName } = solvedNamespace;

                    const directiveTagName = nsToDirectiveTagName(namespace);
                    data = directiveTagName ? `[_c_${directiveTagName}] { ${data} }` : data;
                }

                compiler.render(data, { ...options, filename: filepath }, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
    });
};

module.exports = function plugin(snowpackConfig, options = {}) {
    return {
        name: 'less-namespace-plugin',
        resolve: {
            input: ['.less'],
            output: ['.css'],
        },
        async load({ filePath }) {
            try {
                const result = await render(filePath, options, snowpackConfig.entryPaths);
                return {
                    '.css': result.css,
                };
            } catch (err) {
                console.error(err);
            }
        },
    };
};
