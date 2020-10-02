const { sep } = require('path');

module.exports = function ({ path, entryPath, prefix }) {
    const ignored = ['', 'shared', 'partials', 'components', 'dialogs', 'bottomSheets'];

    entryPath = Array.isArray(entryPath) ? entryPath : [entryPath];
    entryPath = entryPath.filter(entryPath => path.indexOf(entryPath) !== -1)[0];

    if (entryPath) {
        const itemPath = path.replace(entryPath, '');
        const itemPathArray = itemPath.split(sep);

        const namespace = (prefix || '') + itemPathArray.filter(x => ignored.indexOf(x) < 0).join('.');
        const itemCollectionName = itemPathArray[itemPathArray.length - 2];
        const isRootComponent = itemPathArray.length === 2 && itemCollectionName === 'components';

        const camelCaseToDashes = input => input.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        const nsToDirectiveTagName = input => camelCaseToDashes(input).replace(/\./g, '_');

        return { namespace, camelCaseToDashes, nsToDirectiveTagName, isRootComponent, itemCollectionName };
    }
}
