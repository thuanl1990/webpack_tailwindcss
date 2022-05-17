const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { ESBuildMinifyPlugin } = require('esbuild-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin");
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;

const production = process.env.NODE_ENV === 'production';
const PAGES_DIR = path.join(__dirname, './src/');
const PAGES = fs.readdirSync(PAGES_DIR).filter((fileName) => fileName.endsWith('.html'));

const config = {
  entry: {
    app: './src/assets/js/app'
  },
  output: {
    path: path.resolve('dist'),
    filename: 'assets/js/[name].js',
    chunkFilename: 'assets/js/[name].[chunkhash:3].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'esbuild-loader'
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { url: false } },
          "postcss-loader"
        ],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),
    },
    watchFiles: ['src/*'],
    compress: true,
    port: 8080,
  },
  watchOptions: {
    aggregateTimeout: 200
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].css'
    }),
    ...PAGES.map(
      (page) =>
          new HtmlWebpackPlugin({
              template: `${PAGES_DIR}/${page}`,
              filename: `./${page}`,
          })
    ),
    new CopyPlugin({
      patterns: [
        { from: "src/assets/static", to: "assets/static" },
        { from: "src/assets/images", to: "assets/images" },
      ],
    }),
  ],
  mode: production ? 'production' : 'development',
  stats: production ? 'normal' : 'minimal'
};

if (production) {
  config.optimization = {
    minimize: true,
    minimizer: [
      new ESBuildMinifyPlugin({
        css: true
      })
    ]
  }

  config.plugins.push(new HTMLInlineCSSWebpackPlugin());
}

module.exports = config;
