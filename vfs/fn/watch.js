const proxify = require('../proxify');

const { fs } = require('../context');
const aliases = require('../aliases');
const watchListeners = require('../watchListeners');

module.exports = function (path, options = undefined, listener) {
    let watcher;
    if (aliases[path]) {
        watcher = fs.watch.call(this, aliases[path], options, (eventType) => listener(eventType, path));
    } else {
        watcher = fs.watch.call(this, path, options, listener);
    }

    watchListeners[path] = watchListeners[path] || new Set();

    watchListeners[path].add(listener);

    // add to watchers
    return proxify(watcher, {
        close: function () {
            watchListeners[path].delete(listener);

            return watcher.close();
        }
    });
}
