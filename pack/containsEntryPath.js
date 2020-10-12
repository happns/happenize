const { resolve } = require('path');

module.exports = function (path, entryPath) {
    entryPath = Array.isArray(entryPath) ? entryPath : [entryPath];

    entryPath = entryPath
    .map(entryPath => resolve(entryPath))
    .filter(entryPath => path.indexOf(entryPath) !== -1)[0];

    return entryPath;
}
