const path = require('path');

module.exports = {
  mode: 'development',
  devtool: "source-map",
  entry: {
    'content': './content/index.js',
  },
  output: {
    filename: '[name]/bundle.js',
    path: path.resolve(__dirname),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, './content'),
        ],
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
    ],
  },
};
