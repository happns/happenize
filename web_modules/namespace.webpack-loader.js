var fs = require('fs');
var path = require('path');

module.exports = function(content, handler) {
    this.cacheable();

    var ignored = ['', 'shared', 'partials', 'components', 'dialogs', 'bottomSheets'];

    var entryPath = path.join(this.options.context, this.options.module.dir);

    if (this.context.indexOf(entryPath) !== -1) {
        var itemPath = this.context.replace(entryPath, '');
        var itemPathArray = itemPath.split(path.sep);
 
        var namespace = itemPathArray.filter(x => ignored.indexOf(x) < 0).join('.');
        var itemCollectionName = itemPathArray[itemPathArray.length - 2];
        var isRootComponent = itemPathArray.length === 2 && itemCollectionName === 'components';

        var camelCaseToDashes = input => input.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        var nsToDirectiveTagName = input => camelCaseToDashes(input).replace(/\./g, '_');

        return handler({ namespace, camelCaseToDashes, nsToDirectiveTagName, isRootComponent, itemCollectionName })
    }

    return content;
};
