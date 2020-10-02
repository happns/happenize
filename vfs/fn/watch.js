const { fs } = require('../context');
const aliases = require('../aliases');

module.exports = function (path, options = undefined, listener) {
    console.log('watching for ' + path)
    if (aliases[path]) {
        path = aliases[path];
    }

    return fs.watch.call(this, path, options, listener);
}
