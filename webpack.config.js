/* eslint-env node */
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const GenerateJsonPlugin = require("generate-json-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");

const cacheLoader = {
  loader: "cache-loader",
  options: { cacheDirectory: ".webpack-cache" },
};

module.exports = (env, argv = {}) => {
  const development = argv.mode === "development";

  const entry = {
    content: "./extension/content/index.js",
    "content-scripts": "./extension/content/scripts/inject.js",
    redirect: "./extension/content/redirect.js",
    "dark-theme": "./extension/content/less/dark.less",
    "light-theme": "./extension/content/less/light.less",
    background: "./extension/background.js",
  };

  const plugins = [
    new FixStyleOnlyEntriesPlugin(),
    new MiniCssExtractPlugin(),
    new Dotenv(),
    new CopyWebpackPlugin([
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
    new webpack.DefinePlugin({
      DEVELOPMENT: JSON.stringify(development),
    }),
    new ManifestFilePlugin(),
  ];

  if (development) {
    entry.restore = "./extension/content/restore.ts";

    plugins.push(
      new HtmlWebpackPlugin({
        title: "Restore",
        filename: "restore.html",
        chunks: ["restore"],
      }),
    );
  }

  return {
    mode: argv.mode || "development",
    devtool: development ? "eval-source-map" : "source-map",
    entry,
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"),
    },
    resolve: {
      alias: {
        devtools: path.resolve(__dirname, "extension/content"),
      },
      extensions: [".js", ".ts", ".tsx"],
    },
    plugins,
    module: {
      rules: [
        {
          // .js, .jsx, .ts, and .tsx
          test: /\.[jt]sx?$/,
          include: [path.resolve(__dirname, "./extension/content")],
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
                lessOptions: {
                  javascriptEnabled: true,
                },
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
  };
};

class ManifestFilePlugin {
  constructor() {
    this.packageDataPath = require.resolve("./package.json");
    this.manifestPath = require.resolve("./extension/manifest.json");

    this.generateJsonPlugin = new GenerateJsonPlugin(
      "manifest.json",
      require(this.manifestPath),
      this.jsonTransformer,
      2,
    );

    this.pluginDescription = { name: "ManifestFilePlugin" };
  }

  jsonTransformer(key, value) {
    // We want to reload the package data every time, because it will be cleared
    // from the require cache and so requiring it again will get a fresh copy.
    const packageData = require(this.packageDataPath);

    if (typeof value === "string" && value.startsWith("$")) {
      const parts = value.slice(1).split(".");
      let object = packageData;
      while (parts.length) {
        object = object[parts.pop()];
      }

      return object;
    }

    return value;
  }

  apply(compiler) {
    compiler.hooks.beforeCompile.tap(this.pluginDescription, (params) => {
      params.compilationDependencies.add(this.packageDataPath);
      params.compilationDependencies.add(this.manifestPath);
    });

    compiler.hooks.watchRun.tap(this.pluginDescription, () => {
      delete require.cache[this.packageDataPath];
      delete require.cache[this.manifestPath];
      this.generateJsonPlugin.value = require(this.manifestPath);
    });

    this.generateJsonPlugin.apply(compiler);
  }
}
