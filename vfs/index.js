const fs = require('fs');
const context = require('./context');

Object.assign(context, { fs });

const getHandlerMatchByPath = require('./getHandlerMatchByPath');

const proxify = require('./proxify');
const  { promisify } = require('util');

const files = require('./files');

const stat = require('./fn/stat');
const lstat = require('./fn/lstat');
const watch = require('./fn/watch');
const readdir = require('./fn/readdir');

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
    $vfs: true,

    connectHardLinksToFs: () => {
        const backupFs = { ...fs }

        fs.readdir = readdir;
        fs.stat = stat;
        fs.lstat = lstat;

        return () => {
            fs.readdir = backupFs.readdir;
            fs.stat = backupFs.stat;
            fs.lstat = backupFs.lstat;
        }
    },

    stat,
    lstat,
    watch,
    readdir,

    readFileSync: function (filePath, encoding) {
        const content = readFileSync(filePath);

        if (content) {
            return content;
        }

        return fs.readFileSync.apply(this, arguments);
    },

    promises: proxify(fs.promises, {
        stat: async function (fileName) {
            const vfsStatResult = await promisify(stat)(fileName);

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
