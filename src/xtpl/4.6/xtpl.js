/**
 * XTemplate模板引擎
 * @module xtpl@4.6
 * @category Utility
 */

var base = require('../../base/1.2/base');
var XTemplate = require('./xtemplate/index');
var Promise = require('../../promise/1.2/promise');


/**
 * XTemplate模板包装类。
 * @class XTpl
 * @constructor
 * @param {Object} options 选项。
 *   @param {Function:Promise} options.loadTpl 加载模板的函数。
 *   @param {Object} [options.commands] 模板指令。
 */
var XTpl = base.createClass(function(options) {
	var t = this;
	t._loadTpl = options.loadTpl;
	t._commands = base.extend({ }, options.commands);
	t._fnCache = { };
	t._instanceCache = { };

	// 用于加载extend、parse、include指令的模板
	t._loader = {
		load: function(tpl, callback) {
			t._getTplFn(tpl.root, tpl.name).then(function(fn) {
				callback(null, fn);
			});
		}
	};
}, {
	_getInstance: function(tplPath) {
		var loadTpl = this._loadTpl;
		var commands = this._commands;
		var instanceCache = this._instanceCache;
		var loader = this._loader;

		return new Promise(function(resolve) {
			if (instanceCache[tplPath]) {
				resolve(instanceCache[tplPath]);
			} else {
				loadTpl(tplPath).then(function(tpl) {
					instanceCache[tplPath] = new XTemplate(tpl, {
						name: tplPath,
						loader: loader,
						commands: commands
					});
					resolve(instanceCache[tplPath]);
				});
			}
		});
	},

	_getTplFn: function(root, tplPath) {
		var fnCache = this._fnCache;
		var loadTpl = this._loadTpl;

		return new Promise(function(resolve) {
			if (fnCache[tplPath]) {
				resolve(fnCache[tplPath]);
			} else {
				loadTpl(tplPath).then(function(tpl) {
					var fn = root.compile(tpl, tplPath);
					fnCache[tplPath] = fn;
					resolve(fn);
				});
			}
		});
	},

	/**
	 * 渲染模板。
	 * @method render
	 * @for XTpl
	 * @param {String} tplPath 模板路径。
	 * @param {Object} data 数据。
	 * @return {Promise} 渲染模板的promise。
	 */
	render: function(tplPath, data) {
		return this._getInstance(tplPath).then(function(instance) {
			return new Promise(function(resolve, reject) {
				instance.render(data, function(err, res) {
					if (err) {
						reject(err);
					} else {
						resolve(res);
					}
				});
			});
		});
	}
});

/**
 * 加载script节点中的模板（只有type为text/xtemplate的会被加载，节点的data-key属性为模板的key）。
 * @method fromScripts
 * @for XTpl
 * @static
 * @param {Element|NodeList} [context] 上下文元素，默认为document。
 * @return {Object} 模板集合。
 */
XTpl.fromScripts = function(context) {
	// 兼容NodeList类型（取第一个元素）
	if (context && !('nodeType' in context) && typeof context.get === 'function') {
		context = context.get(0);
	}
	// 默认为document
	if (!context || context.nodeType !== 1) { context = document; }

	var result = { };
	var scripts = context.getElementsByTagName('script');
	for (var i = 0, len = scripts.length; i < len; i++) {
		if (scripts[i].type === 'text/xtemplate') {
			result[scripts[i].getAttribute('data-key') || ''] = scripts[i].innerHTML.trim();
		}
	}

	return result;
};


module.exports = XTpl;