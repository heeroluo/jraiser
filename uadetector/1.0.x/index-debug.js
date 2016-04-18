/*!
 * JRaiser 2 Javascript Library
 * uadetector - v1.0.2 (2016-04-18T16:03:30+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块根据UserAgent检测当前设备、系统、浏览器、排版引擎
 * @module uadetector/1.0.x/
 * @category Utility
 */

var ua = window.navigator.userAgent;


// 检测结果
var result = {
	device: { },
	os: { },
	layoutEngine: { },
	browser: { },
	feature: {
		touch: ('ontouchstart' in document) || !!(window.PointerEvent || window.MSPointerEvent)
	}
};

// 执行规则匹配
function execRules(rules, type, breakWhenMatch) {
	var i, match;
	for (i = 0; i < rules.length; i++) {
		match = ua.match(rules[i][1]);
		if (match) {
			result[type][rules[i][0]] = true;
			result[type].version = match[1] || '';
			if (breakWhenMatch) { break; }
		}
	}

	return match != null;
}


// 设备识别
execRules([
	['ipad', /iPad(?:.*OS\s([\d_]+))?/],
	['ipod', /iPod(?:.*OS\s([\d_]+))?/],
	['iphone', /iPhone(?:\sOS\s([\d_]+))?/],
	['mac', /Macintosh/],
	['kindle', /Kindle/],
	['playbook', /PlayBook/],
	['blackberry', /BlackBerry/],
	['bb10', /BB10/],
	['nokia', /nokia/i]
], 'device', true);

// 系统识别
execRules([
	['windowsphone', /Windows\sPhone\s([\d.]+)/],
	['windowsmobile', /Windows\sMobile/],
	['windowsce', /Windows\sCE/],
	['windows', /Windows\sNT\s([\d.]+)/],
	['macosx', /Mac\sOS\sX\s([\d_.]+)/],
	['android', /Android;?[\s\/]+([\d.]+)?/],
	['symbian', /Symbian(?:OS)?\/([\d.]+)/],
	['linux', /Linux/]
], 'os', true);

// 浏览器排版引擎识别
execRules([
	['trident', /Trident\/([\d.]+)/],
	['webkit', /Web[kK]it[\/]?([\d.]+)/],
	['gecko', /Gecko\/([\d.]+)/],
	['presto', /Presto\/([\d.]+)/]
], 'layoutEngine', true);

// 浏览器识别
execRules([
	['ie', /MSIE\s([\d.]+)/],
	['ie', /Trident\/.*;\srv:([\d.]+)/],
	['firefox', /Firefox\/([\d.]+)/],
	['operamini', /Opera\sMini\/([\d.]+)/],
	['opera', /Opera\/.*Version\/([\d.]+)/],
	['opera', /Opera\/([\d.]+)/],
	['opera', /OPR\/([\d.]+)/],
	['chrome', /Chrome\/([\d.]+)/],
	['chrome', /CriOS\/([\d.]+)/],
	['safari', /Version\/([\d.]+).*Safari/]
], 'browser', true);


var device = result.device, os = result.os, browser = result.browser;

// 某些版本号的数字用“-”分隔，替换成“.”
if (device.iphone || device.ipod || device.ipad) {
	os.ios = true;
	os.version = device.version.replace(/_/g, '.');
}
if (os.macosx && os.version) { os.version = os.version.replace(/_/g, '.'); }
delete device.version;


device.tablet = !os.windows && !!(
	device.ipad || device.playbook || ( os.android && !ua.match(/Mobile/) ) ||
	( browser.firefox && /Tablet/.test(ua) ) ||
	( browser.ie && !/Phone/.test(ua) && /Touch/.test(ua) )
);
device.phone = !os.windows && !!(
	!device.tablet && (
		os.android || device.iphone || device.ipod ||
		device.blackberry || device.bb10 ||
		os.windowsce || os.windowsmobile || os.windowsphone || 
		( browser.chrome && /Android/.test(ua) ) || ( browser.chrome && /CriOS\/[\d.]+/.test(ua) ) ||
		( browser.firefox && /Mobile/.test(ua) ) || ( browser.ie && /Touch/.test(ua) )
	)
);

