const fs = require('fs');

const exclude = ['__tests__', '.worker.ts'];

module.exports = function ({ path }, { ls, justImportExt = ['.less', '.css'] } = {}) {
    var listing = fs.readdirSync(path);
    var contents = listing.filter(x => x !== 'index.js');

    if (ls) {
        contents = ls(contents);
    }

    var src = '';

    var modules = contents
        .filter(fileName => fileName[0] !== '.' && !exclude.some(x => fileName.indexOf(x) !== -1))
        .map(fileName => {
            var name = fileName.split('.')[0];

            return { name: name, file: fileName };
        });

    const toExport = [];

    for (var module of modules) {
        const [, ext] = module.file.match(/(\.[^.]+)$/) || [];
        if (justImportExt.indexOf(ext) !== -1) {
            src += `import './${module.file}';\n`

            continue;
        }

        toExport.push(module);
    }

    const getter = module => `get ${module.name}() { return import('./${module.file}').then(module => module.default); }`;

    src += `export default { ${toExport.map(module => getter(module)).join(',\n')} };\n`

    return src;
}
