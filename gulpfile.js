const gulp = require('gulp');
const gulpModify = require('gulp-modify');
const pump = require('pump');
const fse = require('fs-extra');
const path = require('path');
const bowljsCLI = require('bowljs-cli');


// # 以 CMD 规范构建模块

// ## 清理旧文件
gulp.task('clearCMD', function() {
	fse.removeSync('./dist-cmd');
	fse.mkdirpSync('./dist-cmd');
});

// ## 复制模块，并以 define 包装
gulp.task('wrapJSModule', ['clearCMD'], function(cb) {
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
		gulp.dest('./dist-cmd/')
	], cb)
});

// ## 调用 Bowljs CLI 构建
gulp.task('buildCMD', ['wrapJSModule'], function() {
	bowljsCLI.build(
		path.resolve('./dist-cmd'),
		path.resolve('./package.settings')
	);
});


// # NPM 模块构建

// ## 清理旧文件
gulp.task('clearNPM', function() {
	fse.removeSync('./dist-npm');
	fse.mkdirpSync('./dist-npm');
});

// ## 复制模块
gulp.task('copyJSToNPM', ['clearNPM'], function(cb) {
	pump([
		gulp.src('./src/**/*.js'),
		gulp.dest('./dist-npm/')
	], cb);
});

// ## 复制 package.json ，并删除开发部分
gulp.task('copyPkgJSON', ['clearNPM'], function() {
	const pkg = require('./package');
	delete pkg.devDependencies;
	delete pkg.scripts;
	fse.writeFileSync('./dist-npm/package.json', JSON.stringify(pkg, null, 2));
});

// ## 复制 README.md
gulp.task('copyReadme', ['clearNPM'], function(cb) {
	pump([
		gulp.src('./README.md'),
		gulp.dest('./dist-npm/')
	], cb);
});

// ## 构建
gulp.task('buildNPM', ['copyJSToNPM', 'copyPkgJSON', 'copyReadme']);


// # 生成文档

// ## 清理文档
gulp.task('clearDoc', function() {
	fse.removeSync('./docs/api/3.0');
});

// ## 生成文档
gulp.task('genDoc', ['clearDoc'], function() {
	bowljsCLI.genDoc(
		path.resolve('./dist'),
		path.resolve('./document.settings')
	)
});