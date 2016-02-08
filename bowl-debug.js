/*!
 * Bowl.js
 * Javascript module loader for browser - v1.0.3 (2016-02-07T17:56:23+0800)
 * http://jraiser.org/ | Released under MIT license
 */
!function(global, undefined) { 'use strict';

// 防止重复初始化
if (global.bowljs) { return; }

var bowljs = global.bowljs = {
	version: '1.0.3',
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
		if ( obj.hasOwnProperty(p) ) { return false; }
	}
	return true;
}

// 扩展对象
function extend(target, src) {
	for (var p in src) {
		if ( src.hasOwnProperty(p) ) { target[p] = src[p]; }
	}
	return target;
}

// 移除前后空格
function trim(str) {
	return str == null ?
		'' :
		String(str).replace(/^\s+/, '').replace(/\s+$/, '');
}

// 判断是否数组
var isArray = Array.isArray || (function() {
	var toString = Object.prototype.toString;
	return function(val) {
		return toString.call(val) === '[object Array]';
	};
})();

// 统一为数组结构
function unifyArray(val) { return isArray(val) ? val : [val]; }


// 检查是否绝对路径
function isAbsPath(path) { return /^(?:[a-z]+:)?\/{2,}/i.test(path); }

// 转换为绝对路径
function toAbsPath(path) {
	// 旧IE下必须使用innerHTML注入a标签（不能只创建a元素），才能获得其绝对路径
	var div = doc.createElement('div');
	div.innerHTML = '<a href="' + path + '"></a>';
	path = div.firstChild.href;
	div = null;

	return path;
}

// 解析相对路径（ref必须以/结尾）
function resolvePath(path, ref) {
	if ( /^\//.test(path) ) {
		// 以“/”开头的路径，参考路径为应用路径
		ref = config.appPath;
		path = path.substr(1);
	} else if ( !/^\./.test(path) ) {
		// 非相对路径情况下，参考路径为类库路径
		ref = config.libPath;
	}

	return toAbsPath(ref + path);
}

// 把模块ID转换成URL
var idURLMapping = { };
function idToURL(id, ref) {
	var cacheKey = id = trim(id);

	// 缓存非相对路径id的解析结果
	var canBeCached = !/^\./.test(id);

	if (canBeCached && idURLMapping[cacheKey]) { return idURLMapping[cacheKey]; }

	// 临时记录URL中的锚点和参数
	var hash = '', qs = '';

	id = id
		// 请求JS资源的时候，锚点是没用的。可以用作id中的标记
		.replace(/#(.*)$/, function(match, $1) {
			if ( trim($1) ) { hash = match; }
			return '';
		})
		// 暂时移除参数，便于解析
		.replace(/\?(.*)$/, function(match, $1) {
			if ( trim($1) ) { qs = match; }
			return '';
		})
		// 解析 module@version 为 module/version/module
		.replace(/([^\\\/]+)@([^\\\/]+)/g, function(match, module, version) {
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
	var re_debug = /-debug$/;
	if ( hash !== '#nondebug' && config.debug && !re_debug.test(filename) ) {
		filename += '-debug';
	} else if ( !config.debug && re_debug.test(filename) ) {
		filename = filename.replace(re_debug, '');
	}
	id.push(filename + '.' + extname);

	var url = id.join('/') + qs;
	if ( !isAbsPath(url) ) { url = resolvePath(url, ref || ''); }

	// 地址映射
	var map = config.map;
	if (map) {
		for (var i = 0; i < map.length; i++) {
			if (typeof map[i] === 'function') {
				url = map[i](url);
			} else if ( isArray(map[i]) ) {
				url = url.replace(map[i][0], map[i][1]);
			}
		}
	}

	// 记录解析结果
	if (canBeCached) { idURLMapping[cacheKey] = url; }

	return url;
}

// 分析出依赖（require）的模块
function parseDeps(code) {
	var pattern = /(?:^|[^.$])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g,
		result = [ ],
		match;

	// 粗略移除代码中的注释
	code = code
		.replace(/^\s*\/\*[\s\S]*?\*\/\s*$/mg, '') 	// 多行注释
		.replace(/^\s*\/\/.*$/mg, '');				// 单行注释

	while ( match = pattern.exec(code) ) {
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

			log('scriptLoader', 'load: ' + src);
			log('scriptLoader', 'status: ' + currentStatus);

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

						log('scriptLoader', 'onload: ' + src);

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
			log('dependentChain', 'add');
			log('dependentChain', 'moduleId: ' + moduleId);
			log('dependentChain', 'depId: ' + depId);

			var which = whichDepOnMe[depId] = whichDepOnMe[depId] || [ ];
			which.push(moduleId);
		},

		// 获取依赖于指定模块的模块记录
		get: function(depId) { return whichDepOnMe[depId]; },

		// 清除依赖于某个模块的记录（当被依赖模块就绪时，即可清除）
		clear: function(depId) {
			log('dependentChain', 'remove');
			log('dependentChain', 'depId: ' + depId);

			delete whichDepOnMe[depId];
		}
	};
})();


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
		while (task = queue[0]) {
			if ( task.isReady() ) {
				queue.shift();
				delete Module.all[task.id()];
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
			for (var i = 0; i < scripts.length; i++) {
				if (scripts[i]) {
					total++;
					scriptLoader.load(idToURL(scripts[i]), function() {
						counter++;
						// 所有script已经就绪
						if (counter >= total) {
							log('taskManager', 'preload complete');

							delete t._scripts;
							tryExecute();
						}
					});
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
			task.setId( nextId() );
		},

		// 尝试执行任务
		tryExecute: tryExecute
	};
})();


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
		new Module( null, callback, unifyArray(ids) )
	);
};

/**
 * 解析模块id为URL
 * @method require.resolve
 * @global
 * @param {String} id 模块id
 */
