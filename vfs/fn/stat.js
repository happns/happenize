const { fs } = require('../context');

const files = require('../files');
const aliases = require('../aliases');

const getHandlerMatchByPath = require('../getHandlerMatchByPath');

module.exports = function (path, callback) {
    if (aliases[path]) {
        return fs.stat.call(this, aliases[path], callback);
    }

    const handlerMatch = getHandlerMatchByPath(path, { fs });

    if (handlerMatch) {
        const stats = new fs.Stats();
        stats.mode = 33206;

        files[path] = files[path] || {};
        files[path].stats = stats;

        if (callback) {
            callback(null, stats);
        }

        return stats;
    }

    if (!callback) {
        return;        
    }

    return fs.stat.apply(this, arguments);
}
