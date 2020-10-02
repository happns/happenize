const generateIndexForDirectory = require('../templates/index.js');
const vfsHandlers = require('../vfs/handlers');

module.exports = function (snowpackConfig, pluginOptions) {
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

            return generateIndexForDirectory({ path }, {
                ls: function (files) { 
                    return files.map(fileName => {
                        // HACK snowpack handles .html files on it's own without passing it to loader plugin
                        // it serves those files from public and this makes it not possible to loaded them from the src/
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
