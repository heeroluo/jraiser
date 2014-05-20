/*!
 * JRaiser 2 Javascript Library
 * module loader - v1.0.5 (2014-05-20T14:07:02+0800)
 * http://jraiser.org/ | Released under MIT license
 */
!function(window, undefined) { 'use strict';

/**
 * 模块加载器
 * @module jraiser2
 * @category Loader
 */

/**
 * jraiser对象
 * @class jraiser
 * @static
 * @global
 */
var jr = window.jraiser = { };

// 配置
var config = { };

var isOpera = window.opera != null && window.opera.toString() === '[object Opera]',
	useInteractive = window.attachEvent && !isOpera,
	document = window.document;


// 去掉代码中的注释
// from http://lifesinger.github.com/lab/2011/remove-comments-safely/
function removeComments(code) {
	return code
		.replace(/^\s*\/\*[\s\S]*?\*\/\s*$/mg, '') 	// block comments
		.replace(/^\s*\/\/.*$/mg, '');				// line comments
}

// 根据字面值去重复
function literalUnique(arr) {
	var ret = [ ], values = { }, elt;
	for (var i = 0; i < arr.length; i++) {
		elt = arr[i];
		if (!values[elt]) {
			values[elt] = true;
			ret.push(elt);
		}
	}

	return ret;
}

// 分析出依赖的元素 from seajs
function parseDeps(code) {
	var pattern = /(?:^|[^.$])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g;
	var ret = [ ], match;

	code = removeComments(code);
	while ( match = pattern.exec(code) ) {
		if (match[2]) { ret.push(match[2]); }
	}

	return literalUnique(ret);
}

// 检测是否空对象
function isEmptyObject(obj) {
	for (var p in obj) { return false; }
	return true;
}

// 扩展对象
function extend(target) {
	var i = 0, len = arguments.length, p, src;
	while (++i < len) {
		src = arguments[i];
		if (src != null) {
			for (p in src) { target[p] = src[p]; }
		}
	}

	return target;
}


// 检测是否绝对路径
function isAbsPath(path) { return /^(?:[a-z]+):\/+/i.test(path); }
// 替换多余的斜杠
function trimSlashes(path) { return path.replace(/([^:])\/{2,}/g, '$1/'); }
// 移除URL中的参数和锚点
function trimURL(path, extra) {
	var temp = path.indexOf('?');
	// 移除参数
	if (temp !== -1) {
		if (extra) { extra.search = path.substr(temp + 1); }
		path = path.substr(0, temp);
	}

	temp = path.indexOf('#');
	// 移除锚点
	if (temp !== -1) {
		if (extra) { extra.hash = path.substr(temp + 1); }
		path = path.substr(0, temp);
	}

	return path;
}
// 转换路径
function transferPath(rel, ref) {
	if ( /^\/+/.test(rel) ) {
		// 以“/”开头的路径，参考路径为应用路径
		ref = config.appPath;
		rel = rel.substr(1);
	} else if ( !/^\./.test(rel) ) {
		// 非相对路径情况下，参考路径为类库路径
		ref = config.libPath;
	}

	rel = rel.split('/');
	var result = ref.split('/');

	for (var i = 0; i < rel.length; i++) {
		if (rel[i] === '..') {
			if (!result[result.length - 2] === '') { result.pop(); }
		} else if (rel[i] != '.') {
			result.push(rel[i]);
		}
	}

	return result.join('/');
}
// 把ID转换成URL（ref必须以“/”结尾）
function idToURL(id, ref, nomap) {
	var ts = { }, id = trimURL(id, ts).split('/');
	
	// 如果没有指定文件，则加载目录下的index.js
	var filename = id.pop() || 'index';

	// 解析出文件名和扩展名
	var temp = filename.lastIndexOf('.');
	var basename, extname;
	if (temp === -1) {
		basename = filename;
	} else {
		basename = filename.substr(0, temp);
		extname = filename.substr(temp + 1);
	}
	extname = extname || 'js';

	// 处理调试后缀
	var re_debug = /-debug$/;
	if ( config.debug && !re_debug.test(basename) ) {
		basename += '-debug';
	} else if ( !config.debug && re_debug.test(basename) ) {
		basename = basename.replace(re_debug, '');
	}

	id.push(basename + '.' + extname);
	var url = id.join('/');
	if ( !isAbsPath(url) ) { url = transferPath(url, ref || config.appPath); }

	if (ts.search) { url += '?' + ts.search; }

	if (!nomap) {
		// 地址映射
		var map = config.map;
		if (map) {
			for (var i = 0; i < map.length; i++) {
				url = url.replace(map[i][0], map[i][1]);
			}
		}
	}

	return url;
}


// IE10同时支持两种事件，但是当JS有缓存的时候，会先触发onreadystatechange再执行JS程序
var scriptOnloadEvent = 'onload' in document.createElement('script') ?
	'onload' : 'onreadystatechange';

// 脚本读取器
var scriptLoader = {
	// script的父节点
	_scriptParent: document.getElementsByTagName('head')[0],
	
	// 标注加载中（1）或已加载（2）的url
	_loaded: { },
	
	// 获取当前运行的脚本所在的script标签
	getExecutingScript: function() {
		if (this._currentlyAddingScript) {
			return this._currentlyAddingScript;
		}

		var executingScript = this._executingScript;
		if (executingScript && executingScript.readyState === 'interactive') {
			return executingScript;
		}

		var scripts = this._scriptParent.getElementsByTagName('script'), script;
		for (var i = 0; i < scripts.length; i++) {
			script = scripts[i];
			if (script.readyState === 'interactive') {
				return (this._executingScript = script);
			}
		}
	},

	// 加载script文件
	load: function(src, onload, attrs) {
		var self = this, state = self._loaded[src];

		if (state) {
			// state为1时表示此文件加载中，无须二次加载
			// state为2时表示文件加载完成，直接执行回调
			if (state === 2 && onload) { onload(script); }
		} else {
			var script = document.createElement('script');
			script.src = src;
			self._loaded[src] = 1;
			if (config.charset) { script.charset = config.charset; }
			script.async = 'async';
			if (attrs) {
				// 设置附加属性
				for (var key in attrs) {
					script.setAttribute(key, attrs[key]);
				}
			}
			script[scriptOnloadEvent] = script.onerror = function() {			
				if (!script.readyState ||
					'loaded' === script.readyState || 'complete' === script.readyState
				) {
					self._loaded[src] = 2;
					self._executingScript = null;
				
					script[scriptOnloadEvent] = script.onerror = null;
					onload && onload(script);
					script.parentNode.removeChild(script);
					script = null;
				}
			};

			this._currentlyAddingScript = script;
			self._scriptParent.insertBefore(script, self._scriptParent.firstChild);
			this._currentlyAddingScript = null;
		}
	}
};


// 模块依赖链
var dependentChain = {
	// 依赖链存储空间
	_chain: { },

	// 添加依赖记录
	add: function(moduleId, depId) {
		var chain = this._chain[depId] = this._chain[depId] || [ ];
		chain.push(moduleId);
	},

	// 获取依赖于指定模块的模块记录
	get: function(depId) { return this._chain[depId]; },

	// 清除依赖于某个模块的模块记录（当被依赖模块就绪时，即可清除）
	clear: function(depId) { delete this._chain[depId]; }
};


// 记录无需加载依赖的模块
var withoutDeps = { };


// 模块类（模块id，构造函数，依赖的模块）
function Module(id, factory, deps) {
	this._factory = factory;
	this._deps = deps;

	if (id) {
		this.setId(id);
	} else {
		Module.anonymous = this;
	}
}
// Module类方法
extend(Module.prototype, {
	// 设置模块id（如果模块id已存在，则抛出异常）
	setId: function(id) {
		var t = this;

		if (t._id) { throw new Error('module id cannot be changed'); }

		t._id = id;
		if ( !t.isTask() ) { id = trimURL(id); }

		Module.all[id] = Module.all[id] || t;

		if (Module.anonymous === t) { delete Module.anonymous; }

		var temp;
		// 解析模块所在路径
		if ( t.isTask() ) {
			t._dirname = '';
		} else {
			temp = id.lastIndexOf('/');
			t._dirname = temp === id.length - 1 ? id : id.substr( 0, id.lastIndexOf('/') );
		}

		var deps = t._deps;
		if (deps) {
			// 编译器把所有依赖都提到顶层后，会在末尾添加一个null的依赖项进行标识
			var hasExtractedAllDeps;
			if (deps[deps.length - 1] === null) {
				hasExtractedAllDeps = true;
				deps.length -= 1;
			}

			var readyStates = t._readyStates = { }, dep;
			for (var i = 0; i < deps.length; i++) {
				deps[i] = idToURL(deps[i], t._dirname);
				temp = deps[i];		// 保存一份未去参数的版本用于加载
				deps[i] = trimURL(temp);

				dep = Module.all[ deps[i] ];
				// 模块不存在，需要加载
				if ( !dep || !dep.isReady() ) {
					// 记录到依赖链
					dependentChain.add(id, deps[i]);
					// 记录此模块尚未就绪
					readyStates[ deps[i] ] = temp;

					if (hasExtractedAllDeps) { withoutDeps[ deps[i] ] = true; }
				}
			}

			if ( isEmptyObject(readyStates) ) {
				delete t._readyStates;
			} else {
				if (!withoutDeps[t._id]) {
					for (dep in readyStates) {
						Module.load(readyStates[dep]);
					}
				}
			}
		}

		t._checkReady();
	},

	// 检查此模块是否就绪，如果是，则根据依赖链通知被依赖模块
	_checkReady: function() {
		if ( this.isReady() ) {
			if ( this.isTask() ) {
				taskManager.tryExecute();
			} else {
				var moduleIds = dependentChain.get(this._id);
				if (moduleIds) {
					// 逐一通知被依赖模块
					for (var i = moduleIds.length - 1, module; i >= 0; i--) {
						module = Module.all[ moduleIds[i] ];
						if (module) {
							module.notifyReady(this._id);
						}
					}

					dependentChain.clear(this._id);
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
		var deps = this._deps, modules = [ ];
		for (var i = deps.length - 1; i >= 0; i--) {
			modules[i] = Module.all[ deps[i] ].exports();
		}

		if (this._factory) { this._factory.apply(window, modules); }
	},

	// 执行模块构造函数，并返回其提供的接口（module.exports）
	exports: function() {
		var self = this, module = self._executedModule;
		if (module) { return module.exports; }

		module = { id: self._id };

		if (typeof self._factory === 'function') {
			module.exports = { };
			var _require = function(id) {
				return Module.require(id, self._dirname);
			};
			_require.async = function(ids, callback) {
				if (typeof ids === 'string') { ids = [ids]; }
				for (var i = ids.length - 1; i >= 0; i--) {
					ids[i] = idToURL(ids[i], self._dirname, true);
				}
				require(ids, callback);
			};
			_require.resolve = function(id) {
				return idToURL(id, self._dirname);
			};
			var result = self._factory.call(window, _require, module.exports, module);

			// 如果工厂函数的执行结果的布尔值为true，则module.exports为该执行结果
			if (!!result) { module.exports = result; }
		} else {
			module.exports = self._factory;
		}

		self._executedModule = module;

		return module.exports;
	}
});
// Module类静态方法
extend(Module, {
	// 请求模块
	require: function(id, ref) {
		id = idToURL(id, ref);
		var module = Module.all[trimURL(id)];
		if (module) {
			return module.exports();
		} else {
			throw new Error('module ' + id + ' is not loaded');
		}
	},

	// 加载模块
	load: function(url) {
		var id = trimURL(url);
		if (Module.all[id]) { return; }

		scriptLoader.load(url, function(node) {
			if (Module.all[id]) { return; }

			if (!useInteractive && Module.anonymous) {
				Module.anonymous.setId(id);
			}

			if (!Module.all[id]) {
				throw new Error('module ' + id + ' does not exist');
			}
		}, {
			'data-dependent': 'true'
		});
	},

	// 记录所有模块的map
	all: { }
});


// 任务管理器
var taskManager = {
	// 自动编号（队列长度会变，不能根据任务位置生成唯一的id）
	_autoId: 0,

	// 任务队列
	_queue: [ ],

	// 添加任务
	add: function(task) {
		this._queue.push(task);
		task.setId( this._nextId() );
	},

	// 尝试执行任务
	tryExecute: function() {
		var task;
		while (task = this._queue[0]) {
			if ( task.isReady() ) {
				this._queue.shift();
				delete Module.all[task.id()];
				task.execute();
			} else {
				break;
			}
		}
	},

	// 获取下一个任务模块的id
	_nextId: function() {
		this._autoId++;
		return '#' + this._autoId + '#';
	}
};


/**
 * 声明模块（加载器自行分析依赖模块）
 * @method define
 * @global
 * @param {Function(require,exports,module)} factory 模块构造器
 * @return {Function} 执行本模块的函数
 */
window.define = function() {
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
			id = trimURL( idToURL(args[0]) );
			deps = args[1];
			factory = args[2];
			break;
	}

	if (!id && useInteractive) {
		var script = scriptLoader.getExecutingScript();
		if ( script && script.getAttribute('data-dependent') ) {
			id = trimURL(script.src);
		}
	}
	if (typeof deps === 'string') { deps = [deps]; }

	new Module(id, factory, deps);
};

/**
 * 当前所有模块的缓存
 * @property cache
 * @type Object<String,Object>
 * @static
 * @for jraiser
 */
jr.cache = Module.all;


/**
 * 调用模块
 * @method require
 * @global
 * @param {String|Array<String>} ids 模块id
 * @param {Function} [callback] 回调函数。各参数依次为调用的模块所提供的接口
 */
var require = window.require = function(ids, callback) {
	if (typeof ids === 'string') { ids = [ids]; }
	taskManager.add( new Module(null, callback, ids) );
};
/**
 * 解析模块id为URL
 * @method require.resolve
 * @global
 * @param {String} id 模块id
 */
require.resolve = function(id) { return idToURL(id); };


// 转换为绝对路径
function toAbsPath(path) {
	// 旧版本IE下必须使用innerHTML注入a标签，才能获得其绝对路径
	// 而不能只创建一个a元素，设置其href属性后获取
	var div = document.createElement('div');
	div.innerHTML = '<a href="' + path + '"></a>';
	path = div.firstChild.href;
	div = null;

	return path;
}
// 修复路径配置
function fixPathCfg(path) {
	if ( !isAbsPath(path) ) { path = toAbsPath(path); }
	path = path.replace(/\/+$/, '');

	return path;
}

/**
 * 更改加载器配置
 * @method config
 * @static
 * @for jraiser
 * @param {Object} newConfig 新配置
 *   @param {String} [newConfig.libPath] 类库路径
 *   @param {String} [newConfig.appPath] 应用路径
 *   @param {Boolean} [newConfig.debug] 是否调试模式
 *   @param {Array} [newConfig.map] URL映射
 *   @param {String} [newConfig.charset] 编码
 */
jr.config = function(newConfig) {
	for (var c in newConfig) {
		config[c] = newConfig[c];
	}
	if ( newConfig.hasOwnProperty('libPath') ) {
		config.libPath = fixPathCfg(config.libPath);
	}
	if ( newConfig.hasOwnProperty('appPath') ) {
		config.appPath = fixPathCfg(config.appPath);
	}
};


// 初始配置
jr.config({
	// 类库路径
	libPath: './',
	// 基路径
	appPath: './',
	// URL参数中带有debug参数即进入调试模式
	debug: (function() {
		var isDebug = true, search = window.location.search;
		if ( /[?|&]debug(&|$)/.test(search) ) {
			isDebug = true;
		} else if ( /[?|&]nondebug(&|$)/.test(search) ) {
			isDebug = false;
		}
		return isDebug;
	})()
});


// 加载data-main属性指定的js
var scripts = document.getElementsByTagName('script'), mainJs;
for (var s = scripts.length - 1; s >= 0; s--) {
	if ( /jraiser/i.test(scripts[s].src) ) {
		mainJs = scripts[s].getAttribute('data-main');
		if (mainJs) {
			require(mainJs);
			break;
		}
	}
}
scripts = null;

}(window);