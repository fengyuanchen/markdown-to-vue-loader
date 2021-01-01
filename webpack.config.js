const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/dist/plugin').default;
const path = require('path');

module.exports = (env = {}) => ({
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './docs'),
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
          'style-loader',
          'css-loader',
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
            loader: path.resolve(__dirname, './index.js'),
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
      vue$: 'vue/dist/vue.esm-bundler',
    },
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      filename: env.production ? '../docs/index.html' : 'index.html',
      template: './src/index.html',
    }),
  ],
  devServer: {
    hot: true,
    open: true,
    overlay: true,
  },
});
