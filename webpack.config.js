var nib                 = require('nib');
var path                = require('path');
var glob                = require('glob');
var webpack             = require('webpack');
var poststylus          = require('poststylus');
var stylusUrl           = require('stylus-url');
var ExtractTextPlugin   = require("extract-text-webpack-plugin");
var BrowserSyncPlugin   = require('browser-sync-webpack-plugin');
var HtmlWebpackPlugin   = require('html-webpack-plugin');


// 文档: https://webpack.github.io/docs/configuration.html

var paths = {
  root: path.join(__dirname, './'),
  src: path.join(__dirname, './src/'),
  scripts: path.join(__dirname, './src/scripts'),
  styles: path.join(__dirname, './src/styles'),
  assets: path.join(__dirname, './src/assets'),
}

var config = {
  context: paths.root,
  debug: true,
  watch: true,
  separateStylesheet: true,
  devtool: 'source-map',
  entry: {
    style: 'styles', // alias, realpath is ./src/styles/index.js
    main: 'scripts', // alias, realpath is ./src/scripts/index.js
  },
  output: {
    path: 'build/assets',
    filename: "[name].js",
    chunkFilename: "[id].js"
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel'},
      { test: /\.(jpe?g|png|gif|svg)$/, loader: 'file-loader?name=static/[hash].[ext]'},
      { test: /\.(woff|woff2)$/, loader: 'file-loader?name=static/[hash].[ext]'},
      { test: /\.(ttf|eot|otf)$/, loader: 'file-loader?name=static/[hash].[ext]'},
      { test: /\.txt$/, loader: 'raw-loader'},
      // Extract css files
      { test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader?sourceMap") },
      // Optionally extract less files
      // or any other compile-to-css language
      { test: /\.styl$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!stylus-loader?sourceMap") }
      // You could also use other loaders the same way. I. e. the autoprefixer-loader
    ]
  },
  externals: {
    jquery: 'jQuery',
    window: 'window',
    document: 'document'
  },
  resolve: {
    // root: path.join(__dirname, './src'),
    modulesDirectories: ['node_modules', 'bower_components'],
    extensions: ['', '.es6.js', '.js', '.vue' ],
    alias: {
      'assets': paths.assets,
      'styles': paths.styles,
      'scripts': paths.scripts,
      'masonry': 'masonry-layout',
      'isotope': 'isotope-layout',
    }
  },
  resolveLoader: {
    alias: {
      'copy': 'file-loader?name=[name].[ext]', //&context=./src
    }
  },
  // User Custom Config
  stylus: {
    use: [
      stylusUrl({
        root: paths.src
      }),
      poststylus([ 'autoprefixer' ]),
    ],
    import: [
      '~nib/lib/nib/index.styl',
      path.join(paths.styles, 'stylus/variables.styl')
    ]
  },
  babel: {
    presets: ['es2015'],
    plugins: ['transform-runtime']
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery'
    }),
    new ExtractTextPlugin("[name].css"),
    new BrowserSyncPlugin(
      // BrowserSync options 
      {
        // browse to http://localhost:3000/ during development 
        host: 'localhost',
        port: 4000,
        // proxy the Webpack Dev Server endpoint 
        // (which should be serving on http://localhost:3100/) 
        // through BrowserSync 
        // proxy: 'http://localhost:3100/'
        server: { 
          baseDir: ['build'],
          directory: true  // with directory listing
        }
      },
      // plugin options 
      {
        // prevent BrowserSync from reloading the page 
        // and let Webpack Dev Server take care of this 
        reload: true
      }
    )
  ]
};

var pages = Object.keys(getEntry('views/**/*.html', ['includes', 'base']));
pages.forEach(function(pathname) {
    var conf = {
        template:  '!!file-loader?name=../' + pathname + '.html!nunjucks-html-loader?{\"searchPaths\":[\"views\"]}!views/' + pathname + '.html', //html模板路径
    };
    config.plugins.push(new HtmlWebpackPlugin(conf));
});

function getEntry(globPath, filter) {
    var files = glob.sync(globPath);
    var entries = {},
        entry, dirname, basename, pathname, extname;

    for (var i = 0; i < files.length; i++) {
        entry = files[i];
        dirname = path.dirname(entry); // views/
        var father = dirname.split('/').reverse();
        if (filter.indexOf(father[0]) !== -1) continue;
        extname = path.extname(entry); // [.ext]
        basename = path.basename(entry, extname);
        if (filter.indexOf(basename) !== -1) continue;
        pathname = path.join(dirname, basename);
        var tararr = pathname.split('/');
        tararr.shift();
        console.log(tararr);
        var target = tararr.join('/');
        console.log(target);
        entries[target] = ['./' + entry];
    }
    return entries;
}

module.exports = config;



