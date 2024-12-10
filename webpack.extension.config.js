const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: {
        popup: './src/extension/popup/index.tsx',
        contentScript: './src/extension/contentScript.ts',
        background: './src/extension/background.ts',
    },
    output: {
        path: path.resolve(__dirname, 'dist-extension'),
        filename: '[name].js',
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
        fallback: {
            "process": false
        }
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            compilerOptions: {
                                noEmit: false,
                            },
                        },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { 
                    from: 'extension',
                    to: '.',
                    globOptions: {
                        ignore: ['**/*.ts', '**/*.tsx'],
                    },
                },
            ],
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({
                NODE_ENV: process.env.NODE_ENV || 'development',
                API_URL: 'http://localhost:5000'
            })
        })
    ],
    optimization: {
        minimize: false,
    },
};
