const path = require('path');
const watchListeners = require('./watchListeners');

module.exports = new Proxy({}, {

    set(target, key, value) {
        target[key] = value;

        const dirname = path.dirname(key);
        const listeners = watchListeners[dirname];

        if (listeners && listeners.size) {
            for (const listener of listeners) {
                listener('change', dirname);
            }
        }
    }
});
