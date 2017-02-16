var path = require('path')
var yaml = require('js-yaml');
var nunjucks = require('nunjucks')
var posts = require('metalsmith-posts/lib/posts')
var md = require('./markdown')

var YAML_SCHEMA;

var absolute = require('absolute');
var fs = require('fs');
var unyield = require('unyield');
var utf8 = require('is-utf8');
var matter = require('gray-matter')
var Mode = require('stat-mode');

var readFile = function(file) {
  var src = path.join(__dirname, './src/posts');

  var ret = {};

  if (!absolute(file)) file = path.resolve(src, file);

  try {
    //var stats = yield fs.stat(file);
    //var buffer = yield fs.readFile(file);
    //var parsed;

    //if (utf8(buffer)) {
      try {
        parsed = matter.read(file, {schema: YAML_SCHEMA });
      } catch (e) {
        var err = new Error('Invalid frontmatter in the file at: ' + file);
        err.code = 'invalid_frontmatter';
        throw err;
      }

      ret = parsed.data;
      ret.contents = parsed.content;
      ret.link = path.relative(src, file).replace(/.md$/g, '.html')

    //} else {
    //  ret.contents = buffer;
    //}

    //ret.mode = Mode(stats).toOctal();
    //ret.stats = fs.statSync(file);
  } catch (e) {
    if (e.code == 'invalid_frontmatter') throw e;
    e.message = 'Failed to read the file at: ' + filepath + '\n\n' + e.message;
    e.code = 'failed_read';
    throw e;
  }

  return ret;
}

var readDir = function(dir) {
    var src = path.join(__dirname, '../src/posts');
    var results = []
    var list = fs.readdirSync(path.resolve(src, dir))
    list.forEach(function(file) {
        file = path.resolve(src, dir, file)
      //console.log(file)
        var stat = fs.statSync(file)
        if (!stat.isDirectory()) {
          results.push(readFile(file))
        }
    })
    return results
}

var FileType = new yaml.Type('tag:yaml.org,2002:post', {
  kind: 'scalar',
  construct: function (file) {
    var data = readFile(file);
    posts.set(file, data);
    var post = posts.get(file);
    //console.log(file, post);
    return post
  },
  // `represent` is omitted here. So, Space objects will be dumped as is.
  // That is regular mapping with three key-value pairs but with !space tag.
});

var DirType = new yaml.Type('tag:yaml.org,2002:posts', {
  kind: 'scalar',
  construct: function (dir) {
    var collection = readDir(dir);
    posts.setCollection(dir, collection);
    //console.log(dir, posts.getCollections(dir))
    return posts.getCollections(dir)
    //return global.posts.getCollections(args)
    //return global.posts.getCollections(args);
  },
  //instanceOf: Space
  // `represent` is omitted here. So, Space objects will be dumped as is.
  // That is regular mapping with three key-value pairs but with !space tag.
});

var ViewType = new yaml.Type('tag:yaml.org,2002:view', {
  kind: 'scalar',
  construct: function (template) {
    return nunjucks.render(template);
    //return new nunjucks.runtime.markSafe(nunjucks.render(template));
  },
  //instanceOf: Space
  // `represent` is omitted here. So, Space objects will be dumped as is.
  // That is regular mapping with three key-value pairs but with !space tag.
});

var MarkdownType = new yaml.Type('tag:yaml.org,2002:md', {
  kind: 'scalar',
  construct: function (text) {
    return md.render(text);
    //return new nunjucks.runtime.markSafe(md.render(text));
  },
  //instanceOf: Space
  // `represent` is omitted here. So, Space objects will be dumped as is.
  // That is regular mapping with three key-value pairs but with !space tag.
});

YAML_SCHEMA = yaml.Schema.create([ FileType, DirType, ViewType, MarkdownType ]);

module.exports.YAML_SCHEMA  = YAML_SCHEMA;
