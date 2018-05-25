/* eslint-env node */
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const GenerateJsonPlugin = require("generate-json-webpack-plugin");

const packageData = require("./package.json");
const manifest = require("./extension/manifest.json");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    content: "./extension/content/index.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin([
      "extension/background.js",
      { from: "extension/experiments/", to: "experiments/" },
      { from: "extension/images/", to: "images/" },
    ]),
    new HtmlWebpackPlugin({
      title: "Normandy Devtools",
      filename: "content.html",
    }),
    new GenerateJsonPlugin("manifest.json", manifest, (key, value) => {
      if (typeof value === "string" && value.startsWith("$")) {
        let parts = value.slice(1).split(".");
        let object = packageData;
        while (parts.length > 0) {
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
        use: "babel-loader",
      },
      {
        test: /\.less/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
      {
        test: /\.(png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: "file-loader",
      },
    ],
  },
};
