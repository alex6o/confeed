var Q = require('q');
var gulp = require('gulp');
var path = require('path');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var eventStream = require('event-stream');
var cfg = require('../config');


gulp.task('server:build', function () {
	var deferred = Q.defer();
	runSequence(
			//'clean',
			[
			 	'static:copy',
			 	'less:build',
			 	'typescript:build'
			],
			function () {
				deferred.resolve();
			});

	return deferred.promise;
});

gulp.task('ui:build', function () {
    var deferred = Q.defer();
    runSequence(
    	//'clean',
		[
		 	'static:copy',
		 	'less:build',
		 	'typescript:build'
		],
		'browserify:build',
        'inject:build',
        function () {
            deferred.resolve();
        });

    return deferred.promise;
});
