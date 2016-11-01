/*!
 * JRaiser 2 Javascript Library
 * njks@2.5.2 (2016-11-01T17:38:04+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * Nunjucks模板引擎
 * @module njks@2.5.x
 * @category Utility
 */

var base = require('base@1.1.x'), nunjucks = require('./nunjucks');


/**
 * 创建Nunjucks运行环境
 * @method createEnv
 * @param {Object} loader 模板加载器
 * @param {Object} opts 选项
 * @return {Object} Nunjucks运行环境
 */
exports.createEnv = function(loader, opts) {
	opts = base.extend({
		trimBlocks: true,
		lstripBlocks: true
	}, opts);

	return new nunjucks.Environment(loader, opts);
};


/**
 * 使用默认设定渲染模板
 * @method render
 * @param {String} tpl 模板
 * @param {Object} data 数据
 * @return {Object} 模板加载器
 */
exports.render = function(tpl, data) {
	return nunjucks.renderString(tpl, data);
};


// 模板内容加载器（直接从函数中获取）
var ScriptTplLoader = nunjucks.Loader.extend({
	init: function(getTemplate) {
		// 存储模板
		this._getTemplate = getTemplate;
	},
	resolve: function(from, to) {
		if (to.charAt(0) !== '.') { return to; }

		var result = from.split('/');
		to = to.split('/');

		result.pop();

		to.forEach(function(item) {
			if (item === '..') {
				result.pop();
			} else if (item !== '.') {
				result.push(item);
			}
		});

		return result.join('/');
	},
	getSource: function(key) {
		return {
			src: this._getTemplate(key),
			path: key
		};
	}
});


/**
 * 创建加载script模板（只有“type=text/nunjucks”的会被加载）的模板加载器
 * @method fromScripts
 * @return {Object} 模板加载器
 */
exports.fromScripts = function() {
	var templates = { };

	function load() {
		var scripts = document.getElementsByTagName('script'), key;
		for (var i = scripts.length - 1; i >= 0; i--) {
			if (scripts[i].type === 'text/nunjucks') {
				key = scripts[i].getAttribute('data-key') || '';
				if (templates[key] == null) {
					templates[key] = scripts[i].innerHTML.trim();
				}
			}
		}
	}
	load();

	return new ScriptTplLoader(function(key) {
		// 如果模板不存在，再load一次
		// 避免第一次load的时候还没domready导致模板没全部load进来
		if (!templates[key]) { load(); }

		return templates[key];
	});
};

});