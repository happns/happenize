const $path = require('path');

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
    vfsHandlers.push({
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
    });

    return {
        name: 'auto-generated-index-snowpack-plugin'
    };
};
