const proxify = require('../proxify');

const { fs } = require('../context');
const aliases = require('../aliases');
const watchListeners = require('../watchListeners');

module.exports = function (...args) {
    let listener = args.pop();
    const [path, options = {}] = args;

    let watcher;
    if (aliases[path]) {
        const targetListener = listener;
        listener = (eventType) => targetListener(eventType, path);

        watcher = fs.watchFile.call(this, aliases[path], options, listener);
    } else {
        watcher = fs.watchFile.call(this, path, options, listener);
    }

    watchListeners[path] = watchListeners[path] || new Set();

    watchListeners[path].add(listener);

    // add to watchers
    return watcher;
}
