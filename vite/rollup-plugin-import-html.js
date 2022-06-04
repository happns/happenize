const path = require('path');
const containsEntryPath = require('../pack/containsEntryPath');
const transform = require('../transforms/html-transform');
const template = require('./templates/html');

module.exports = function ImportHTML({ entryPaths } = { entryPaths: ['./src/'] }) {
    return {
        name: 'import-html', // required, will show up in warnings and errors
        async transform(code, id) {
            if (id.endsWith('.html')) {
                const dir = path.dirname(id);
                const entryPath = containsEntryPath(dir, entryPaths);
                const transformedCode = transform(code, id, { entryPath });

                return template(transformedCode);
            }
        }
    }
}
