var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var path = require('path');
var cfg = require('../config');
var _ = require('lodash');

gulp.task('ui:watch', ['ui:build'], function(callback) {
	var staticSrc = [];
  var tsSrc = path.join(cfg.src, cfg.pattern.allSubDirs,cfg.pattern.ts);
  var lessSrc = path.join(cfg.src, cfg.pattern.allSubDirs,cfg.pattern.less);

	_(cfg.task.static.src).forEach(function(elem) { staticSrc.push(path.join(cfg.src, cfg.context, elem));}).value();

	gulp.watch(staticSrc, ['static:copy']);
	gulp.watch(tsSrc, ['ui:build']);
	gulp.watch(lessSrc, ['less:build']);

});


gulp.task('server:watch', ['server:build'], function(callback) {
	var staticSrc = [];
    var tsSrc = path.join(cfg.src, cfg.context, cfg.pattern.allSubDirs,cfg.pattern.ts);

	_(cfg.task.static.src).forEach(function(elem) { staticSrc.push(path.join(cfg.src, cfg.context, elem));}).value();

	gulp.watch(staticSrc, ['static:copy']);
	gulp.watch(tsSrc, ['server:build']);
});
