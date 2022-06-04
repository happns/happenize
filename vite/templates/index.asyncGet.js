const fs = require('fs');

const exclude = ['__tests__', '.worker.ts'];

module.exports = function ({ path }, { ls, justImportExt = ['.less', '.css'] } = {}) {
    var listing = fs.readdirSync(path);
    var contents = listing.filter(x => x !== 'index.js');

    if (ls) {
        contents = ls(contents);
    }

    var src = `import HMR from 'happenize/vite/hmr';
import registerPartials from 'happenize/utils/registerPartials';\n`;

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

    const getter = module => `
get ${module.name}() { 
    if (!this._${module.name}) {

        return this._${module.name} = import('./${module.file}')
            .then(module => module.default)
            .then(module => {
                module.name = '${module.name}';
                this._${module.name} = module;
                registerPartials.bind(HMR.module)({ ${module.name}: module });

                return module;
            });
    }

    return this._${module.name};
}`;

    src += `export default { async: true, ${toExport.map(module => getter(module)).join(',\n')} };\n`

    return src;
}
