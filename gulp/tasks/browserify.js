var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');
var cfg = require('../config');
var _ = require('lodash');
var debowerify = require("debowerify");
var aliasify = require("aliasify");



gulp.task('browserify:build', function() {
  var bundler = browserify({
    debug: true
  });
  bundler.add("./" + path.join("./",cfg.build,cfg.context,cfg.task.browserify.main));

  var destDir = path.join(cfg.build,cfg.context);
  var bundle = function() {

    return bundler
      .transform(aliasify)
      .transform(debowerify)
      .bundle()
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      // Add transformation tasks to the pipeline here.
      //.pipe(uglify({mangle:false}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(destDir));
  };

  return bundle();
});
