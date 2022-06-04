const path = require('path');
const fs = require('fs');

const exclude = ['__tests__', '.worker.ts'];

module.exports = function ({ path: p }, { ls, justImportExt = ['.less', '.css'] } = {}) {
    var listing = fs.readdirSync(p);
    var contents = listing.filter(x => x !== 'index.js');

    if (ls) {
        contents = ls(contents);
    }

    var src = '';

    var modules = contents
        .filter(fileName => fileName[0] !== '.' && !exclude.some(x => fileName.indexOf(x) !== -1))
        .map(fileName => {
            var name = fileName.split('.')[0];

            return { name: name, file: fileName, import: `./${fileName}` };
        });

    const toExport = [];

    for (var module of modules) {
        const [, ext] = module.file.match(/(\.[^.]+)$/) || [];
        if (justImportExt.indexOf(ext) !== -1) {
            src += `import '${module.import}';\n`;
            module.named = false;

            continue;
        }

        toExport.push(module);

        module.named = true;
        module.hmrImport = path.relative('.', path.resolve(p, module.import));

        // // XXX not sure why this is the case
        // if (module.import.endsWith('.html')) {
        //     module.hmrImport += '?import';
        // }

        const isHmrEnabled = module => ['template'].includes(module.name);
        let extImport = ''

        if (isHmrEnabled(module)) {
            const onHmrUpdate = `${module.name}_onHmrUpdate`
            extImport =  `, { onHmrUpdate as ${onHmrUpdate} }` 
            module.onHmrUpdate = onHmrUpdate;
        }

        src += `import ${module.name}${extImport} from '${module.import}';\n`;
    }

// TODO add HMR
    src += `\
import HMR from 'happenize/vite/hmr.js';

const _component_ = { ${toExport.map(x => x.name).join(', ')} };

if (import.meta.hot && typeof template !== 'undefined') {
    HMR.applyToComponent(import.meta, _component_, ${JSON.stringify(modules)}, { ${modules.map(x => x.onHmrUpdate).filter(x => x).join(', ')} });
}

export default _component_;
`;

    return src;
}
