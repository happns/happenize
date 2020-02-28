var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

var AutoGenerateIndexPlugin = require('./web_modules/autoGenerateIndex.webpack-plugin.js');

const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

var ConcatSource = require("webpack-sources").ConcatSource;

var i18nPostLoader = function (source) {
	for (var i = 0; i < source.children.length - 1; i++) {
		source.children[i] = new ConcatSource(source.children[i], ",\n");
	}

	return new ConcatSource("{\n", source, "\n}\n");
};

function createConfiguration(moduleName, options = {}) {

	var modulePaths = [`./src/${moduleName}/module.js`, `./src/modules/${moduleName}/module.js`, `./src/${moduleName}/${moduleName}.module.js`]

	var moduleEntry = modulePaths.filter(path => fs.existsSync(path))[0];
	var moduleDir = path.resolve(path.dirname(moduleEntry));

	const context = path.resolve(moduleDir);
	const entryPath = options.entryPath || context;

	var webpackConfig = {
		entry: ['babel-regenerator-runtime', './' + path.basename(moduleEntry)],
		context,
		output: {
			filename: `${moduleName}.js`,
		},
		module: {
			rules: [
				{
					test: /\.less$/,
					use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader', 
					{
						loader: 'less-namespace.webpack-loader',
						options: { entryPath }
					}]
				},
				{
					test: /\.css$/,
					use: [MiniCssExtractPlugin.loader, 'css-loader']
				},
				{
					test: /\.html$/,
					use: [
						'html-loader',
						{
							loader: 'html-namespace.webpack-loader',
							options: { entryPath }
						}
					]
				},
				{
					test: /\.js$/,
					exclude: /(node_modules|bower_components)/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env'],
								plugins: ['angularjs-annotate', '@babel/plugin-transform-regenerator', '@babel/plugin-proposal-object-rest-spread']
							}
						}
					]
				},
				{
					test: /\.md$/,
					use: ['html-loader', 'markdown-loader']
				},
				{
					test: /index\.js$/,
					use: ['index.webpack-loader']
				}
			]
		},
		resolve: {
			modules: [
				'node_modules',
				'./src/assets/libs',
				`${moduleDir}/shared`,
				`${moduleDir}/assets/libs`,
				'web_loaders',
				'web_modules',
				'node_loaders',
				path.join(__dirname, 'web_modules'),
				path.join(__dirname, 'node_modules')
			],
			alias: {
				'shared': path.join(__dirname, '../shared/src')
			}
		},
		resolveLoader: {
			modules: [
				'node_modules',
				path.join(__dirname, 'web_modules'),
				path.join(__dirname, 'node_modules')
			]
		},
		plugins: [
			new AutoGenerateIndexPlugin({ entryPath }),
			new MiniCssExtractPlugin({
				// Options similar to the same options in webpackOptions.output
				// both options are optional
				filename: `${moduleName}.css`,
				chunkFilename: `${moduleName}.[id].css`,
			}),
			new CopyPlugin([
				{ from: '../assets', to: 'assets' },
			])
		],
		optimization: {
			minimize: false
		}
	};

	return webpackConfig;
}

createConfiguration.require = require;

module.exports = createConfiguration;
