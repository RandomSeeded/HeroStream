module.exports = {
  entry: "./src/app.js",
  output: {
    filename: "./dist/bundle.js"
  },
  watch: true,
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: ['react', 'es2015', 'stage-2']
      }
    }],
  },
}