// 修正对诺基亚或塞班设备的判断
if (!device.tablet && !device.phone) {
	if (device.nokia || os.symbian || ua.indexOf('MIDP') !== -1) { device.phone = true; }
}

device.mobile = !os.windows && ( device.tablet || device.phone ||
	/mobile/i.test(ua) || /tablet/i.test(ua) || /phone/i.test(ua) );

device.pc = !device.mobile;


return {
	/**
	 * 检查Useragent是否符合特定条件
	 * @method is
	 * @param {Function|String|RegExp} tester 为函数时，以函数返回值作为结果；
	 *   为字符串时，返回Useragent中是否包含该字符串；
	 *   为正则表达式时，返回正则匹配结果
	 * @return {Boolean} Useragent是否符合特定条件
	 */
	is: function(tester) {
		if (typeof tester === 'function') {
			return !!tester(ua);
		} else if (typeof tester === 'string') {
			return ua.indexOf(tester) !== -1;
		} else if (tester instanceof RegExp) {
			return tester.test(ua);
		}
	},

	/**
	 * 检测是否特定设备
	 * @method isDevice
	 * @param {String} name 设备名，有效值包括：
	 *   pc（个人电脑）；
	 *   tablet（平板电脑）；
	 *   phone（手机）；
	 *   mobile（移动设备，手机或平板）；
	 *   mac（苹果电脑）；
	 *   iphone；
	 *   ipod；
	 *   ipad；
	 *   kindle（Kindle Fire）；
	 *   blackberry（黑莓）；
	 *   bb10（黑莓BB10）；
	 *   playbook（黑莓PlayBook）。
	 * @return {Boolean} 是否该设备
	 */
	isDevice: function(name) { return !!result.device[name]; },

	/**
	 * 检测是否特定操作系统
	 * @method isOS
	 * @param {String} name 系统名，有效值包括：
	 *   ios；
	 *   android；
	 *   windows（PC）；
	 *   windowsce；
	 *   windowsmobile；
	 *   windowsphone；
	 *   macosx；
	 *   linux；
	 *   symbian。
	 * @return {Boolean} 是否该系统
	 */
	isOS: function(name) { return !!result.os[name]; },

	/**
	 * 检测是否特定浏览器
	 * @method isBrowser
	 * @param {String} name 浏览器名，有效值包括：
	 *   ie；
	 *   chrome；
	 *   firefox；
	 *   safari；
	 *   opera；
	 *   operamini。
	 * @return {Boolean} 是否该浏览器
	 */
	isBrowser: function(name) { return !!result.browser[name]; },

	/**
	 * 检测是否特定浏览器排版引擎
	 * @method isLayoutEngine
	 * @param {String} name 排版引擎名，有效值包括：
	 *   webkit；
	 *   trident；
	 *   gecko；
	 *   presto。
	 * @return {Boolean} 是否该浏览器
	 */
	isLayoutEngine: function(name) { return !!result.layoutEngine[name]; },

	/**
	 * 获取操作系统（核心）版本号
	 * @method osVer
	 * @return {String} 版本号
	 */
	osVer: function() { return result.os.version; },

	/**
	 * 获取浏览器版本号
	 * @method browserVer
	 * @return {String} 版本号
	 */
	browserVer: function() { return result.browser.version; },

	/**
	 * 获取浏览器排版引擎版本号
	 * @method layoutEngineVer
	 * @return {String} 浏览器排版引擎版本号
	 */
	layoutEngineVer: function() { return result.layoutEngine.version; },

	/**
	 * 检测是否支持特定特征
	 * @method hasFeature
	 * @param {String} name 特征名，有效值包括：
	 *   touch（是否支持触屏事件）。
	 * @return {Boolean} 是否支持该特征
	 */
	hasFeature: function(name) { return !!result.feature[name]; },

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