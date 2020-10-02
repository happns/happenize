const path = require('path');
const files = require('../files');
const aliases = require('../aliases');

const { fs } = require('../context');

module.exports = function (dir, options = undefined, callback) {
    console.log('reading dir ' + dir)
    const vfsFilesInDir = Object.keys(files).concat(Object.keys(aliases))
    .filter(fileName => fileName.indexOf(dir) !== -1)
    .map(fileName => fileName.replace(dir + path.sep, ''))
    .filter(fileName => fileName === path.basename(fileName));
    
    fs.promises.readdir(dir, options)
    .then(files => files.concat(vfsFilesInDir))
    .then(files => { console.log(`Return files ${files} for ${dir}`); return files })
    .then(files => callback(null, files), err => callback(err));
}
