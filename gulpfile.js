const gulp = require('gulp');
const gulpModify = require('gulp-modify');
const pump = require('pump');
const fse = require('fs-extra');
const path = require('path');
const bowljsCLI = require('bowljs-cli');


gulp.task('clearDist', function() {
	fse.removeSync('./dist');
	fse.mkdirpSync('./dist');
});

gulp.task('copyJS', ['clearDist'], function(cb) {
	pump([
		gulp.src('./src/**/*.js'),
		gulpModify({
			fileModifier(file, content) {
				file.path = file.path.replace(/\.js$/i, '-debug.js');
				if (/\.nmd-debug\.js$/i.test(file.path)) {
					return content;
				} else {
					return 'define(function(require, exports, module) {\n' +
						'\'use strict\'; \n\n' +
						content +
					'\n\n});';
				}
			}
		}),
		gulp.dest('./dist/')
	], cb)
});

gulp.task('compileJS', ['copyJS'], () => {
	bowljsCLI.build(
		path.resolve('./dist'),
		path.resolve('./package.settings')
	);
});


gulp.task('clearDoc', function() {
	fse.removeSync('./docs/api/3.0');
});

gulp.task('genDoc', ['clearDoc'], function() {
	bowljsCLI.genDoc(
		path.resolve('./dist'),
		path.resolve('./document.settings')
	)
});