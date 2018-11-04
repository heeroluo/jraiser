/**
 * 使用Express构建开发服务器
 * 主要用于调试和编写测试用例
 */

const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const fse = require('fs-extra');


// 监听端口
const PORT = 6300;
// 用于构建资源的临时目录
const BUILD_DIR = path.join(__dirname, 'build');


// 创建用于构建资源的临时目录
if (!fse.existsSync(BUILD_DIR)) { fse.mkdirSync(BUILD_DIR); }


// 记录文件修改时间
// 没有修改过的不用重新构建
const fileMTimes = {};

// 如果文件有改动则执行fn
function ifModified(filePath, fn, res) {
	// 文件不存在直接响应404
	const exists = fse.existsSync(filePath);
	if (!exists) {
		return 404;
	}

	const mtime = fse.statSync(filePath).mtime.toISOString();
	if (fileMTimes[filePath] !== mtime) {
		fn(filePath);
		fileMTimes[filePath] = mtime;
	} else {
		return 0;
	}
}


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/ajax', require('./ajax-test'));

app.use((req, res, next) => {
	let assetPath = req.originalUrl;
	console.info('Request ' + assetPath);
	assetPath = assetPath.replace(/\?.*$/, '');

	let result;

	if (/^\/non-modular\//.test(assetPath) || !/\.js$/.test(assetPath)) {
		result = ifModified(
			path.join(__dirname, 'src', assetPath),
			(filePath) => {
				// 不需要构建的文件，直接复制
				console.info('Copy ' + filePath);
				fse.copySync(
					filePath,
					path.join(BUILD_DIR, assetPath),
				);
			},
			res
		);

	} else {
		let isLib, isLibDist;
		let subPath = assetPath.replace(/^\/jraiser(-dist)?\//, (match, $1) => {
			isLib = true;
			isLibDist = $1;
			return '';
		});

		result = ifModified(
			isLib ?
				path.resolve(__dirname, isLibDist ? '../dist' : '../src', subPath) :
				path.join(__dirname, 'src', assetPath),
			(filePath) => {
				console.info('Build ' + filePath);

				const content = fse.readFileSync(filePath, 'utf-8');
				// 构建，增加 define 包装
				fse.outputFileSync(
					path.join(BUILD_DIR, assetPath),
					/\.nmd\.js$/.test(assetPath) || isLibDist ?
						content :
						'define(function(require, exports, module) { "use strict";\n' +
							content +
						'\n});'
				);
			},
			res
		);
	}

	if (result === 404) {
		res.status(404).end();
	} else {
		next();
	}
});

app.use(express.static(BUILD_DIR));


const server = http.createServer(app);
server.listen(PORT);

server.on('error', (error) => {
	if (error.syscall !== 'listen') { throw error; }

	const bind = 'Port ' + appConfig.port;
	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
});

server.on('listening', () => {
	const addr = server.address();
	const bind = 'port ' + addr.port;
	console.info('Listening on ' + bind);
});


// 退出时移除临时目录
const exitHandler = () => {
	fse.removeSync(path.join(__dirname, 'build'));
	process.exit();
};

process.stdin.resume();
process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);