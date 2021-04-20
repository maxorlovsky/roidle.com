const path = require('path');
const fs = require('fs');
const packageFile = fs.readFileSync('package.json');
const version = JSON.parse(packageFile).version;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const globImporter = require('node-sass-glob-importer');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const config = {
    mode: 'development',
    entry: {
        bundle: [
            'core-js',
            'regenerator-runtime/runtime',
            './src/main.js'
        ],
        styles: ['./styles/global.scss']
    },
    output: {
        filename: '[name].js',
        path: path.resolve('./public/dist'),
        publicPath: '/dist/'
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
                loader: 'vue-loader'
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                path: './postcss.config.js'
                            }
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                importer: globImporter()
                            }
                        }
                    }
                ]
            },
            {
                test: /\.css$/i,
                loader: 'css-loader'
            },
            {
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/i,
                loader: 'file-loader'
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                loader: 'file-loader'
            },
        ]
    },
    resolve: {
        extensions: ['.vue', '.ts', '.js', '.html'],
        modules: ['node_modules'],
        alias: {
            vue: 'vue/dist/vue.js',
            '@src': path.resolve('./src'),
            '@pages': path.resolve('./src/pages'),
            '@components': path.resolve('./src/components'),
            '@config': path.resolve('./src/config'),
            '@utils': path.resolve('./src/utils'),
            '@mixins': path.resolve('./src/mixins'),
        }
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: '../index.html',
            alwaysWriteToDisk: true,
            inject: false,
            minify: {
                collapseWhitespace: true,
                removeComments: false,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            }
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
                },
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true
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
            '/merchant-shops': {
                target: 'http://localhost:8225/merchant-shops',
                secure: false,
                changeOrigin: true,
                pathRewrite: {
                    '^/merchant-shops': ''
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

        config.plugins.push(new MinifyPlugin());
    }

    config.plugins.push(new CopyWebpackPlugin({
        patterns: [
            {
                from: './assets/',
                to: 'assets/'
            },
            {
                from: './src/firebase-messaging-sw.js',
                to: 'firebase-messaging-sw.js'
            }
        ]
    }));

    const replaceInFileRules = [
        {
            search: /%version%/g,
            replace: version
        }
    ];

    if (env.production) {
        replaceInFileRules.push(
            {
                search: /(<!-- dev -->)([\s\S]*?)(<!-- !dev -->)/g,
                replace: ''
            },
            {
                search: /%serverUrl%/g,
                replace: 'https://roidle.com'
            }
        );
    } else {
        replaceInFileRules.push({
            search: /%serverUrl%/g,
            replace: ''
        });
    }

    if (env.local) {
        config.devServer.https = true;
        config.devServer.public = '';
        config.devServer.port = 8080;
        config.devServer.proxy = {
            '/api': {
                target: 'https://api.game.maxorlovsky.com/public',
                secure: false,
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            },
            '/socket.io': {
                target: 'https://api.game.maxorlovsky.com',
                secure: false,
                ws: true
            }
        };
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