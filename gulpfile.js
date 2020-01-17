const path = require('path');
const gulp = require('gulp');
const gulpModify = require('gulp-modify');
const pump = require('pump');
const fse = require('fs-extra');
const bowljsCLI = require('bowljs-cli');


// # 以 CMD 规范构建模块

// ## 清理旧的 CMD 构建文件
function clearCMD(cb) {
	fse.removeSync('./dist-cmd');
	fse.mkdirpSync('./dist-cmd');
	cb();
}

// ## 模块增加 define 包装
function wrapJSModule(cb) {
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
}

// ## 调用 Bowljs CLI 构建
function buildJSModule(cb) {
	bowljsCLI.build(
		path.resolve('./dist-cmd'),
		path.resolve('./package.settings')
	);
	cb();
}

exports.buildCMD = gulp.series(clearCMD, wrapJSModule, buildJSModule);


// # NPM 模块构建

// ## 清理旧文件
function clearNPM(cb) {
	fse.removeSync('./dist-npm');
	fse.mkdirpSync('./dist-npm');
	cb();
}

// ## 复制模块
function copyJSToNPM(cb) {
	pump([
		gulp.src('./src/**/*.js'),
		gulp.dest('./dist-npm/')
	], cb);
}

// ## 复制 package.json ，并删除开发部分
function buildPkgJSON(cb) {
	const pkg = require('./package');
	delete pkg.devDependencies;
	delete pkg.scripts;
	fse.writeFileSync('./dist-npm/package.json', JSON.stringify(pkg, null, 2));
	cb();
}

// ## 复制 README.md
function copyReadme(cb) {
	pump([
		gulp.src('./README.md'),
		gulp.dest('./dist-npm/')
	], cb);
}

exports.buildNPM = gulp.series(
	clearNPM,
	copyJSToNPM,
	buildPkgJSON,
	copyReadme
);


// # 生成文档

// ## 清理文档
function clearDoc(cb) {
	fse.removeSync('./docs/api/3.0');
	cb();
}

function genDoc(cb) {
	bowljsCLI.genDoc(
		path.resolve('./dist'),
		path.resolve('./document.settings')
	)
	cb();
}

exports.genDoc = gulp.series(clearDoc, genDoc);
