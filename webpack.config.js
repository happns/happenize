var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var autoGenerateIndex = require('./web_modules/autoGenerateIndex.webpack-plugin.js');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var ConcatSource = require("webpack-sources").ConcatSource;

var i18nPostLoader = function (source) {
	for (var i = 0; i < source.children.length - 1; i++) {
		source.children[i] = new ConcatSource(source.children[i], ",\n");
	}

	return new ConcatSource("{\n", source, "\n}\n");
};

// definePlugin takes raw strings and inserts them, so you can put strings of JS if you want.
var definePlugin = new webpack.DefinePlugin({
	NODE_ENV: JSON.stringify(JSON.parse(`"${process.env.NODE_ENV}"` || '"development"'))
});

function createConfiguration (moduleName) {
	var modulePaths = [ `./src/${moduleName}/module.js`, `./src/modules/${moduleName}/module.js`, `./src/${moduleName}/${moduleName}.module.js` ]
	var extractCSS = new ExtractTextPlugin(`./src/${moduleName}.css`);

	var moduleEntry = modulePaths.filter(path => fs.existsSync(path))[0];
	var moduleDir = path.dirname(moduleEntry);

	var extractI18N_PL = new ExtractTextPlugin(`${moduleDir}/assets/i18n/pl.i18n.json`);
	var extractI18N_EN = new ExtractTextPlugin(`${moduleDir}/assets/i18n/en.i18n.json`);

	extractI18N_PL.postLoader = i18nPostLoader;
	extractI18N_EN.postLoader = i18nPostLoader;

	return {
		entry: ['babel-regenerator-runtime', moduleEntry],
		output: {
			filename: `./src/${moduleName}.js`,
		},
		module: {
			dir: moduleDir,
			loaders: [
				{ test: /\.less$/, loader: extractCSS.extract('css?sourceMap!less?sourceMap!less-namespace') },
				{ test: /\.css$/, loader: extractCSS.extract('css?sourceMap!less?sourceMap!less-namespace') },
				{ test: /\.html$/, loader: 'html-loader!html-namespace' },
				{
					test: /\.js$/, loader: 'babel', // 'babel-loader' is also a legal name to reference
					query: {
						presets: [require.resolve('babel-preset-es2015')],
						plugins: [require.resolve('babel-plugin-syntax-async-functions'), require.resolve('babel-plugin-transform-regenerator')]
					}
				},
				{ test: /\.md$/, loader: "html!markdown" },
				{ test: /pl\.i18n\.json$/, loader: extractI18N_PL.extract('html-loader!i18n') },
				{ test: /en\.i18n\.json$/, loader: extractI18N_EN.extract('html-loader!i18n') },
				{ test: /index\.js$/, loader: 'index' }
			]
		},
		resolve: {
			modulesDirectories: ['node_modules', './src/assets/libs', `${moduleDir}/shared`, `${moduleDir}/assets/libs`],
			alias: {
				'shared': path.join(__dirname, '../shared/src')
			}
		},
		resolveLoader: {
			modulesDirectories: ['web_loaders', 'web_modules', 'node_loaders', 'node_modules', 'node_modules/happenize/web_modules'],
			root: path.join(__dirname, 'node_modules')
		},
		plugins: [
			autoGenerateIndex,
			extractCSS,
			extractI18N_PL,
			extractI18N_EN,
			definePlugin
		],

		createConfiguration: createConfiguration
	};
}

if (fs.existsSync('./src/app')) {
	module.exports = createConfiguration('app');
} else {
	module.exports = {
		createConfiguration: createConfiguration
	}
}
