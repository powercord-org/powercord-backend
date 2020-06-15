/*
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const { resolve } = require('path')
const { existsSync, readdirSync, unlinkSync } = require('fs')
const TerserJSPlugin = require('terser-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const { DefinePlugin, optimize: { LimitChunkCountPlugin } } = require('webpack')

// Env vars
let commitHash = null
try { commitHash = require('child_process').execSync('git rev-parse HEAD').toString().trim() } catch (e) {}

const isDev = process.env.NODE_ENV === 'development'
const src = resolve(__dirname, 'src')

const baseConfig = {
  mode: isDev ? 'development' : 'production',
  entry: resolve(src, 'main.jsx'),
  output: {
    filename: isDev ? '[name].js' : '[contenthash].js',
    chunkFilename: isDev ? '[name].chk.js' : '[contenthash].js',
    path: resolve(__dirname, 'dist'),
    publicPath: '/dist/'
  },
  resolve: {
    extensions: [ '.js', '.jsx' ],
    alias: {
      '@components': resolve(__dirname, 'src', 'components'),
      '@styles': resolve(__dirname, 'src', 'styles'),
      '@assets': resolve(__dirname, 'src', 'assets')
    }
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.jsx?/,
        include: src,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: true,
              compact: true,
              presets: [ '@babel/preset-react' ],
              plugins: [
                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-proposal-object-rest-spread',
                isDev ? require.resolve('react-refresh/babel') : null
              ].filter(Boolean)
            }
          }
        ]
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: MiniCSSExtractPlugin.loader,
            options: { hmr: isDev }
          },
          {
            loader: 'css-loader',
            options: {
              localsConvention: 'camelCaseOnly',
              modules: { localIdentName: '[local]-[hash:7]' }
            }
          },
          {
            loader: 'postcss-loader',
            options: { plugins: [ require('autoprefixer') ] }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(svg|mp4|webm|woff2?|eot|ttf|otf|wav|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: '[hash:20].[ext]' }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: '[hash:20].[ext]' }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              disable: isDev,
              mozjpeg: {
                progressive: true,
                quality: 95
              },
              optipng: { enabled: false },
              pngquant: {
                quality: [ 0.9, 1 ],
                speed: 4
              },
              gifsicle: {
                interlaced: true,
                optimizationLevel: 2
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new ManifestPlugin({
      writeToFileEmit: true,
      fileName: resolve(__dirname, 'http', 'dist', 'manifest.json')
    }),
    new MiniCSSExtractPlugin({
      filename: isDev ? '[name].css' : '[contenthash].css',
      chunkFilename: isDev ? '[name].css' : '[contenthash].css'
    }),
    new DefinePlugin({
      WEBPACK: {
        GIT_REVISION: JSON.stringify(commitHash)
      },
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],
  optimization: {
    minimize: !isDev,
    minimizer: [
      new TerserJSPlugin({
        extractComments: false,
        parallel: true,
        cache: true
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: [ 'default', {
            cssDeclarationSorter: true,
            discardUnused: true,
            mergeIdents: true,
            reduceIdents: true
          } ]
        }
      })
    ],
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.s?css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  devServer: {
    quiet: true,
    historyApiFallback: true,
    allowedHosts: [ 'localhost', '.ngrok.io' ], // Learn more about ngrok here: https://ngrok.com/
    proxy: { '/': `http://localhost:${require('./config.json').port}` }
  }
}

if (isDev) {
  baseConfig.plugins.push(new FriendlyErrorsWebpackPlugin(), new ReactRefreshWebpackPlugin())
  module.exports = baseConfig
} else {
  baseConfig.plugins.push({
    apply: (compiler) =>
      compiler.hooks.compile.tap('cleanBuild', () => {
        if (existsSync(compiler.options.output.path)) {
          for (const filename of readdirSync(compiler.options.output.path)) {
            if (filename !== 'manifest.json') {
              unlinkSync(resolve(compiler.options.output.path, filename))
            }
          }
        }
      })
  })

  const nodeCfg = {
    ...baseConfig,
    entry: resolve(src, 'components', 'App.jsx'),
    output: {
      filename: 'App.js',
      chunkFilename: '[name].chk.js',
      libraryTarget: 'commonjs2',
      path: resolve(__dirname, 'http', 'dist'),
      publicPath: '/dist/'
    },
    plugins: [
      ...baseConfig.plugins.slice(1),
      new LimitChunkCountPlugin({ maxChunks: 1 })
    ],
    optimization: {
      ...baseConfig.optimization,
      minimize: false
    },
    target: 'node',
    externals: [ require('webpack-node-externals')() ],
    node: {
      __dirname: false,
      __filename: false
    }
  }

  module.exports = [ baseConfig, nodeCfg ]
}
