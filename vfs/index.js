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
const watchFile = require('./fn/watchFile');
const unwatchFile = require('./fn/unwatchFile');
const readdir = require('./fn/readdir');
const readdirSync = require('./fn/readdirSync');

function readFileSync(fileName, encoding) {
    const handlerMatch = getHandlerMatchByPath(fileName, { fs });

    if (handlerMatch) {
        const content = handlerMatch.handler.load(fileName, { fs, match: handlerMatch.match });

        if (content.then) {
            throw new Error(`Handler for file '${fileName}' returned a promise for readFileSync`);
        }

        if (encoding === 'utf8') {
            return content;
        } else if (!encoding) {
            return Buffer.from(content);
        } else {
            throw new Error('Unsupported encoding ' + encoding);
        }
    }
}

const vfs = proxify(fs, {
    $vfs: true,

    connectHardLinksToFs: () => {
        const backupFs = { ...fs }

        fs.readdir = readdir;
        fs.readdirSync = readdirSync;
        fs.stat = stat;
        fs.lstat = lstat;

        return () => {
            fs.readdir = backupFs.readdir;
            fs.readdirSync = backupFs.readdirSync;
            fs.stat = backupFs.stat;
            fs.lstat = backupFs.lstat;
        }
    },

    stat,
    lstat,
    watch,
    watchFile,
    unwatchFile,
    readdir,

    readdirSync,

    readFileSync: function (filePath, encoding) {
        const content = readFileSync(filePath, encoding);

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

        readFile: async function (fileName, encoding) {
            const content = readFileSync(fileName, encoding);

            if (content) {
                return content;
            }

            return await fs.promises.readFile.apply(this, arguments).catch(err => {
                throw new Error(err);
            });
        }
    })
});

module.exports = vfs;
