/* eslint-env node */
const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const CopyWebpackPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const GenerateJsonPlugin = require("generate-json-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");

const packageData = require("./package.json");
const manifest = require("./extension/manifest.json");

const cacheLoader = {
  loader: "cache-loader",
  options: { cacheDirectory: ".webpack-cache" },
};

module.exports = async (env, argv = {}) => {
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
    new Dotenv({
      silent: true,
      systemvars: true,
    }),
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
    new GenerateJsonPlugin(
      "manifest.json",
      manifest,
      (key, value) => {
        if (typeof value === "string" && value.startsWith("$")) {
          const parts = value.slice(1).split(".");
          let object = packageData;
          while (parts.length) {
            object = object[parts.pop()];
          }

          return object;
        }

        return value;
      },
      2 /* indent width */,
    ),
    new webpack.DefinePlugin({
      __BUILD__: JSON.stringify(await getBuildInfo(development)),
    }),
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

async function getBuildInfo(isDevelopment) {
  const rv = {
    version: (await execOutput("git describe --dirty=-uc")).trim(),
    commitHash: (await execOutput("git rev-parse HEAD")).trim(),
  };

  if (isDevelopment) {
    rv.isDevelopment = true;
  }

  if (rv.version.endsWith("-uc")) {
    rv.hasUncommittedChanges = true;
  }

  return rv;
}

async function execOutput(command, options = {}) {
  const { stdout } = await exec(command);
  return stdout;
}
