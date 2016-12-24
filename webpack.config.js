var path = require("path");
var webpack = require("webpack");

module.exports = {

    entry: {
        main: "./src/main.js",
        test: "./src/test.js"
    },
    output: {
        path: path.join(__dirname, "web/code/"),
        filename: "[name].js"
    },
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
