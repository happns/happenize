const AutoGeneratedIndexPlugin = require('./vite/rollup-plugin-auto-generated-index');
const AutoGeneratedIndexSavePlugin = require('./vite/rollup-plugin-auto-generated-index-save');
const ImportHTML = require('./vite/rollup-plugin-import-html');
const LessNamespace = require('./vite/rollup-plugin-less-namespace');

const { defineConfig } = require('vite');

module.exports = ({ moduleTemplates, entryPaths }, configModifier = config => config) => defineConfig(configModifier({
    plugins: [ AutoGeneratedIndexPlugin({ moduleTemplates }), AutoGeneratedIndexSavePlugin(), ImportHTML({ entryPaths }), LessNamespace({ entryPaths }) ],
    server: {
        watch: {
            ignored: ["**/generated/**"],
        }
    }
}))
