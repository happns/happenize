const fs = require('fs');
const path = require('path');

const template = require('../templates/worker.proxy');
const vfsHandlers = require('../vfs/handlers');
const vfsFiles = require('../vfs/files');
const $path = require('path');

const {
    before
} = require('../vfs/hooks');
const containsEntryPath = require('../pack/containsEntryPath');

const toWorkerFileName = fileName => fileName
    .replace(/\.worker\.worker-proxy/, '.worker')
    .replace(`${path.sep}public${path.sep}_dist_${path.sep}`, `${path.sep}src${path.sep}`);

const toWorkerImportFromName = fileName => '/_dist_/' + fileName
    .replace(/\.worker\.worker-proxy/, '.worker')
    .split(path.sep).join('/')
    .split(`/_dist_/`)[1];

module.exports = function (snowpackConfig, pluginOptions) {
    const handledDirectories = new Set();

    before('readdir', ({
        fs
    }, dir) => {
        if (handledDirectories.has(dir)) {
            return;
        }

        handledDirectories.add(dir);

        const files = fs.readdirSync(dir);

        const entryPath = containsEntryPath(dir, snowpackConfig.entryPaths);

        if (entryPath) {
            for (const file of files) {

                const match = file.match(/(.+)\.worker(\.[tj]s)?$/);

                if (match) {
                    const [, name, ext] = match
                    const fileName = $path.join(dir, `${name}.worker.worker-proxy${ext}`);

                    let stats = new fs.Stats();
                    stats.mode = 33206;

                    vfsFiles[fileName] = {
                        stats
                    };
                }
            }
        }
    });

    vfsHandlers.push({
        test: (fileName, {
            fs
        }) => {

            const match = fileName.match(/(.+)\.worker\.worker-proxy(\.[tj]s)?$/);
            if (match) {
                const workerFileName = toWorkerFileName(fileName);

                if (fs.existsSync(workerFileName)) {
                    return match;
                }
            }
        },

        load: (fileName, {
            fs,
            match
        }) => {
            const workerFileName = toWorkerImportFromName(fileName);

            return template({
                workerFileName
            });
        }
    });

    return {
        name: 'web-worker-proxy-plugin',
        resolve: {
            input: ['.worker-proxy'],
            output: ['.js'],
        },
        async load({
            filePath
        }) {
            const content = fs.readFileSync(filePath, 'utf-8');

            return content;
        }
    }
}