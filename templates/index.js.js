const fs = require('fs');

const exclude = ['__tests__', '.worker.ts'];

module.exports = function ({ path }, { ls } = {}) {
    var contents = fs.readdirSync(path).filter(x => x !== 'index.js');

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
        if (['.less'].indexOf(ext) !== -1) {
            src += `import './${module.file}';\n`

            continue;
        }

        toExport.push(module);

        src += `import ${module.name} from './${module.file}';\n`
    }

    src += `export default { ${toExport.map(x => x.name).join(', ')} };\n`

    return src;
}
