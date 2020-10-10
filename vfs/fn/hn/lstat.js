const files = require('../../files');
const aliases = require('../../aliases');

const getHandlerMatchByPath = require('../../getHandlerMatchByPath');

const DEVICE_ID = 0;

module.exports = ({ fs }) => function (...args) {
    const callback = args.pop();
    const [path, options = {}] = args;

    if (typeof callback !== 'function') {
        throw new Error('Requires callback to be a function, got ' + callback);
    }

    try {
        if (aliases[path]) {
            fs.promises.lstat(aliases[path])
                .then(stat => {
                    callback(null, stat)
                }, err => callback(err));

            return;
        }

        const handlerMatch = getHandlerMatchByPath(path, { fs });

        if (handlerMatch) {
            let stats;
            files[path] = files[path] || {};

            if (files[path].stats) {
                stats = files[path].stats;
            } else {
                stats = new fs.Stats();
                stats.mode = 33206;
            }

            if (callback) {
                callback(null, stats);
            }

            return stats;
        }

        return fs.lstat.apply(this, arguments);
    } catch (err) {
        callback(err);
    }
}
