const { fs } = require('../context');
const watchListeners = require('../watchListeners');

module.exports = function (...args) {
    const [path, listener] = args;

    if (listener) {
        watchListeners[path].delete(listener);
    }

    fs.unwatchFile.call(this, path, listener);
}
