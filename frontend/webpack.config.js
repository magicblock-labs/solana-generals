const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env, argv) => {
  let isDevelopment = (process.env.NODE_ENV = argv["mode"]) !== "production";

  return {
    entry: "./src/index.tsx",

    mode: isDevelopment ? "development" : "production",

    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[contenthash].[name].js",
    },

    resolve: {
      modules: ["node_modules"],
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [".js", ".ts", ".tsx", ".js", ".css", ".scss"],
    },

    devServer: {
      static: {
        directory: path.join(__dirname, "dist/"),
      },
      historyApiFallback: true,
    },

    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: [{ loader: "ts-loader" }],
        },
        // The following loader rules are necessary for s/css modules
        {
          test: /\.module\.s(a|c)ss$/,
          use: [
            {
              loader: isDevelopment
                ? "style-loader"
                : MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              // As of css-loader 4, the options have changed
              // https://github.com/webpack-contrib/css-loader
              options: {
                modules: {
                  localIdentName: "[folder]__[local]__[hash:base64:5]",
                  exportLocalsConvention: "camelCase",
                },
              },
            },
            { loader: "sass-loader" },
          ],
        },
        {
          test: /\.scss$/,
          exclude: /\.module.(s(a|c)ss)$/,
          use: [
            isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
            "css-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          use: [
            {
              loader: "url-loader",
              options: {
                fallback: "file-loader",
              },
            },
          ],
        },
      ],
    },

    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: "[name].[contenthash].css",
      }),
      new HTMLWebpackPlugin({
        template: path.join(__dirname, "./src/index.html"),
      }),
    ],
  };
};
