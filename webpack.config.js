const path = require('path');

module.exports = {
  mode: 'development',
  devtool: "source-map",
  entry: {
    'content': './content/index.js',
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'content'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, './content')],
        use: 'babel-loader',
      },
      {
        test: /\.less/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      {
        test: /\.(png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: 'file-loader',
      },
    ],
  },
};
