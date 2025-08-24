const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  target: 'node',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    clean: true
  },
  devtool: isProd ? false : 'source-map',
  resolve: {
    extensions: ['.ts', '.js']
    // plugins: [new TsconfigPathsPlugin({ configFile: 'tsconfig.json' })]
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          { loader: 'esbuild-loader', options: { loader: 'ts', target: 'es2020', tsconfig: 'tsconfig.build.json' } }
          // Or replace with ts-loader:
          // { loader: 'ts-loader', options: { transpileOnly: true, configFile: 'tsconfig.build.json' } }
        ],
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({ typescript: { configFile: 'tsconfig.build.json' } }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/emailTemplates', to: 'emailTemplates', noErrorOnMissing: true },
        { from: 'src/public', to: 'public', noErrorOnMissing: true },
        { from: 'src/migrations', to: 'migrations', noErrorOnMissing: true }
      ]
    })
  ],
  optimization: { minimize: false },
  node: { __dirname: false, __filename: false }
};
