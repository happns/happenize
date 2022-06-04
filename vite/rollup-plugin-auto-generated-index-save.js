const path = require('path');
const fs = require('fs');

module.exports = function AutoGeneratedIndexSavePlugin({ rootPath, generatedPath } = { rootPath: './src', generatedPath: './generated' }) {
    const virtualModuleId = 'virtual:auto-generated-index:'
    const resolvedVirtualModuleId = '\0' + virtualModuleId

    return {
        name: 'auto-generated-index-save',
        async transform(code, id) {
            if (id.startsWith(resolvedVirtualModuleId)) {
                const p = id.replace(resolvedVirtualModuleId, '');
                const relativePath = path.relative(rootPath, p);

                const targetPath = path.join(generatedPath, relativePath);

                const dir = path.dirname(targetPath);
                fs.mkdirSync(dir, { recursive: true });

                fs.writeFileSync(targetPath, code);
            }
        }
   }
}
