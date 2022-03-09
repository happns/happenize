const path = require('path');
const files = require('../../files');
const aliases = require('../../aliases');
const { trigger } = require('../../hooks');

module.exports = ({ fs }) => function (...args) {
    const [dir, options = {}] = args;

    trigger('before', 'readdir', { fs }, dir, options);

    const vfsFilesInDir = Object.keys(files).concat(Object.keys(aliases))
        .filter(fileName => fileName.indexOf(dir) !== -1)
        .map(fileName => fileName.replace(dir + path.sep, ''))
        .filter(fileName => fileName === path.basename(fileName));

    const _files = fs.readdirSync(dir, options);
    if (options && options.withFileTypes) {

        return _files.concat(vfsFilesInDir.map(fileName => ({
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

    return _files.concat(vfsFilesInDir);
}
