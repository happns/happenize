const path = require('path');
const pathToNamespace = require('../pack/pathToNamespace.js');

module.exports = function (code, id, { entryPath }) {
    const solvedNamespace = pathToNamespace({
        path: path.dirname(id),
        entryPath: entryPath || path.join(process.cwd(), 'src')
    });

    if (solvedNamespace) {
        const { namespace, nsToDirectiveTagName } = solvedNamespace;

        const directiveTagName = nsToDirectiveTagName(namespace);

        if (directiveTagName) {
            return `[_c_${directiveTagName}] { ${code} }`;
        }
    }

    return code;
}
