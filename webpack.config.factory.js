var fs = require('fs');
var path = require('path');

var AutoGenerateIndexPlugin = require('./web_modules/autoGenerateIndex.webpack-plugin.js');

const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const ConcatSource = require('webpack-sources').ConcatSource;

const i18nPostLoader = function (source) {
	for (var i = 0; i < source.children.length - 1; i++) {
		source.children[i] = new ConcatSource(source.children[i], ',\n');
	}

	return new ConcatSource('{\n', source, '\n}\n');
};

function createConfiguration(moduleName, options = {}) {

	var modulePaths = [`./src/module.js`, `./src/${moduleName}/module.js`, `./src/modules/${moduleName}/src/module.js`, `./src/modules/${moduleName}/module.js`, `./src/${moduleName}/${moduleName}.module.js`]

	if (options.modulePath) {
		modulePaths = [options.modulePath];
	}

	var moduleEntry = modulePaths.filter(path => fs.existsSync(path))[0];
	var moduleDir = path.resolve(path.dirname(moduleEntry));

	const context = path.resolve(moduleDir);
	const entryPath = options.entryPath || context;

	var webpackConfig = {
		mode: 'production',
		devtool: 'cheap-module-source-map',
		entry: ['./' + path.basename(moduleEntry)],
		context,
		output: {
			globalObject: 'globalThis',
			devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
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
					test: /(\.js|\.ts)$/,
					exclude: /(node_modules|bower_components)/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: [
									['@babel/preset-env', {
										'targets': {
											'chrome': '58'
										}
									}], '@babel/preset-typescript'],
								plugins: ['angularjs-annotate', '@babel/plugin-proposal-object-rest-spread', '@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-optional-chaining']
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
				`${moduleDir}/assets`,
				`${moduleDir}/assets/libs`,
				'web_loaders',
				'web_modules',
				'node_loaders',
				path.join(__dirname, 'web_modules'),
				path.join(__dirname, 'node_modules')
			],
			alias: {
				'shared': path.join(__dirname, '../shared/src')
			},
			extensions: ['.js', '.jsx', '.ts', '.tsx']
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
			new ErrorOverlayPlugin(),
			new FriendlyErrorsWebpackPlugin()
		],
		optimization: {
			minimize: false
		}
	};

	const assetsPath = `${moduleDir}/../assets`;
	if (fs.existsSync(assetsPath)) {
		webpackConfig.plugins.push(
			new CopyPlugin([
				{ from: assetsPath, to: 'assets' },
			]));
	}

	if (process.env.NODE_ENV === 'production') {
		const TerserPlugin = require('terser-webpack-plugin');

		webpackConfig.optimization = {
			minimize: true,
			minimizer: [new TerserPlugin({
				terserOptions: {
					mangle: false
				}
			})]
		};
	}

	return webpackConfig;
}

createConfiguration.require = require;
createConfiguration.i18nPostLoader = i18nPostLoader;

module.exports = createConfiguration;
