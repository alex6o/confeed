var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var path = require('path');
var cfg = require('../config');
var vinylPaths = require('vinyl-paths');


gulp.task('clean', function () {
    var destDir = path.join(cfg.build);
    return gulp.src([destDir], {read: false})
        .pipe(vinylPaths(del));
});
