const path = require('path');
const fs = require('fs');
const packageFile = fs.readFileSync('package.json');
const version = JSON.parse(packageFile).version;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const globImporter = require('node-sass-glob-importer');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const extractSass = new ExtractTextPlugin({
    filename: '[name].css',
    allChunks: true
});

const config = {
    mode: 'development',
    entry: {
        bundle: ['@babel/polyfill', './src/main.js'],
        styles: ['./styles/global.scss']
    },
    output: {
        filename: '[name].js',
        path: path.resolve('./public/dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/env']
                    }
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {

                    }
                }
            },
            {
                test: /\.scss$/,
                use: extractSass.extract([
                    {
                        loader: 'raw-loader'
                    },
                    {
                        loader: 'postcss-loader'
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            importer: globImporter(),
                            data: ''
                        }
                    }
                ])
            }
        ]
    },
    resolve: {
        extensions: ['.vue', '.js', '.html'],
        modules: ['node_modules'],
        alias: {
            vue: 'vue/dist/vue.js',
            '@src': path.resolve('./src'),
            '@pages': path.resolve('./src/pages'),
            '@components': path.resolve('./src/components')
        }
    },
    plugins: [
        extractSass,
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: '../index.html',
            alwaysWriteToDisk: true,
            inject: false
        }),
        new HtmlWebpackHarddiskPlugin(),
        new VueLoaderPlugin()
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        },
        minimizer: []
    },
    devtool: 'source-map',
    devServer: {
        compress: true,
        https: false,
        port: 8200,
        historyApiFallback: true,
        contentBase: './public/',
        publicPath: '/dist/',
        watchOptions: {
            ignored: /node_modules/
        },
        inline: true,
        quiet: false,
        public: 'game-fe-web.maxorlovsky.net',
        proxy: {
            '/api': {
                target: 'http://localhost:8225/public',
                secure: false,
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            },
            '/socket.io': {
                target: 'http://localhost:8225',
                secure: false,
                ws: true
            }
        }
    },
    performance: {
        hints: false
    }
};

module.exports = (env = {}) => {
    if (env.production) {
        config.mode = 'production';
        config.devtool = false;

        config.resolve.alias.vue = 'vue/dist/vue.min';

        config.optimization.minimizer.push(new UglifyJSPlugin({
            cache: true,
            parallel: true,
            sourceMap: false
        }));
    }

    if (env.dashboard) {
        const Dashboard = require('webpack-dashboard');
        const DashboardPlugin = require('webpack-dashboard/plugin');
        const dashboard = new Dashboard({ port: 9000 });

        config.plugins.push(new DashboardPlugin(dashboard.setData));
    }

    const copyFiles = [
        {
            from: './assets/',
            to: 'assets/'
        },
        {
            from: './node_modules/font-awesome/fonts/',
            to: 'assets/fonts'
        },
        {
            from: './node_modules/socket.io-client/dist/socket.io.js',
            to: 'socket.io.js'
        }
    ];

    config.plugins.push(new CopyWebpackPlugin(copyFiles));

    const replaceInFileRules = [
        {
            search: /%version%/g,
            replace: version
        }
    ];

    if (env.production) {
        replaceInFileRules.push({
            search: /(<!-- dev -->)([\s\S]*?)(<!-- !dev -->)/g,
            replace: ''
        });
    }

    config.plugins.push(new ReplaceInFileWebpackPlugin([
        {
            dir: path.resolve('./public/'),
            files: ['index.html'],
            rules: replaceInFileRules
        }
    ]));

    return config;
};