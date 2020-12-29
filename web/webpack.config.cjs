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

const { join } = require('path')
const { existsSync, readdirSync, unlinkSync, writeFileSync } = require('fs')
const { createHash } = require('crypto')

const MiniCSS = require('mini-css-extract-plugin')
const CssMinimizer = require('css-minimizer-webpack-plugin')
const ReactRefresh = require('@pmmmwh/react-refresh-webpack-plugin')
const FriendlyErrors = require('friendly-errors-webpack-plugin')
const { WebpackManifestPlugin: Manifest } = require('webpack-manifest-plugin')
const { DefinePlugin, HotModuleReplacementPlugin, optimize: { LimitChunkCountPlugin } } = require('webpack')

// Env vars
const COMMIT_HASH = require('child_process').execSync('git rev-parse HEAD').toString().trim()
const IS_DEV = process.env.NODE_ENV === 'development'
const SRC = join(__dirname, 'src')
const OUT = join(__dirname, '..', 'dist', 'web')

const baseConfig = {
  mode: IS_DEV ? 'development' : 'production',
  context: SRC,
  entry: './main.jsx',
  output: {
    path: OUT,
    filename: IS_DEV ? '[name].js' : '[contenthash].js',
    chunkFilename: IS_DEV ? '[name].chk.js' : '[contenthash].js',
    crossOriginLoading: 'anonymous',
    chunkLoadingGlobal: 'w',
    publicPath: '/dist/'
  },
  resolve: {
    extensions: [ '.js', '.jsx' ],
    alias: {
      '@components': join(SRC, 'components'),
      '@styles': join(SRC, 'styles'),
      '@assets': join(SRC, 'assets'),
      '@constants': join(SRC, 'constants.js'),
      '@util': join(SRC, 'util.js')
    }
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(ts|js)x?/,
        include: SRC,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [ '@babel/react', { runtime: 'automatic' } ],
                [ '@babel/typescript', { isTSX: true, allExtensions: true } ]
              ],
              plugins: [
                '@babel/syntax-dynamic-import',
                '@babel/proposal-object-rest-spread',
                IS_DEV ? 'react-refresh/babel' : null
              ].filter(Boolean)
            }
          }
        ]
      },
      {
        test: /\.s?css$/,
        use: [
          IS_DEV ? 'style-loader' : MiniCSS.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                exportLocalsConvention: 'camelCaseOnly',
                localIdentName: '[local]-[hash:7]'
              }
            }
          },
          {
            loader: 'postcss-loader',
            options: { postcssOptions: { plugins: [ 'autoprefixer' ] } }
          },
          'sass-loader'
        ],
        exclude: [ /node_modules/ ]
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCSS.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: { postcssOptions: { plugins: [ 'autoprefixer' ] } }
          },
          'sass-loader'
        ],
        include: [ /node_modules/ ]
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
              disable: IS_DEV,
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
    new DefinePlugin({ 'process.env.BUILD_SIDE': JSON.stringify('client') }),
    new Manifest({ writeToFileEmit: true, fileName: join(__dirname, '..', 'dist', 'api', 'manifest.webpack.json') }),
    !IS_DEV && {
      apply: (compiler) =>
        compiler.hooks.emit.tap('emitIntegrity', (compilation) => {
          const stats = compilation.getStats().toJson({ all: false, assets: true })
          const integrity = {}
          for (const [ chk, files ] of Object.entries(stats.assetsByChunkName)) {
            for (const file of files) {
              const sauce = compilation.assets[file].source()
              const sha256 = createHash('sha256').update(sauce, 'utf8').digest('base64')
              const sha512 = createHash('sha512').update(sauce, 'utf8').digest('base64')
              integrity[`${chk}.${file.split('.').pop()}`] = `sha256-${sha256} sha512-${sha512}`
            }
          }

          const file = join(__dirname, '..', 'dist', 'api', 'integrity.webpack.json')
          writeFileSync(file, JSON.stringify(integrity, null, 2), 'utf8')
        })
    },
    new DefinePlugin({ GIT_REVISION: JSON.stringify(COMMIT_HASH) })
  ].filter(Boolean),
  optimization: {
    minimize: !IS_DEV,
    minimizer: [ '...', new CssMinimizer() ],
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
    port: 8080,
    hot: true,
    quiet: true,
    publicPath: '/dist/',
    historyApiFallback: true,
    proxy: { '/': `http://localhost:${require('../config.json').port}` }
  }
}

if (IS_DEV) {
  baseConfig.plugins.push(new HotModuleReplacementPlugin(), new FriendlyErrors(), new ReactRefresh())
  module.exports = baseConfig
} else {
  baseConfig.plugins.push(
    new MiniCSS({ filename: '[contenthash].css', chunkFilename: '[contenthash].css' }),
    {
      apply: (compiler) =>
        compiler.hooks.compile.tap('cleanBuild', () => {
          if (existsSync(compiler.options.output.path)) {
            for (const filename of readdirSync(compiler.options.output.path)) {
              unlinkSync(join(compiler.options.output.path, filename))
            }
          }
        })
    }
  )

  const nodeCfg = {
    ...baseConfig,
    entry: './components/App.jsx',
    target: 'node',
    output: {
      filename: 'App.cjs',
      libraryTarget: 'commonjs',
      path: join(__dirname, '..', 'dist', 'api', 'web'),
      publicPath: '/dist/'
    },
    plugins: [
      ...baseConfig.plugins.slice(4), // Slice manifest, build side, sri
      new LimitChunkCountPlugin({ maxChunks: 1 }),
      new DefinePlugin({ 'process.env.BUILD_SIDE': JSON.stringify('server') })
    ],
    optimization: { minimize: false },
    externals: [ require('webpack-node-externals')() ],
    node: { __dirname: false, __filename: false }
  }

  module.exports = [ baseConfig, nodeCfg ]
}
