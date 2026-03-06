const path = require('path');

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: 'production',
  entry: './webview-src/dashboard.tsx',
  output: {
    path: path.resolve(__dirname, 'media'),
    filename: 'dashboard.js',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  externals: {},
  devtool: 'source-map'
};


