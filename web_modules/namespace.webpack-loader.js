var path = require('path');
var getOptions = require('loader-utils').getOptions;

module.exports = function(content, handler) {
    this.cacheable();

    const options = getOptions(this) || {};
    var ignored = ['', 'shared', 'partials', 'components', 'dialogs', 'bottomSheets'];

    var entryPath = options.entryPath || this.rootContext;
    entryPath = Array.isArray(entryPath) ? entryPath : [ entryPath ];    
    entryPath = entryPath.filter(entryPath => this.context.indexOf(entryPath) !== -1)[0];

    if (entryPath) {
        var itemPath = this.context.replace(entryPath, '');
        var itemPathArray = itemPath.split(path.sep);
 
        var namespace = itemPathArray.filter(x => ignored.indexOf(x) < 0).join('.');
        var itemCollectionName = itemPathArray[itemPathArray.length - 2];
        var isRootComponent = itemPathArray.length === 2 && itemCollectionName === 'components';

        var camelCaseToDashes = input => input.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        var nsToDirectiveTagName = input => camelCaseToDashes(input).replace(/\./g, '_');

        var result = handler({ namespace, camelCaseToDashes, nsToDirectiveTagName, isRootComponent, itemCollectionName })

        return result;
    }

    return content;
};
