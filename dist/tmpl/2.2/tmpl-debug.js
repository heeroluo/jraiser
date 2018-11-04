define(function(require, exports, module) {
'use strict'; 

/**
 * 微型模版引擎
 * @module tmpl@2.2
 * @category Utility
 */

var base = require('../../base/1.2/base');


// HTML特殊字符及其对应的编码内容
var reEntity = [];
var entityMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#x27;'
};
for (var key in entityMap) {
	reEntity.push(key);
}
reEntity = new RegExp('[' + reEntity.join('') + ']', 'g');
// HTML编码函数
function escape(content) {
	return String(content).replace(reEntity, function(match) {
		return entityMap[match];
	});
}


// 模版分隔符设定
var settingsCache = { };
function createSettings(delimiters) {
	if (!delimiters) { return settingsCache['default']; }

	var key = delimiters.join('|');
	if (!settingsCache[key]) {
		var settings = {
			delimiterBegin: delimiters[0],
			delimiterEnd: delimiters[1]
		};
		settings.reEvaluate = new RegExp('((^|' + delimiters[1] + ")[^\\t]*)'", 'g');
		settings.reValue = new RegExp('\\t-(.*?)' + delimiters[1], 'g');
		settings.reEscapedValue = new RegExp('\\t=(.*?)' + delimiters[1], 'g');

		settingsCache[key] = settings;
	}

	return settingsCache[key];
}
// 默认设定
settingsCache['default'] = createSettings(['<%', '%>']);


// 字符串模板“编译”为函数体
function compile(str, settings) {
	return "var __result__='';" +
		"__result__+='" +
		str.replace(/[\r\t\n]/g, ' ')
			.split(settings.delimiterBegin)
			.join('\t')
			.replace(settings.reEvaluate, '$1\r')
			.replace(settings.reValue, "'+$1+'")
			.replace(settings.reEscapedValue, "'+__escape__($1)+'")
			.split('\t')
			.join("';")
			.split(settings.delimiterEnd)
			.join("__result__+='")
			.split('\r')
			.join("\\'") +
		"';return __result__";
}


/**
 * 微型模板类。
 * @class Tmpl
 * @constructor
 * @exports
 * @param {Object<key,value>} [templates] 预置模板。
 * @param {Object} [settings] 相关设置。
 *   @param {Array} [settings.delimiters] 逻辑界定符，默认为['<%','%>']。
 */
var Tmpl = base.createClass(function(templates, settings) {
	this._templates = { };
	this._settings = createSettings(settings ? settings.delimiters : null);
	this.add(templates);
}, {
	/**
	 * 增加模板。
	 * @method add
	 * @for Tmpl
	 * @param {String} key 模板名。
	 * @param {String} tpl 模板字符串。
	 */
	/**
	 * 增加模板。
	 * @method add
	 * @for Tmpl
	 * @param {Object} tpls 模板。
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
	 * 是否存在指定模板。
	 * @method has
	 * @for Tmpl
	 * @param {String} key 模板名。
	 * @return {Boolean} 是否存在指定模板。
	 */
	has: function(key) { return this._templates.hasOwnProperty(key); },

	/**
	 * 渲染模板。
	 * @method render
	 * @for Tmpl
	 * @param {String} key 模板名。
	 * @param {Object} [data] 数据。
	 * @param {Boolean} [cached=true] 是否缓存模板编译结果。
	 * @return {String} 渲染结果。
	 */
	render: function(key, data, cached) {
		var tpl = this._templates[key];
		if (tpl == null) {
			throw new Error('template "' + key + '" does not exist');
		}

		if (!base.isObject(tpl)) {
			// 编译函数体并进行缓存
			tpl = this._templates[key] = {
				fnBody: compile(tpl, this._settings),
				fnCache: { }
			};
		}

		// 遍历数据对象中的所有数据属性，找出所有键和值
		var keys = [], values = [];
		if (data != null) {
			for (var k in data) {
				if (data.hasOwnProperty(k)) {
					keys.push(k);
					values.push(data[k]);
				}
			}
		}

		// 以键数组的字符串表示为缓存键名
		var cacheKey = keys.toString(), fn = tpl.fnCache[cacheKey];
		if (!fn) {
			keys.push('__escape__');
			fn = tpl.fnCache[cacheKey] = new Function(keys, tpl.fnBody);
		}

		if (cached === false) { this.clear(key); }

		// 最后要加上escape函数
		values.push(escape);

		return fn.apply(data, values);
	},

	/**
	 * 清理模板。
	 * @method clear
	 * @for Tmpl
	 * @param {String} key 模板名。如果为空，则清理所有模板。
	 */
	clear: function(key) {
		if (key) {
			delete this._templates[key];
		} else {
			this._templates = { };
		}
	}
});


var defaultTpl;
/**
 * 使用默认设定渲染模板。
 * @method render
 * @for Tmpl
 * @static
 * @param {String} tpl 模版。
 * @param {Object} data 数据。
 * @param {Boolean} [cached=true] 是否缓存模板编译结果。
 * @return {String} 渲染结果。
 */
Tmpl.render = function(tpl, data, cached) {
	defaultTpl = defaultTpl || new Tmpl();
	if (!defaultTpl.has(tpl)) { defaultTpl.add(tpl, tpl); }
	return defaultTpl.render(tpl, data, cached);
};

/**
 * 把字符串中的HTML特殊字符编码为HTML实体。
 * @method escape
 * @for Tmpl
 * @static
 * @param {String} content 要编码的内容。
 * @return {String} 编码结果。
 */
Tmpl.escape = escape;

/**
 * 加载script节点中的模板（只有type为text/template的会被加载，节点的data-key属性为模板的key）。
 * @method fromScripts
 * @for Tmpl
 * @static
 * @param {Element|NodeList} [context] 上下文元素，默认为document。
 * @return {Object} 模板集合。
 */
Tmpl.fromScripts = function(context) {
	// 兼容NodeList类型（取第一个元素）
	if (context && !('nodeType' in context) && typeof context.get === 'function') {
		context = context.get(0);
	}
	// 默认为document
	if (!context || context.nodeType !== 1) { context = document; }

	var result = { };
	var scripts = context.getElementsByTagName('script');
	for (var i = 0, len = scripts.length; i < len; i++) {
		if (scripts[i].type === 'text/template') {
			result[scripts[i].getAttribute('data-key') || ''] = scripts[i].innerHTML.trim();
		}
	}

	return result;
};


module.exports = Tmpl;

});