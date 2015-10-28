const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const APP_PATH = path.resolve(__dirname, 'src');

module.exports = {
  entry: `${APP_PATH}/main.jsx`,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      { test: /\.js$|\.jsx$/, loaders: ['babel'], include: APP_PATH },
      { test: /\.styl$/, loaders: ['style', 'css', 'stylus'], include: APP_PATH },
      { test: /\.svg$|\.ttf$|\.eot$|\.woff$|\.woff2$/, loaders: ['file'], include: APP_PATH }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};
