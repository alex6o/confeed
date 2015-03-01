var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var path = require('path');
var cfg = require('../config');
var _ = require('lodash');
var rename = require('gulp-rename');


gulp.task('less:build', function(callback) {
	var destDir = path.join(cfg.build, cfg.context,cfg.dir.css);
	var src = path.join(cfg.src, cfg.context,cfg.dir.less,"main.less");
    return gulp.src(src)
    	.pipe(less({
            compress: false
        }).on('error', gutil.log))
        .pipe(gulp.dest(destDir));
});
