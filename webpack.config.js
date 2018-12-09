const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');

module.exports = (env = {}) => ({
  entry: './docs/src/index.js',
  output: {
    path: path.resolve(__dirname, './docs/dist'),
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.md$/,
        use: [
          'vue-loader',
          {
            loader: path.resolve(__dirname, './dist/markdown-to-vue-loader.js'),
            options: {
              exportSource: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm',
    },
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      filename: env.production ? '../index.html' : 'index.html',
      template: './docs/src/index.html',
    }),
  ],
});
