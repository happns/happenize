const path = require('path');
const files = require('../../files');
const aliases = require('../../aliases');

module.exports = ({ fs }) => function (dir, options = undefined, callback) {
    const vfsFilesInDir = Object.keys(files).concat(Object.keys(aliases))
    .filter(fileName => fileName.indexOf(dir) !== -1)
    .map(fileName => fileName.replace(dir + path.sep, ''))
    .filter(fileName => fileName === path.basename(fileName));
    
    fs.promises.readdir(dir, options)
    .then(files => {
        if (options && options.withFileTypes) {

            return files.concat(vfsFilesInDir.map(fileName => ({
                name: fileName,
                isFile() { return true; },
                isDirectory() { return false; },
                isBlockDevice() { return false; },
                isCharacterDevice() { return false; },
                isSymbolicLink() { return false; },
                isFIFO() { return false; },
                isSocket() { return false; },
            })));
        }

        return files.concat(vfsFilesInDir);
    })
    .then(files => {
        callback(null, files)
    }, err => callback(err));
}
