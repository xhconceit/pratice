const path = require('path')
const Webpack = require('webpack')
const glob = require('glob-all')
// 自动引入 webpack 打包后的文件
const HTMLWebpackPlugin = require('html-webpack-plugin')
// delete before dist
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// js tree shaking
const WebpackDeepScopeAnalysisPlugin = require('webpack-deep-scope-plugin').default
// 将CSS提取到单独的文件中
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 删除未使用的 CSS
const PurgeCSSPlugin = require('purgecss-webpack-plugin')

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].bundle.js'
	},
	devServer: {
		port: '9000',
		hot: true,
		contentBase: './dist'
	},
	module: {
		// 处理引入的文件
		rules: [
			{
				// 处理引入的 CSS 文件
				test: /\.css$/,
				use: [
					// 将解析的 CSS 打包成文件 
					{ loader: MiniCssExtractPlugin.loader },
					// 将引入的 CSS 文件解析成 CSS
					{ loader: 'css-loader'},
					{
						loader: 'postcss-loader',
						options: {
							ident: 'postcss',
							plugins: [
								require('postcss-cssnext')(),
								require('cssnano')(),
							]
						}
					}
				]
			},
			{
				test: /\.(jpg|png|gif|gif)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							// 打包图片的名字
							name: '[name][hash:8].[ext]',
							// 图片大小
							limit: 100,
							// 打包路径
							outputPath: 'images'
						}
					},
					{
						// 图片压缩
						loader: 'img-loader',
						options: {
							plugins: [
								require('imagemin-gifsicle')({
									interlaced: false
                }),
                require('imagemin-mozjpeg')({
                  progressive: true,
                  arithmetic: false
                }),
                require('imagemin-pngquant')({
                  floyd: 0.5,
                  speed: 2
                }),
                require('imagemin-svgo')({
                  plugins: [
                    { removeTitle: true },
                    { convertPathData: false }
                  ]
                })
              ]
            }
          }
				]
			},
			{
				test: /\.html$/,
				use: [
					{
						// 处理 html 引入的内容
						loader: 'html-loader',
						options: {
							attributes: {
								list: [
									{
										tag: 'img',
										attribute: 'src',
										type: 'src',
									}
								]
							}
						}
					}
				]
			}
		]
	},
	plugins: [
		// 将 CSS 提取到单独的文件中
		new MiniCssExtractPlugin({
			filename: '[name].css'
		}),
		// 删除未使用的 CSS 
		new PurgeCSSPlugin({
      paths: glob.sync([
			path.resolve(__dirname, './src/*.js'),
			path.resolve(__dirname, './src/*.html')
			],{ nodir: true }),
    }),
		// js tree shaking
		new WebpackDeepScopeAnalysisPlugin(),
		// 删除之前打包的文件
		new CleanWebpackPlugin(),
		// 
		new Webpack.HotModuleReplacementPlugin(),
		// 自动引入 webpck 打包后的文件
		new HTMLWebpackPlugin({
			// html 模板
			template: './src/index.html',
			// 打包后名字
			filename: 'index.html',
			// 压缩
			minify: {
				// 清理注释
				removeComments: true,
				// 清理空格
				collapseWhitespace: true
			}
		})
	],
	mode: 'development'
}
