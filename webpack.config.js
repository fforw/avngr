var path = require("path");
var webpack = require("webpack");

module.exports = {
    entry: './src/main.js',
    output: { path: __dirname, filename: 'web/bundle.js' },
    module: {
        loaders: [
            {
                test: /.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /.svg$/,
                loader: path.join(__dirname,  './tooling/level-loader')
            }
        ]
    }
};
