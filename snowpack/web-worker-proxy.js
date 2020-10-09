const fs = require('fs');
const path = require('path');

const template = require('../templates/worker.proxy');
const vfsHandlers = require('../vfs/handlers');

const toWorkerFileName = fileName => fileName
.replace(/\.worker\.worker-proxy/, '.worker')
.replace(`${path.sep}public${path.sep}_dist_${path.sep}`, `${path.sep}src${path.sep}`);

const toWorkerImportFromName = fileName => '/_dist_/' + fileName
.replace(/\.worker\.worker-proxy/, '.worker')
.split(path.sep).join('/')
.split(`/_dist_/`)[1];

module.exports = function (snowpackConfig, pluginOptions) {
    vfsHandlers.push({
        test: (fileName, { fs }) => {

            const match = fileName.match(/(.+)\.worker\.worker-proxy(\.[tj]s)?$/);
            if (match) {
                const workerFileName = toWorkerFileName(fileName);

                if (fs.existsSync(workerFileName)) {
                    return match;
                }
            }
        },

        load: (fileName, { fs, match }) => {
            const workerFileName = toWorkerImportFromName(fileName);

            return template({ workerFileName });
        }
    });

    return {
        name: 'web-worker-proxy-plugin',
        resolve: {
            input: ['.worker-proxy'],
            output: ['.js'],
        },
        async load({ filePath }) {
                const content = fs.readFileSync(filePath, 'utf-8');

                return content;
        }
    }
}
