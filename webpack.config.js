/* eslint-env node */
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const GenerateJsonPlugin = require("generate-json-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");

const packageData = require("./package.json");
const manifest = require("./extension/manifest.json");

const cacheLoader = {
  loader: "cache-loader",
  options: { cacheDirectory: ".webpack-cache" },
};

module.exports = (env, argv) => ({
  mode: argv.mode || "development",
  devtool: argv.mode == "production" ? "source-map" : "eval-source-map",
  entry: {
    content: "./extension/content/index.js",
    "content-scripts": "./extension/content/scripts/inject.js",
    redirect: "./extension/content/redirect.js",
    "dark-theme": "./extension/content/less/dark.less",
    "light-theme": "./extension/content/less/light.less",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    alias: {
      devtools: path.resolve(__dirname, "extension/content"),
    },
  },
  plugins: [
    new FixStyleOnlyEntriesPlugin(),
    new MiniCssExtractPlugin(),
    new Dotenv(),
    new CopyWebpackPlugin([
      "extension/background.js",
      { from: "extension/experiments/", to: "experiments/" },
      { from: "extension/images/", to: "images/" },
    ]),
    new HtmlWebpackPlugin({
      title: "Normandy Devtools",
      favicon: path.resolve(__dirname, "extension/images/favicon.png"),
      filename: "content.html",
      chunks: ["content"],
    }),
    new HtmlWebpackPlugin({
      title: "Redirect",
      filename: "redirect.html",
      chunks: ["redirect"],
    }),
    new GenerateJsonPlugin("manifest.json", manifest, (key, value) => {
      if (typeof value === "string" && value.startsWith("$")) {
        const parts = value.slice(1).split(".");
        let object = packageData;
        while (parts.length) {
          object = object[parts.pop()];
        }

        return object;
      }

      return value;
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, "./extension")],
        use: [cacheLoader, "babel-loader"],
      },
      {
        test: /\.less/,
        use: [
          cacheLoader,
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "less-loader",
            options: {
              javascriptEnabled: true,
            },
          },
        ],
      },
      {
        test: /\.css/,
        use: [cacheLoader, "style-loader", "css-loader"],
      },
      {
        test: /\.(png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: [cacheLoader, "file-loader"],
      },
    ],
  },
});
