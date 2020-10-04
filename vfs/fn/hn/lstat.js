const files = require('../../files');
const aliases = require('../../aliases');

const getHandlerMatchByPath = require('../../getHandlerMatchByPath');

const DEVICE_ID = 0;

module.exports = ({ fs }) => function (path, callback) {
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

    if (!callback) {
        return;
    }

    return fs.lstat.apply(this, arguments);
}
