/*!
 * JRaiser 2 Javascript Library
 * micro-templating - v1.0.0 (2014-04-21T14:44:29+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 微型模版解析器
 * @module tmpl/1.0.x/
 * @category Utility
 */


function loadTemplateFromHTML() {
	var scripts = document.getElementsByTagName('script'), result = { };
	for (var i = 0; i < scripts.length; i++) {
		result[
			scripts[i].getAttribute('data-key') || scripts[i].id
		] = scripts[i].innerHTML.trim();
	}

	return result;
}


var entityMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#x27;',
	'/': '&#x2F;'
}, entityKeys = [ ];
for (var key in entityMap) {
	entityKeys.push(key);
}
var re_entity = new RegExp('[' + entityKeys.join('') + ']', 'g');
function escape(content) {
	return content.replace(re_entity, function(match) {
		return entityMap[match];
	});
}


function factory(settings) {
	var delimiters = (settings || { }).delimiters;
	if (delimiters) {
		delimiters = delimiters.slice();
	} else {
		delimiters = ['<%', '%>'];
	}

	var re_evaluate = new RegExp("((^|" + delimiters[1] + ")[^\\t]*)'", 'g'),
		re_value = new RegExp('\\t=(.*?)' + delimiters[1], 'g'),
		re_valueToEscape = new RegExp('\\t-(.*?)' + delimiters[1], 'g');

	// 模板缓存
	var cache = { };

	return {
		/**
		 * 以指定数据渲染模版
		 * @method render
		 * @param {String} str 模版代码
		 * @param {Object} data 数据
		 * @param {Boolean} [cached=true] 是否缓存模版
		 * @return {String} 渲染结果
		 */
		render: function(str, data, cached) {
			if (null == str || null == data) { return str; }

			var render = cache[str];
			if (!render) {
				render = new Function("obj", "escape",
					"var __p__=[],print=function(){__p__.push.apply(__p__,arguments);};" +
					"with(obj){__p__.push('" +
					str
						.replace(/[\r\t\n]/g, " ")
						.split(delimiters[0]).join("\t")
						.replace(re_evaluate, "$1\r")
						.replace(re_value, "',$1,'")
						.replace(re_valueToEscape, "',escape($1),'")
						.split("\t").join("');")
						.split(delimiters[1]).join("__p__.push('")
						.split("\r").join("\\'")
					+ "');}return __p__.join('');");

				if (cached !== false) { cache[str] = render; }
			}

			return render(data, escape);
		},

		/**
		 * 从HTML加载<script type="text/html">和</script>间的模版代码，
		 * 键名为该script标签的data-key属性或id属性
		 * @method loadTemplateFromHTML
		 * @return {Object<String,String>} 模版字典
		 */
		loadTemplateFromHTML: loadTemplateFromHTML,

		/**
		 * 生成特定配置的模版解析器
		 * @method setup
		 * @param {Object} settings 配置
		 *   @param {Array(2)} [settings.delimiters] 模版中的逻辑代码分隔符，默认为'<%'和'%>'
		 * @return {Object} 模版解析器，接口与本模块的接口一致
		 */
		setup: factory
	}
}

return factory();

});