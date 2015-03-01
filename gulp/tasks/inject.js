var gulp = require('gulp');
var inject = require('gulp-inject');
var path = require('path');
var cfg = require('../config');
var _ = require('lodash');

gulp.task('inject:build', function(callback) {
	var destDir = path.join(cfg.build, cfg.task.inject.viewDir, cfg.context);
	var src = path.join(cfg.src, cfg.context, cfg.task.inject.target);
	var target = gulp.src(src);
	var ignorePath = cfg.dir.build + "/" + cfg.context;
	var sources = gulp.src([
		path.join(cfg.build, cfg.context, "**", "bundle*.js"),
	  path.join(cfg.build, cfg.context, "**", "main*.css")
	], {
	  read: false
	});

	return target.pipe(inject(sources, {
		        addRootSlash: true,
		        addPrefix: '/',
		        ignorePath: ignorePath,
		    }))
		    .pipe(gulp.dest(destDir));
});



function unixify(filepath) {
    return filepath.replace(/\\/g, '/');
}
