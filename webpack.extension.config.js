const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load environment variables
const env = dotenv.config().parsed;

// Reduce env variables to a format webpack can use
const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
}, {});

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: {
        popup: './src/extension/popup/index.tsx',
        contentScript: './src/extension/contentScript.ts',
        AutosavePromptOverlay: './src/extension/AutosavePromptOverlay.ts',
        background: './src/extension/background.ts',
    },
    output: {
        path: path.resolve(__dirname, 'dist-extension'),
        filename: '[name].js',
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: 'tsconfig.extension.json',
                            transpileOnly: true
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
        new webpack.DefinePlugin(envKeys)
    ],
};
