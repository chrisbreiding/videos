var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: './dist',
    filename: 'app.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.styl$/, loader: 'style-loader!css-loader!stylus-loader' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};