require.resolve = function(id) { return idToURL(id); };


// 模块类（模块id，构造器，依赖的模块，模块所在目录）
function Module(id, factory, deps, dirname) {
	this._factory = factory;
	this._deps = deps;
	this._dirname = dirname;

	log( 'module', 'create: ' + (id || '') );

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
		var module = Module.all[id];
		if (module) {
			return module.exports();
		} else {
			throw new Error('module "' + id + '" does not exist');
		}
	},

	// 模块是否就绪
	isReady: function(id) {
		var module = Module.all[id];
		return module && module.isReady();
	},

	// 加载模块
	load: function(id) {
		if (Module.all[id]) { return; }

		log('Module', 'load: ' + id);

		scriptLoader.load(id, function() {
			if (Module.all[id]) { return; }

			if (!useInteractive && Module.anonymous) {
				Module.anonymous.setId(id);
			}

			if (!Module.all[id]) {
				throw new Error('module "' + id + '" lost');
			}
		});
	},

	// 记录所有模块
	all: { }
});
// Module类方法
extend(Module.prototype, {
	// 设置模块id
	setId: function(id) {
		var t = this;

		if (t._id) { throw new Error('module id cannot be changed'); }

		log('module', 'setId: ' + id);

		t._id = id;

		if (Module.anonymous === t) { delete Module.anonymous; }

		if (Module.all[id]) {
			return;
		} else {
			Module.all[id] = t;
		}

		// 解析模块所在目录
		t._dirname = t._dirname || ( t.isTask() ? '' : id.substr(0, id.lastIndexOf('/') + 1) );

		var deps = t._deps;
		if (deps) {
			var readyStates = t._readyStates = { }, dep;
			for (var i = 0; i < deps.length; i++) {
				if (!deps[i]) { continue; }

				t._deps[i] = dep = idToURL(deps[i], t._dirname);

				// 模块不存在或尚未就绪
				if ( !Module.isReady(dep) ) {
					// 记录到依赖链
					dependentChain.add(id, dep);
					// 记录此模块尚未就绪
					readyStates[dep] = true;

					log('module', 'notReady: ' + dep);

					Module.load(dep);
				}
			}

			if ( isEmptyObject(readyStates) ) { delete t._readyStates; }
		}

		t._checkReady();
	},

	// 检查此模块是否就绪，如果是，则根据依赖链通知被依赖模块
	_checkReady: function() {
		var isReady = this.isReady(), id = this.id();

		log('module', 'id: ' + id);
		log('module', 'checkReady: ' + isReady);

		if (isReady) {
			if ( this.isTask() ) {
				taskManager.tryExecute();
			} else {
				var moduleIds = dependentChain.get(id);
				if (moduleIds) {
					// 逐一通知被依赖模块
					for (var i = moduleIds.length - 1, module; i >= 0; i--) {
						module = Module.all[ moduleIds[i] ];
						if (module) {
							module.notifyReady(id);
							log('module', 'notifyTo: ' + moduleIds[i]);
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
			if ( isEmptyObject(readyStates) ) {
				delete this._readyStates;
			}
		}

		this._checkReady();
	},

	// 执行任务回调
	execute: function() {
		log('module', 'execute: ' + this.id());

		var deps = this._deps, modules = [ ];
		for (var i = deps.length - 1; i >= 0; i--) {
			modules[i] = Module.all[ deps[i] ].exports();
		}

		if (this._factory) { this._factory.apply(window, modules); }
	},

	// 执行模块构造函数，并返回其提供的接口（module.exports）
	exports: function() {
		var t = this, module = t._executedModule;

		if (!module) {
			module = { id: t.id() };

			log('module', 'export: ' + module.id);

			if (typeof t._factory === 'function') {
				module.exports = { };
				var myRequire = function(id) {
					return Module.require( idToURL(id, t._dirname) );
				};
				myRequire.async = function(ids, callback) {
					log('asyncRequire', ids);
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
			deps = parseDeps( factory.toString() );
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

	new Module( id, factory, unifyArray(deps) );
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
 *   @param {String|Function} [newConfig.charset] 编码
 *   @param {Array} [newConfig.preload] 预加载脚本
 *   @param {Array} [newConfig.map] URL映射，多次配置会合并
 *   @param {Boolean} [newConfig.debug] 是否调试模式
 */
bowljs.config = function(newConfig) {
	// 修复路径配置
	var fixPath = function(path) {
		if ( !isAbsPath(path) ) { path = toAbsPath(path); }
		if ( path.charAt(path.length - 1) !== '/' ) { path += '/'; }
		return path;
	};

	var map = config.map;
	extend(config, newConfig);

	if (map && config.map !== map) { config.map = map.concat(config.map); }
	if (newConfig.libPath) { config.libPath = fixPath(config.libPath); }
	if (newConfig.appPath) { config.appPath = fixPath(config.appPath); }
};

// 初始配置
bowljs.config({
	// 类库路径
	libPath: './',
	// 应用路径
	appPath: './',
	// debug参数启用调试模式；nondebug参数禁用调试模式
	debug: (function() {
		var isDebug = true, search = global.location.search;
		if ( /[?|&]debug(&|$)/.test(search) ) {
			isDebug = true;
		} else if ( /[?|&]nondebug(&|$)/.test(search) ) {
			isDebug = false;
		}
		return isDebug;
	})()
});


// 加载data-main属性指定的js
!function() {
	var scripts = doc.getElementsByTagName('script'), dataMain;
	for (var i = 0; i < scripts.length; i++) {
		dataMain = scripts[i].getAttribute('data-main');
		if ( dataMain && /bowl|jraiser/i.test(scripts[i].src) ) {
			require(dataMain);
			break;
		}
	}
}();

}(window);