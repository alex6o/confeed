var gulp = require('gulp');
var path = require('path');
var cfg = require('../config');
var _ = require('lodash');
var typescript = require('gulp-typescript');
var eventStream = require('event-stream');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('typescript:build', function(callback) {
	var destDir = path.join(cfg.build);
    var src = path.join(cfg.src, cfg.pattern.allSubDirs,cfg.pattern.ts);
    var tsResult = gulp.src(src)
    			 .pipe(sourcemaps.init())
					 .pipe(typescript({
						 sortOutput:true,
						 target: 'ES5',
						 declarationFiles: false,
						 noExternalResolve: true,
						 module: "commonjs"
					   }));
	return eventStream.merge(
			tsResult.dts.pipe(gulp.dest(destDir)),
			tsResult.js
						.pipe(sourcemaps.write())
						.pipe(gulp.dest(destDir))
		);
});
