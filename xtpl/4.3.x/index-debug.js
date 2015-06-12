/*!
 * JRaiser 2 Javascript Library
 * xtemplate wrapper - v4.3.0 (2015-06-12T14:34:42+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * XTemplate模板引擎包装器
 * @module xtpl/4.3.x/
 * @category Infrastructure
 */

var base = require('base/1.1.x/'),
	XTemplate = require('./xtemplate');


/**
 * XTemplate模板引擎包装类，语法见 https://github.com/xtemplate/xtemplate/blob/master/docs/syntax-cn.md
 * @class XTpl
 * @constructor
 * @exports
 * @param {Object} [templates] 模板
 * @param {Object} [config] 其他配置
 *   @param {Object} [config.commands] 命令定义
 */
var XTpl = base.createClass(function(templates, config) {
	var t = this;

	t._tplCache = { };
	t._instanceCache = { };
	t._fnCache = { };
	t._config = config;

	t._loader = {
		load: function(tplWrap, callback) {
			var key = tplWrap.name, fn = t._fnCache[key];
			if (!fn) {
				try {
					fn = tplWrap.root.compile(t._findTpl(key), key)
				} catch (e) {
					return callback(e);
				}
				t._fnCache[key] = fn;
			}

			callback(null, fn);
		}
	};

	t.add(templates);
}, {
	/**
	 * 增加模板
	 * @method add
	 * @for XTpl
	 * @param {String} key 模板名
	 * @param {String} tpl 模板字符串
	 */
	/**
	 * 增加模板
	 * @method add
	 * @for XTpl
	 * @param {Object} tpls 模板
	 */
	add: function(key, tpl) {
		var tplCache = this._tplCache;
		
		// 重载
		switch (typeof key) {
			case 'string':
				tplCache[key] = tpl;
				break;

			case 'object':
				base.extend(tplCache, key);
				break;
		}
	},

	/**
	 * 是否存在指定模板
	 * @method has
	 * @for XTpl
	 * @param {String} key 模板名
	 * @return {Boolean} 是否存在指定模板
	 */
	has: function(key) { return this._tplCache.hasOwnProperty(key); },

	/**
	 * 寻找模板（如果找不到，则抛出异常）
	 * @method _findTpl
	 * @for XTpl
	 * @param {String} key 模板名
	 * @return {String} 模板
	 */
	_findTpl: function(key) {
		var tpl = this._tplCache[key];
		if (tpl == null) {
			throw new Error('template "' + key + '" does not exist');
		}
		return tpl;
	},

	/**
	 * 渲染模板
	 * @method render
	 * @for XTpl
	 * @param {String} key 模板名
	 * @param {Object} [data] 数据
	 * @param {Boolean} [retained=true] 是否保留模板
	 * @return {String} 渲染结果
	 */
	render: function(key, data, retained) {
		var t = this, instance = t._instanceCache[key];
		if (!instance) {
			instance = new XTemplate(t._findTpl(key), {
				name: key,
				loader: t._loader
			});

			t._instanceCache[key] = instance;
		}

		if (retained === false) { t.clear(key); }

		return instance.render(data, t._config);
	},

	/**
	 * 清理模板
	 * @method clear
	 * @for XTpl
	 * @param {String} key 模板名。如果为空，则清理所有模板
	 */
	clear: function(key) {
		var t = this;
		if (key) {
			delete t._tplCache[key];
			delete t._instanceCache[key];
			delete t._fnCache[key];
		} else {
			t._tplCache = { };
			t._instanceCache = { };
			t._fnCache = { };
		}
	}
});


var defaultTpl;
/**
 * 使用默认设定渲染模板
 * @method render
 * @for XTpl
 * @static
 * @param {String} tpl 模版
 * @param {Object} data 数据
 * @param {Boolean} [cached=true] 是否缓存模版
 * @return {String} 渲染结果
 */
XTpl.render = function(tpl, data, cached) {
	var key = base.randomStr('xtpl_');
	defaultTpl = defaultTpl || new XTpl();
	if ( !defaultTpl.has(tpl) ) { defaultTpl.add(key, tpl); }
	return defaultTpl.render(key, data, cached);
};

/**
 * 加载script节点中的模板（只有type为text/template的会被加载）
 * @method fromScripts
 * @for XTpl
 * @static
 * @param {Element|NodeList} [context] 上下文元素，默认为document
 * @return {Object} 模板集合
 */
XTpl.fromScripts = function(context) {
	// 兼容NodeList类型（取第一个元素）
	if (context && !('nodeType' in context) && typeof context.get === 'function') {
		context = context.get(0);
	}
	// 默认为document
	if (!context || context.nodeType !== 1) { context = document; }

	var scripts = context.getElementsByTagName('script'), result = { };
	for (var i = 0, len = scripts.length; i < len; i++) {
		if (scripts[i].type === 'text/template') {
			result[scripts[i].getAttribute('data-key') || ''] = scripts[i].innerHTML.trim();
		}
	}

	return result;
};


return XTpl;

});