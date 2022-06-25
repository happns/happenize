const fs = require('fs');
const path = require('path');

const templates = {
    default: require('./templates/index'),
    asyncGet: require('./templates/index.asyncGet')
}

const generateIndexForDirectory = function ({ moduleTemplates, path: p }) {
    if (moduleTemplates) {
        for (let key in moduleTemplates) {
            if (p === path.resolve(key)) {
                return templates[moduleTemplates[key]].apply(templates, arguments);
            }
        }
    }

    return templates.default.apply(templates, arguments);
}

module.exports = function AutoGeneratedIndexPlugin({ moduleTemplates }) {
    const virtualModuleId = 'virtual:auto-generated-index:'
    const resolvedVirtualModuleId = '\0' + virtualModuleId

    return {
        name: 'auto-generated-index', // required, will show up in warnings and errors
        resolveId(id, importer) {
            let resolvedFileName, stat

            const importRelativePath = id.replace(virtualModuleId, '')
            const basePath = path.dirname(importer.replace(resolvedVirtualModuleId, ''));
            const importAbsolutePath = path.join(basePath, importRelativePath);

            try {
                // check if directory exists
                stat = fs.statSync(importAbsolutePath)
            } catch (err) {
                return;
            }

            if (stat.isDirectory()) {
                resolvedFileName = path.join(importAbsolutePath, 'index.ts')
                const allowedExtensions = ['ts', 'js'];
                for (const fileName of allowedExtensions.map(ext => path.join(importAbsolutePath, `index.${ext}`))) {
                    if (fs.existsSync(fileName)) {
                        resolvedFileName = undefined
                    }
                }

                if (resolvedFileName) {
                    return `${resolvedVirtualModuleId}${resolvedFileName}`;
                }
            } 

            if (stat && importer.indexOf(resolvedVirtualModuleId) === 0) {
                return path.join(basePath, id);
            }
        },
        load(id) {
            if (id.indexOf(resolvedVirtualModuleId) === 0) {
                const [, , fileName] = id.split(':');

                const p = path.dirname(fileName);
                return generateIndexForDirectory({
                    moduleTemplates,
                    path: p
                });
            }
        }
    }
}