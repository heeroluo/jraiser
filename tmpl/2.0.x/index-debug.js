/*!
 * JRaiser 2 Javascript Library
 * micro-templating - v2.0.2 (2014-06-10T09:29:50+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 微型模版解析器
 * @module tmpl/2.0.x/
 * @category Utility
 */

var base = require('base/1.0.x/');

// HTML编码
var re_entity = [ ], entityMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#x27;',
	'/': '&#x2F;'
};
for (var key in entityMap) { re_entity.push(key); }
var re_entity = new RegExp('[' + re_entity.join('') + ']', 'g');
function escape(content) {
	return String(content).replace(re_entity, function(match) {
		return entityMap[match];
	});
}

// 模版设定
var settingsCache = { };
function createSettings(delimiters) {
	if (!delimiters) { return settingsCache['default']; }

	var key = delimiters.join('|');
	if (!settingsCache[key]) {
		var settings = {
			delimiter_begin: delimiters[0],
			delimiter_end: delimiters[1]
		};
		settings.re_evaluate = new RegExp("((^|" + delimiters[1] + ")[^\\t]*)'", 'g');
		settings.re_value = new RegExp('\\t-(.*?)' + delimiters[1], 'g');
		settings.re_escaped_value = new RegExp('\\t=(.*?)' + delimiters[1], 'g');

		settingsCache[key] = settings;
	}

	return settingsCache[key];
}
// 默认设定
settingsCache['default'] = createSettings(['<%', '%>']);

// 字符串模板“编译”为函数模板
function compile(str, settings) {
	return new Function("obj", "escape",
		"var __p__=[],print=function(){__p__.push.apply(__p__,arguments);};" +
		"with(obj){__p__.push('" +
		str
			.replace(/[\r\t\n]/g, " ")
			.split(settings.delimiter_begin).join("\t")
			.replace(settings.re_evaluate, "$1\r")
			.replace(settings.re_value, "',$1,'")
			.replace(settings.re_escaped_value, "',escape($1),'")
			.split("\t").join("');")
			.split(settings.delimiter_end).join("__p__.push('")
			.split("\r").join("\\'")
		+ "');}return __p__.join('');"
	);
}

// 渲染模板
var globalCache = { };
function render(tpl, data, cached) {
	if (null == tpl || null == data) { return tpl; }

	var fn = globalCache[tpl];
	if (!fn) {
		fn = compile( tpl, createSettings() );
		if (cached !== false) { globalCache[tpl] = fn; }
	}

	return fn(data, escape);
}

/**
 * 微型模板类
 * @class Tmpl
 * @constructor
 * @exports
 * @param {Object} [templates] 模板
 * @param {Object} [settings] 相关设置
 *   @param {Array} [settings.delimiters] 逻辑界定符，默认为['<%','%>']
 */
var Tmpl = base.createClass(function(templates, settings) {
	this._templates = { };
	this._settings = createSettings(settings ? settings.delimiters : null);
	this.add(templates);
}, {
	/**
	 * 增加模板
	 * @method add
	 * @for Tmpl
	 * @param {String} key 模板名
	 * @param {String} tpl 模板字符串
	 */
	/**
	 * 增加模板
	 * @method add
	 * @for Tmpl
	 * @param {Object} tpls 模板
	 */
	add: function(key, tpl) {
		// 重载
		switch (typeof key) {
			case 'string':
				this._templates[key] = tpl;
				break;

			case 'object':
				base.extend(this._templates, key);
				break;
		}
	},

	/**
	 * 渲染模板
	 * @method render
	 * @for Tmpl
	 * @param {String} key 模板名
	 * @param {Object} [data] 数据
	 * @param {Boolean} [retained=true] 是否保留模板
	 * @return {String} 渲染结果
	 */
	render: function(key, data, retained) {
		var tpl = this._templates[key];
		if (tpl == null) {
			throw new Error('template<' + key + '> does not exist');
		}

		if (typeof tpl === 'string') {
			if (data == null) { return tpl; }
			tpl = this._templates[key] = compile(tpl, this._settings);
		}
		if (retained === false) { this.clear(key); }

		return tpl(data == null ? { } : data, escape);
	},

	/**
	 * 清理模板
	 * @method clear
	 * @for Tmpl
	 * @param {String} key 模板名。如果为空，则清理所有模板
	 */
	clear: function(key) {
		if (key) {
			delete this._templates[key];
		} else {
			this._templates = { };
		}
	}
});

/**
 * 使用默认设定渲染模板
 * @method render
 * @for Tmpl
 * @static
 * @param {String} tpl 模版
 * @param {Object} data 数据
 * @param {Boolean} [cached=true] 是否缓存模版
 * @return {String} 渲染结果
 */
Tmpl.render = render;
/**
 * 把字符串中的HTML特殊字符编码为HTML实体
 * @method escape
 * @for Tmpl
 * @static
 * @param {String} content 要编码的内容
 * @return {String} 编码结果
 */
Tmpl.escape = escape;


return Tmpl;

});