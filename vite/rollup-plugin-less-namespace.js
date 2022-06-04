const path = require('path');
const containsEntryPath = require('../pack/containsEntryPath');
const transform = require('../transforms/less-transform');

module.exports = function LessNamespace({ entryPaths } = { entryPaths: ['./src/'] }) {
    return {
        name: 'less-namespace',
        enforce: 'pre',
        async transform(code, id) {
            if (id.endsWith('less')) {
                const dir = path.dirname(id);
                const entryPath = containsEntryPath(dir, entryPaths);
                const transformedCode = transform(code, id, { entryPath });

                return transformedCode;
            }
        }
    }
}
