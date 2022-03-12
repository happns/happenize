const vfsFiles = require('../vfs/files');
const $path = require('path');

const { before } = require('../vfs/hooks');
const containsEntryPath = require('../pack/containsEntryPath');

const templates = {
    default: require('../templates/index.snowpack.js'),
    asyncGet: require('../templates/index.asyncGet')
};

const vfsHandlers = require('../vfs/handlers');

const generateIndexForDirectory = function ({ snowpackConfig, path }) {
    if (snowpackConfig.moduleTemplates) {
        for (let key in snowpackConfig.moduleTemplates) {
            if (path.slice(0, -1) === $path.resolve(key)) {
                return templates[snowpackConfig.moduleTemplates[key]].apply(templates, arguments);
            }
        }
    }

    return templates.default.apply(templates, arguments);
}

module.exports = function (snowpackConfig) {
    const handledDirectories = new Set();

    before('readdir', ({ fs }, dir) => {
        if (handledDirectories.has(dir)) {
            return;
        }

        handledDirectories.add(dir);

        let files;
        try {
            files = fs.readdirSync(dir);
        } catch(err) {
            return;
        }

        const entryPath = containsEntryPath(dir, snowpackConfig.entryPaths);

        if (entryPath) {
            if (files.some(file => file.match(/index\.[tj]s$/))) {
                return;
            }

            const fileName = $path.join(dir, 'index.ts');

            let stats = new fs.Stats();
            stats.mode = 33206;

            vfsFiles[fileName] = { stats };
        }
    });

    const vfsHandler = {
        test: (fileName, { fs }) => {
            const match = fileName.match(/(.+)index\.ts$/);

            if (match) {
                const [, dir] = match;

                if (fs.existsSync(dir) && !fs.existsSync(fileName)) {
                    return match;
                }
            }
        },

        load: (fileName, { match }) => {
            const path = match[1];

            return generateIndexForDirectory({ snowpackConfig, path }, {
                ls: function (files) {
                    return files.map(fileName => {
                        // HACK snowpack handles .html files on it's own without passing it to loader plugin
                        // it serves those files from public and this makes it not possible to loaded them from the src/
                        // it is required to make the HMR working
                        if (fileName.slice(-5) === '.html') {
                            return fileName + '.vnode';
                        }

                        return fileName;
                    })
                }
            });
        }
    };

    vfsHandlers.push(vfsHandler);

    return {
        name: 'auto-generated-index-snowpack-plugin'
    };
};
