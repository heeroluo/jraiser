/*!
 * Bowl.js
 * Javascript module loader for browser - v1.2.1
 * http://jraiser.org/ | Released under MIT license
 */
(function(global, undefined) {

'use strict';

// 防止重复初始化
if (global.bowljs) { return; }

var bowljs = global.bowljs = {
	version: '1.2.1',
	logs: [ ]
};

// 记录日志
function log(from, message) {
	bowljs.logs.push('[' + from + ']' + message);
}


var config = { },
	doc = global.document,
	useInteractive = global.attachEvent &&
		!(global.opera != null && global.opera.toString() === '[object Opera]');


// 检查是否空对象
function isEmptyObject(obj) {
	for (var p in obj) {
		if (obj.hasOwnProperty(p)) { return false; }
	}
	return true;
}

// 扩展对象
function extend(target, src) {
	for (var p in src) {
		if (src.hasOwnProperty(p)) { target[p] = src[p]; }
	}
	return target;
}

// 移除前后空格
function trim(str) {
	return str == null ?
		'' :
		String(str)
			.replace(/^\s+/, '')
			.replace(/\s+$/, '');
}

// 判断是否数组
var isArray = Array.isArray || (function() {
	var toString = Object.prototype.toString;
	return function(val) {
		return toString.call(val) === '[object Array]';
	};
})();

// 统一为数组结构
function unifyArray(val) { return isArray(val) ? val : [ val ]; }

// 保证字符串以某字符开头
function ensurePrefix(str, prefix) {
	str = trim(str);
	return !str || str.charAt(0) === prefix ? str : prefix + str;
}

// 保证字符串以某字符结尾
function ensureSuffix(str, suffix) {
	str = trim(str);
	return !str || str.charAt(str.length - 1) === suffix ? str : str + suffix;
}


// 检查是否绝对路径
function isAbsPath(path) { return /^(?:[a-z]+:)?\/{2,}/i.test(path); }

// 创建一个包含a元素的div，用于获取绝对路径
function createDivContainsA(href) {
	// 旧IE下必须使用innerHTML注入a标签（不能只创建a元素），才能获得其绝对路径
	var div = doc.createElement('div');
	div.innerHTML = '<a href="' + href + '"></a>';
	return div;
}

// 转换为绝对路径
function toAbsPath(path) {
	// 修正路径中有两个“/”的情况
	var protocol = '';
	path = path.replace(/^(?:[a-z]+:)?\/\//i, function(match) {
		// 协议中有两个“/”，先提取出来
		protocol = match;
		return '';
	}).replace(/\/{2,}/g, '/');
	path = protocol + path;

	var div = createDivContainsA(path);
	path = div.firstChild.href;

	div = null;
	return path;
}

// URL类，记录URL的解析结果，也可以修改某个部分形成新的URL
function URL(url) {
	var div = createDivContainsA(url), a = div.firstChild;
	/* eslint-disable no-self-assign */
	a.href = a.href;

	var t = this;
	// 解析出URL的各个部分
	t.protocol = a.protocol;

	// IE<=9会在host中添加默认端口号，移除之
	switch (t.protocol) {
		case 'http:':
			t.host = a.host.replace(/:80$/, '');
			break;

		case 'https:':
			t.host = a.host.replace(/:443$/, '');
			break;
	}

	t.hostname = a.hostname;
	t.port = a.port;
	t.pathname = ensurePrefix(a.pathname, '/');
	t.search = a.search;
	t.hash = a.hash;

	div = a = null;
}
URL.prototype.toString = function() {
	return ensureSuffix(this.protocol, ':') +
		'//' + this.host +
		ensurePrefix(this.pathname, '/') +
		ensurePrefix(this.search, '?') +
		ensurePrefix(this.hash, '#');
};


// 解析相对路径（ref必须以/结尾）
function resolvePath(to, from) {
	var reBeginWithDot = /^\./;
	if (config.basePath) {
		if (!from || !reBeginWithDot.test(to)) {
			from = config.basePath;
		}
	} else {
		if (/^\//.test(to)) {
			// 以“/”开头的路径，上下文路径为应用路径
			from = config.appPath;
			to = to.substr(1);
		} else if (!reBeginWithDot.test(to)) {
			// 非相对路径情况下，上下文路径为类库路径
			from = config.libPath;
		}
	}

	return toAbsPath(from + to);
}

// 把模块ID转换成URL
var idURLMapping = { };
function idToURL(id, ref) {
	var cacheKey = id = trim(id);

	// 缓存非相对路径id的转换结果
	var canBeCached = !/^\./.test(id);

	if (canBeCached && idURLMapping[cacheKey]) { return idURLMapping[cacheKey]; }

	// 临时记录URL中的参数和锚点
	var suffix = '';

	id = id
		// 暂时移除锚点和参数，便于解析
		.replace(/(?:\?.*)?(?:#.*)?$/, function(match) {
			suffix = match;
			return '';
		})
		// 解析 module@version 为 module/version/module
		.replace(/([^\\/]+)@([^\\/]+)/g, function(match, module, version) {
			return module + '/' + version + '/' + module;
		})
		.split('/');

	// 如果没有指定具体文件，则加载目录下的index
	var filename = id.pop() || 'index', extname;

	// 解析出文件名和扩展名
	var temp = filename.lastIndexOf('.');
	if (temp !== -1) {
		extname = filename.substr(temp + 1);
		filename = filename.substr(0, temp);
	}
	extname = extname || 'js';

	// 处理调试后缀
	var reDebug = /-debug$/;
	if (config.debug && !reDebug.test(filename)) {
		filename += '-debug';
	} else if (!config.debug && reDebug.test(filename)) {
		filename = filename.replace(reDebug, '');
	}
	id.push(filename + '.' + extname);

	var url = id.join('/') + suffix;
	if (!isAbsPath(url)) { url = resolvePath(url, ref || ''); }
	url = new URL(url);

	// 地址映射
	var map = config.map;
	if (map) {
		for (var i = 0; i < map.length; i++) {
			map[i](url);
		}
	}

	url = url.toString();

	// 记录解析结果
	if (canBeCached) { idURLMapping[cacheKey] = url; }

	return url;
}

// 分析出依赖（require）的模块
function parseDeps(code) {
	var pattern = /(?:^|[^.$])\brequire\s*\(\s*(["'])([^"'\s)]+)\1\s*\)/g,
		result = [ ],
		match;

	// 粗略移除代码中的注释
	code = code
		.replace(/^\s*\/\*[\s\S]*?\*\/\s*$/mg, '') 	// 多行注释
		.replace(/^\s*\/\/.*$/mg, '');				// 单行注释

	while (!!(match = pattern.exec(code))) {
		if (match[2]) { result.push(match[2]); }
	}

	return result;
}


// JS文件加载器
var scriptLoader = (function() {
	var onloadEvent = 'onload' in doc.createElement('script') ? 'onload' : 'onreadystatechange',
		head = doc.head || doc.getElementsByTagName('head')[0],
		status = { },
		scripts = [ ],
		currentlyAddingScript,
		interactiveScript;

	return {
		// 获取正在执行的JS
		getCurrentScript: function() {
			if (currentlyAddingScript) { return currentlyAddingScript; }

			if (interactiveScript && interactiveScript.readyState === 'interactive') {
				return interactiveScript;
			}

			for (var i = 0; i < scripts.length; i++) {
				if (scripts[i].readyState === 'interactive') {
					interactiveScript = scripts[i];
					return interactiveScript;
				}
			}
		},

		// 加载JS
		load: function(src, onload) {
			var currentStatus = status[src];

			log('scriptLoader.load', 'src(' + src + '), status(' + currentStatus + ')');

			if (currentStatus) {
				// status为1时表示此文件加载中，无须二次加载
				// status为2时表示文件加载完成
				if (currentStatus === 2) {
					if (onload) { onload(); }
				}
			} else {
				// 记录正在加载
				status[src] = 1;

				var script = doc.createElement('script');
				switch (typeof config.charset) {
					case 'function':
						script.charset = config.charset(src);
						break;

					case 'string':
						script.charset = config.charset;
						break;
				}
				script.async = true;
				script.src = src;

				script[onloadEvent] = script.onerror = function() {
					var readyState = script.readyState;
					if (!readyState || 'loaded' === readyState || 'complete' === readyState) {
						// 记录加载完成
						status[src] = 2;

						log('scriptLoader.load(onload)', src);

						script[onloadEvent] = script.onerror = null;
						head.removeChild(script);

						for (var i = scripts.length - 1; i >= 0; i--) {
							if (scripts[i] === script) {
								scripts.splice(i, 1);
								break;
							}
						}
						script = interactiveScript = null;

						if (onload) { onload(); }
					}
				};

				scripts.push(script);

				currentlyAddingScript = script;
				head.insertBefore(script, head.firstChild);
				currentlyAddingScript = null;
			}
		}
	};
})();


// 模块依赖链
var dependentChain = (function() {
	// 记录某个模块被哪些模块依赖
	var whichDepOnMe = { };

	return {
		// 添加依赖记录
		add: function(moduleId, depId) {
			log('dependentChain.add', 'moduleId(' + moduleId + '), depId(' + depId + ')');

			whichDepOnMe[depId] = whichDepOnMe[depId] || [ ];
			whichDepOnMe[depId].push(moduleId);
		},

		// 获取依赖于指定模块的模块记录
		get: function(depId) { return whichDepOnMe[depId]; },

		// 清除依赖于某个模块的记录（当被依赖模块就绪时，即可清除）
		clear: function(depId) {
			log('dependentChain.remove', 'depId(' + depId + ')');

			delete whichDepOnMe[depId];
		}
	};
})();


// 记录所有模块
var allModules = { };

// 任务管理器
var taskManager = (function() {
	var autoId = 0, queue = [ ];

	// 获取下一个任务模块的id
	function nextId() {
		autoId++;
		return '#' + autoId + '#';
	}

	// 执行左右就绪的任务
	function tryExecute() {
		var task;
		// 从最前面开始执行
		while (!!(task = queue[0])) {
			if (task.isReady()) {
				queue.shift();
				delete allModules[task.id()];
				task.execute();
			} else {
				break;
			}
		}
	}

	// 预加载任务
	var preloadTask = {
		init: function() {
			var t = this, scripts = config.preload.slice(), counter = 0, total = 0;

			function onLoad() {
				counter++;
				// 所有script已经就绪
				if (counter >= total) {
					delete t._scripts;
					tryExecute();
				}
			}

			for (var i = 0; i < scripts.length; i++) {
				if (scripts[i]) {
					total++;
					scriptLoader.load(idToURL(scripts[i]), onLoad);
				}
			}

			if (total) { t._scripts = scripts; }
		},

		id: function() { return '#preload#'; },

		isReady: function() { return this._scripts === undefined; },

		execute: function() { }
	};

	return {
		// 添加任务
		add: function(task) {
			if (!config.preload) { preloadTask = null; }
			if (preloadTask) {
				queue.push(preloadTask);
				preloadTask.init();
				// 设为null表示已经放入任务队列中
				preloadTask = null;
			}
			queue.push(task);
			task.setId(nextId());
		},

		// 尝试执行任务
		tryExecute: tryExecute
	};
})();


// 模块类（模块id，构造器，依赖的模块，模块所在目录）
function Module(id, factory, deps, dirname) {
	this._factory = factory;
	this._deps = deps;
	this._dirname = dirname;

	log('Module(constructor)', id || '');

	if (id) {
		this.setId(id);
	} else {
		Module.anonymous = this;
	}
}
// Module类静态方法
extend(Module, {
	// 请求模块
	require: function(id) {
		var module = allModules[id];
		if (module) {
			return module.exports();
		} else {
			throw new Error('module "' + id + '" does not exist');
		}
	},

	// 模块是否就绪
	isReady: function(id) {
		var module = allModules[id];
		return module && module.isReady();
	},

	// 加载模块
	load: function(id) {
		if (allModules[id]) { return; }

		log('Module.load', id);

		scriptLoader.load(id, function() {
			if (allModules[id]) { return; }

			if (!useInteractive && Module.anonymous) {
				Module.anonymous.setId(id);
			}

			if (!allModules[id]) {
				throw new Error('module "' + id + '" lost');
			}
		});
	},

	all: allModules
});
// Module类方法
extend(Module.prototype, {
	// 设置模块id
	setId: function(id) {
		var t = this;

		if (t._id) { throw new Error('module id cannot be changed'); }

		log('module.setId', id);

		t._id = id;

		if (Module.anonymous === t) { delete Module.anonymous; }

		if (allModules[id]) {
			return;
		} else {
			allModules[id] = t;
		}

		// 解析模块所在目录
		t._dirname = t._dirname || (t.isTask() ? '' : id.substr(0, id.lastIndexOf('/') + 1));

		var deps = t._deps;
		if (deps) {
			var readyStates = t._readyStates = { }, dep;
			for (var i = 0; i < deps.length; i++) {
				if (!deps[i]) { continue; }

				t._deps[i] = dep = idToURL(deps[i], t._dirname);

				// 模块不存在或尚未就绪
				if (!Module.isReady(dep)) {
					// 记录到依赖链
					dependentChain.add(id, dep);
					// 记录此模块尚未就绪
					readyStates[dep] = true;

					log('module(depNotReady)', 'id(' + id + '), dep(' + dep + ')');

					Module.load(dep);
				}
			}

			if (isEmptyObject(readyStates)) { delete t._readyStates; }
		}

		t._checkReady();
	},

	// 检查此模块是否就绪，如果是，则根据依赖链通知被依赖模块
	_checkReady: function() {
		var isReady = this.isReady(), id = this.id();

		log('module._checkReady', 'id(' + id + '), isReady(' + isReady + ')');

		if (isReady) {
			if (this.isTask()) {
				taskManager.tryExecute();
			} else {
				var moduleIds = dependentChain.get(id);
				if (moduleIds) {
					// 逐一通知被依赖模块
					for (var i = moduleIds.length - 1, module; i >= 0; i--) {
						module = allModules[moduleIds[i]];
						if (module) {
							module.notifyReady(id);
							log('module(notifyTo)', 'from(' + id + '), to(' + moduleIds[i] + ')');
						}
					}
					dependentChain.clear(id);
				}
			}
		}
	},

	// 获取模块id
	id: function() { return this._id; },

	// 获取此模块是否任务模块
	isTask: function() { return /^#\d+#$/.test(this._id); },

	// 获取模块是否就绪
	isReady: function() { return this._readyStates === undefined; },

	// 通知当前模块，其某个依赖模块已经就绪
	notifyReady: function(depId) {
		var readyStates = this._readyStates;
		if (readyStates) {
			delete readyStates[depId];
			if (isEmptyObject(readyStates)) {
				delete this._readyStates;
			}
		}

		this._checkReady();
	},

	// 执行任务回调
	execute: function() {
		log('module.execute', this.id());

		var deps = this._deps, modules = [ ];
		for (var i = deps.length - 1; i >= 0; i--) {
			modules[i] = allModules[deps[i]].exports();
		}

		if (this._factory) { this._factory.apply(window, modules); }
	},

	// 执行模块构造函数，并返回其提供的接口（module.exports）
	exports: function() {
		var t = this, module = t._executedModule;

		if (!module) {
			module = { id: t.id() };

			log('module.exports', module.id);

			if (typeof t._factory === 'function') {
				module.exports = { };
				var myRequire = function(id) {
					return Module.require(idToURL(id, t._dirname));
				};
				myRequire.async = function(ids, callback) {
					log('asyncRequire', 'require(' + ids + '), moduleId(' + t.id() + ')');
					taskManager.add(
						new Module(null, callback, unifyArray(ids), t._dirname)
					);
				};
				myRequire.resolve = function(id) { return idToURL(id, t._dirname); };

				var result = t._factory.call(window, myRequire, module.exports, module);

				// 如果构造器函数的执行结果的布尔值为true，则module.exports为该执行结果
				if (!!result) { module.exports = result; }
			} else {
				module.exports = t._factory;
			}

			t._executedModule = module;
		}

		return module.exports;
	}
});


/**
 * 调用模块
 * @method require
 * @global
 * @param {String|Array<String>} ids 模块id
 * @param {Function} [callback] 回调函数。各参数依次为调用模块的exports
 */
var require = global.require = function(ids, callback) {
	log('globalRequire', ids);

	taskManager.add(
		new Module(null, callback, unifyArray(ids))
	);
};

/**
 * 解析模块id为URL
 * @method require.resolve
 * @global
 * @param {String} id 模块id
 */
require.resolve = function(id) { return idToURL(id); };


/**
 * 声明模块
 * @method define
 * @global
 * @param {Function(require,exports,module)} factory 模块构造器
 */
global.define = function() {
	var id, deps, factory, args = arguments;

	// 重载
	switch (args.length) {
		case 1:
			factory = args[0];
			deps = parseDeps(factory.toString());
			break;

		case 2:
			deps = args[0];
			factory = args[1];
			break;

		case 3:
			id = idToURL(args[0]);
			deps = args[1];
			factory = args[2];
			break;
	}

	if (!id && useInteractive) {
		var script = scriptLoader.getCurrentScript();
		if (script) { id = script.src; }
	}

	log('globalDefine', id || '');

	new Module(id, factory, unifyArray(deps));
};

// 兼容AMD规范，没什么实质的作用
global.define.amd = { };


/**
 * 更改加载器配置
 * @method config
 * @static
 * @for bowljs
 * @param {Object} newConfig 新配置
 *   @param {String} [newConfig.libPath] 类库路径
 *   @param {String} [newConfig.appPath] 应用路径
 *   @param {String} [newConfig.basePath] 基础路径。如果此项不为空，则libPath和appPath均无效
 *   @param {Boolean} [newConfig.debug] 是否调试模式
 *   @param {Array} [newConfig.map] URL映射，多次配置会合并
 *   @param {String|Function} [newConfig.charset] 编码
 *   @param {Array} [newConfig.preload] 预加载脚本
 */
bowljs.config = function(newConfig) {
	// 处理路径配置（转成绝对路径，路径末尾加上/）
	var fixPath = function(path) {
		if (!isAbsPath(path)) { path = toAbsPath(path); }
		return ensureSuffix(path, '/');
	};

	if (newConfig.libPath) { config.libPath = fixPath(newConfig.libPath); }
	if (newConfig.appPath) { config.appPath = fixPath(newConfig.appPath); }
	if (newConfig.basePath) { config.basePath = fixPath(newConfig.basePath); }

	var search = global.location.search;
	// 指定调试模式，优先级：URL参数>配置参数>默认值
	if (/[?|&]debug(&|$)/.test(search)) {
		config.debug = true;
	} else if (/[?|&]nondebug(&|$)/.test(search)) {
		config.debug = false;
	} else if (newConfig.debug != null) {
		config.debug = !!newConfig.debug;
	}

	if (newConfig.map) { config.map = (config.map || [ ]).concat(newConfig.map); }

	config.charset = newConfig.charset;
	config.preload = newConfig.preload;
};


// 初始配置
bowljs.config({
	// 类库路径
	libPath: './',
	// 应用路径
	appPath: './',
	// 调试模式，构建时替换成false
	debug: true
});

log('bowljs(ready)', 'version(' + bowljs.version + ')');

})(window);