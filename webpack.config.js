/* eslint-env node */
const { execSync } = require("child_process");
const path = require("path");
const process = require("process");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const GenerateJsonPlugin = require("generate-json-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const { merge } = require("webpack-merge");

const manifest = require("./extension/manifest.json");
const packageData = require("./package.json");

module.exports = (env, argv) => {
  const development = argv.mode === "development";

  const baseConfigs = [makeBaseConfig(development, argv)];
  if (development) {
    baseConfigs.push(makeBaseDevelopmentConfig());
  }

  return [
    merge(...baseConfigs, injectBuildInfo("web"), makeWebConfig(development)),
    merge(
      ...baseConfigs,
      injectBuildInfo("extension"),
      makeExtensionConfig(development),
    ),
  ];
};

function makeBaseConfig(development, argv) {
  let cacheDirectory = ".webpack-cache";
  if (argv.configName) {
    cacheDirectory = path.join(cacheDirectory, argv.configName);
  } else {
    cacheDirectory = path.join(cacheDirectory, "all-configs");
  }

  const cacheLoader = { loader: "cache-loader", options: { cacheDirectory } };

  const entry = {
    index: "./content/index.js",
    "dark-theme": "./content/less/dark.less",
    "light-theme": "./content/less/light.less",
  };

  const plugins = [
    new FixStyleOnlyEntriesPlugin(),
    new MiniCssExtractPlugin(),
    new Dotenv({
      silent: true,
      systemvars: true,
    }),
    new HtmlWebpackPlugin({
      title: "Redirect",
      filename: "redirect.html",
      chunks: ["redirect"],
    }),
    new HtmlWebpackPlugin({
      title: "Normandy Devtools",
      favicon: path.resolve(__dirname, "./extension/images/favicon.png"),
      filename: "index.html",
      chunks: ["index", ...(argv.mode ? ["react-devtools"] : [])],
      chunksSortMode(a, b) {
        const order = ["react-devtools", "index"];
        return order.indexOf(a) - order.indexOf(b);
      },
    }),
    new webpack.DefinePlugin({
      DEVELOPMENT: JSON.stringify(development),
    }),
  ];

  return {
    mode: "production",
    devtool: "none",
    entry,
    output: {
      filename: "[name].js",
    },
    resolve: {
      alias: {
        devtools: path.resolve(__dirname, "./content"),
      },
      extensions: [".js", ".ts", ".tsx"],
    },
    plugins,
    module: {
      rules: [
        {
          // .js, .jsx, .ts, and .tsx
          test: /\.[jt]sx?$/,
          include: [
            path.resolve(__dirname, "./content"),
            path.resolve(__dirname, "./extension/content-scripts"),
          ],
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
}

function makeBaseDevelopmentConfig() {
  return {
    mode: "development",
    devtool: "source-map",
    entry: {
      "react-devtools": "react-devtools",
    },
  };
}

function makeExtensionConfig(development) {
  const entry = {
    background: "./extension/background.js",
    "content-scripts": "./extension/content-scripts/inject.js",
    redirect: "./content/redirect.js",
  };

  const plugins = [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "extension/experiments/",
          // relative to the output directory
          to: "experiments/",
          globOptions: {
            ignore: ["**/.eslintrc.js"],
          },
        },
        { from: "extension/images/", to: "images/" },
      ],
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
      /* indent width */ 2,
    ),

    // Code splitting doesn't do any good in extensions
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ];

  if (development) {
    entry.restore = "./content/restore.ts";

    plugins.push(
      new HtmlWebpackPlugin({
        title: "Restore",
        filename: "restore.html",
        chunks: ["restore"],
      }),
    );
  }

  return {
    name: "extension",
    entry,
    plugins,
    optimization: {
      minimize: false,
    },
    output: {
      path: path.resolve(__dirname, `./dist-extension`),
    },
  };
}

function makeWebConfig(development) {
  return {
    name: "web",

    devServer: {
      contentBase: "./dist-web",
    },

    output: {
      path: path.resolve(__dirname, `./dist-web`),
    },

    optimization: {
      minimize: !development,
      splitChunks: { chunks: "all" },
    },

    plugins: [
      new webpack.DefinePlugin({
        browser: `((() => {
          let proxyMaker = (prefix) => {
            return new Proxy({}, {
              get(target, prop) {
                console.warn(\`Accessed extension API \${prefix\}\${prop} from\`, new Error().stack);
                if (["addListener", "getRecipeSuitabilities"].includes(prop)) {
                  return () => {};
                }
                return proxyMaker(prefix + prop + ".");
              }
            });
          };
          return proxyMaker("");
        })())`.replace("\n", " "),
      }),
    ],
  };
}

function injectBuildInfo(configName) {
  const buildInfo = {
    commitHash: execSync("git rev-parse HEAD").toString().trim(),
  };

  /*
   * In normal builds (usually in development), describe the version metadata
   * with a lot of detail. This shows up in the UI of the page/extension. In
   * Taskcluster builds, just take whatever package.json says.
   */
  if (process.env.MOZ_AUTOMATION && process.env.MOZ_RELEASE_BUILD) {
    buildInfo.version = `${packageData.version}-${configName}`;
  } else {
    const described = execSync("git describe --dirty=-uc").toString().trim();
    const describedPattern = /^v(?<tag>.+?)(?:-(?<revisionInfo>(?:[0-9]+?)-(?:.+?)))?(?<uncommittedChanges>-uc)?$/;
    const matches = described.match(describedPattern);
    const buildMetadata = [];
    if (matches) {
      const { tag, revisionInfo, uncommittedChanges } = matches.groups;
      buildInfo.version = tag;

      if (revisionInfo) {
        buildMetadata.push(revisionInfo);
      }

      buildMetadata.push(configName);

      if (uncommittedChanges) {
        buildMetadata.push("uc");
        buildInfo.hasUncommittedChanges = true;
      }
    }

    if (!buildInfo.version) {
      buildInfo.version = packageData.version;
    }

    if (buildMetadata) {
      buildInfo.version += `+${buildMetadata.join("-")}`;
    }
  }

  return {
    plugins: [
      new webpack.DefinePlugin({
        __BUILD__: webpack.DefinePlugin.runtimeValue(
          () => JSON.stringify(buildInfo),
          true,
        ),
      }),
    ],
  };
}
