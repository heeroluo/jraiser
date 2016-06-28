/*!
 * JRaiser 2 Javascript Library
 * uadetector@1.1.0 (2016-06-19T19:04:06+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块根据UserAgent检测当前环境
 * @module uadetector@1.1.x, uadetector/1.1.x/
 * @category Utility
 */

var ua = window.navigator.userAgent;


// 存放检测结果
var result = { };

// 执行规则匹配
function execRules(rules, type) {
	var i, match;
	for (i = 0; i < rules.length; i++) {
		match = ua.match(rules[i].rule);
		if (match) {
			// 版本号处理
			var version = match[1] || '';
			if (version) {
				// 某些版本号用下划线分隔，替换为点号
				version = version.replace(/_/g, '.').split('.');
				// 强制最多保留两段版本号
				if (version.length > 2) { version.length = 2; }

				version = version.join('.');
			}

			result[type] = {
				name: rules[i].name,
				version: version
			};

			break;
		}
	}
}


execRules([
	{ name: 'Windows Phone', rule: /\bWindows\sPhone(?:\sOS)?(?:\s([\d.]+))?\b/ },
	{ name: 'Windows Mobile', rule: /\bWindows\s?Mobile\b/ },
	{ name: 'Windows', rule: /\bWindows\sNT\s(\d+\.\d)\b/ },
	{ name: 'iOS', rule: /\bOS(?:\s([\d_.]+))?\slike\sMac\sOS\sX\b/ },
	{ name: 'Mac OS X', rule: /\bMac\sOS\sX(?:\s([\d_.]+))?/ },
	{ name: 'Android', rule: /\bAndroid;?(?:[-\/\s]([\d.]+))?(?:\b|_)/ },
	{ name: 'Android', rule: /\bAdr\s([\d.]+)(?:\b|_)/ }
], 'os');

execRules([
	{ name: 'Opera', rule: /\bOPR\/([\d.]+)/ },
	{ name: 'Edge', rule: /\bEdge\/([\d.]+)/ },
	{ name: 'Chrome', rule:  /\b(?:Chrome|CrMo|CriOS)\/([\d.]+)/ },
	{ name: 'Safari', rule: /\b(?:Version\/([\d.]+).*\s?)?Safari\b/ },
	{ name: 'IE', rule: /\bMSIE\s(\d+)/i },
	{ name: 'IE', rule: /\bTrident\/.*;\srv:(\d+)/ },
	{ name: 'Firefox', rule: /\bFirefox\/(\d+)/ },
	{ name: 'Opera', rule: /\bOpera\/([\d.]+)/ }
], 'browser');

execRules([
	{ name: 'Weixin', rule: /\bMicroMessenger\/([\d.]+)/ },
	{ name: 'QQ', rule: /\bQQ\/([\d.]+)/ }
], 'app');


return {
	/**
	 * 获取检测结果
	 * @method get
	 * @param {String} type 检测类型，os、browser或app
	 * @return {Object} 检测结果，有name和version两个属性
	 */
	get: function(type) {
		var myResult = result[type];
		return myResult ? {
			name: myResult.name,
			version: myResult.version
		} : { };
	},

	/**
	 * 输出所有检测到的数据为HTML
	 * @method print
	 * @param {Element|NodeList} wrapper 目标容器
	 * @return {String} HTML字符串
	 */
	print: function(wrapper) {
		var html = ua, i;

		for (var type in result) {
			html += '<h1>' + type + '</h1>';
			for (var i in result[type]) {
				html += '<p>' + i + ': ' + result[type][i] + '</p>';
			}
		}

		if (wrapper) {
			if ('innerHTML' in wrapper) {
				wrapper.innerHTML = html;
			} else if (typeof wrapper.html === 'function') {
				wrapper.html(html);
			}
		}

		return html;
	},

	/**
	 * 在控制台输出所有检测到的数据
	 * @method info
	 */
	info: function() {
		if (window.console) { console.dir(result); }
	}
};

});