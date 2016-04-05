module.exports = {
    entry: {
        example: './examples/index.js',
    },
    resolve: {
        extensions: ["", ".js"]
    },
    output: {
        filename: 'examples/example.build.js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loaders: ['imports?define=>false']
        }]
    },
    devtool: '#source-map'
}