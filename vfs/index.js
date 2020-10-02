const fs = require('fs');
const context = require('./context');

Object.assign(context, { fs });

const getHandlerMatchByPath = require('./getHandlerMatchByPath');

const proxify = require('./proxify');

const files = require('./files');

const watch = require('./fn/watch');
const readdir = require('./fn/readdir');

async function stat(path) {

    const handlerMatch = getHandlerMatchByPath(path, { fs });

    if (handlerMatch) {
        const stats = new fs.Stats();
        stats.mode = 33206;

        files[path] = files[path] || {};
        files[path].stats = stats;

        return stats;
    }
}

function readFileSync(fileName, encoding) {

    const handlerMatch = getHandlerMatchByPath(fileName, { fs });

    if (handlerMatch) {
        const content = handlerMatch.handler.load(fileName, { fs, match: handlerMatch.match });

        if (content.then) {
            throw new Error(`Handler for file '${fileName}' returned a promise for readFileSync`);
        }

        return content;
    }

}

const vfs = proxify(fs, {
    watch,
    readdir,

    readFileSync: function (filePath, encoding) {
        const content = readFileSync(filePath);

        if (content) {
            return content;
        }

        return fs.readFileSync.apply(this, arguments);
    },

    stat: function (path, options = undefined, callback) {
        stat(path)
        .then(stats => {

            if (stats) {
                return callback(stats);
            }

            fs.stat.apply(this, arguments);
        });        
    },

    promises: proxify(fs.promises, {
        stat: async function (fileName) {
            const vfsStatResult = await stat(fileName);

            if (vfsStatResult) {
                return vfsStatResult;
            }

            return await fs.promises.stat.apply(this, arguments);
        },

        readFile: async function (fileName) {
            const content = readFileSync(fileName);

            if (content) {
                return Buffer.from(content);
            }

            return await fs.promises.readFile.apply(this, arguments);
        }
    })
});

module.exports = vfs;
