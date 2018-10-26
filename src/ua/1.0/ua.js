/**
 * 本模块提供基于UserAgent的常用环境检测。
 * @module ua@1.0
 * @category Utility
 */

var ua = typeof window !== 'undefined' ? window.navigator.userAgent : '';


// 缓存匹配结果
var cache = { };

// 执行规则匹配
function execRules(rules) {
	if (!ua) { return; }

	var i, match;
	for (i = 0; i < rules.length; i++) {
		match = ua.match(rules[i].rule);
		if (match) {
			// 版本号处理
			var version = match[1] || '';
			if (version) {
				version = version
					// 某些版本号用下划线分隔，替换为点号
					.replace(/_/g, '.')
					// 非法值修正
					.replace(/\.{2,}/g, '.')
					.replace(/\.+$/, '')
					// 分割为数组，限制长度
					.split('.');

				// 最多保留三段版本号
				if (version.length > 3) { version.length = 3; }

				version = version.join('.');

				// 版本号合法性判断
				if (!/^\d+(?:\.\d+)*$/.test(version)) { version = null; }
			}

			return {
				name: rules[i].name,
				version: version
			};
		}
	}
}


// 各类识别规则
var rules = {
	os: [
		{
			name: 'pcWindows',
			rule: /\bWindows\sNT\s(([\d.]+))\b/
			// 版本号对应关系
			// {
			// 	'5.0': '2000',
			// 	'5.1': 'XP',
			// 	'5.2': '2003',
			// 	'6.0': 'Vista',
			// 	'6.1': '7',
			// 	'6.2': '8',
			// 	'6.3': '8.1',
			// 	'10.0': '10'
			// }
		},
		{
			name: 'iOS',
			rule: /\bOS(?:\s([\d_.]+))?\slike\sMac\sOS\sX\b/
		},
		{
			name: 'macOS',
			rule: /\bMac\sOS\sX(?:\s([\d_.]+))?/
		},
		{
			name: 'Android',
			rule: /\bAndroid;?(?:[-/\s]([\d.]+))?(?:\b|_)/
		}
	],

	browserCore: [
		{
			name: 'Webkit',
			rule: /\bAppleWebKit(?:[/\s]?([\d.]+))?/i
		},
		{
			name: 'Webkit',
			rule: /Web[Kk]it(?:\/?([\d.]+))?/
		}
	],

	browser: [
		{
			name: 'IE',
			rule: /\bMSIE\s(\d+)/i
		},
		{
			name: 'IE',
			rule: /\bTrident\/.*;\srv:(\d+)/
		},
		{
			name: 'Edge',
			rule: /\bEdge\/([\d.]+)/
		},
		{
			name: 'mUC',
			rule: /\b(?:UC\s?Browser|UCWEB)(?:-CMCC)?\/?\s?([\d.]+)/
		},
		{
			name: 'mQQ',
			rule: /\bMQQBrowser\/([\d.]+)?/
		},
		{
			name: 'Chrome',
			rule: /\b(?:Chrome|CrMo|CriOS)\/([\d.]+)/
		}
	],

	client: [
		{
			name: 'Weixin',
			rule: /\bMicroMessenger\/([\d.]+)/
		},
		{
			name: 'mQQ',
			rule: /\bQQ\/([\d.]+)/
		},
		{
			name: 'mQQ',
			rule: /\bIPadQQ\b/
		},
		{
			name: 'Weibo',
			rule: /(?:\b|_)Weibo(?:\b|_)/i
		}
	]
};


// 比较版本号。比较结果：1表示a>b，-1表示a<b，0表示相等。
function compareVersion(a, b) {
	if (a === b) { return 0; }

	a = String(a || 0).split('.');
	b = String(b || 0).split('.');

	var len = Math.max(a.length, b.length), tempA, tempB;
	for (var i = 0; i < len; i++) {
		tempA = parseInt(a[i]) || 0;
		tempB = parseInt(b[i]) || 0;

		if (tempA > tempB) {
			return 1;
		} else if (tempA < tempB) {
			return -1;
		}
	}

	return 0;
}

// 各种对比操作对应的compareVersion返回值
var cmpOpers = {
	gt: function(value) { return value === 1; },
	lt: function(value) { return value === -1; },
	gte: function(value) { return value >= 0; },
	lte: function(value) { return value <= 0; },
	eq: function(value) { return value === 0; }
};


// 生成检测对应类型的函数
function wrap(type) {
	return function(name, cmp, version) {
		var result;
		if (cache.hasOwnProperty(type)) {
			result = cache[type];
		} else {
			result = cache[type] = execRules(rules[type]);
			// 有匹配结果之后，规则就没用了
			delete rules[type];
		}

		// 名称对比
		if (!result || result.name !== name) { return false; }

		// 版本号对比
		if (cmp && version) {
			return result.version ?
				cmpOpers[cmp](compareVersion(result.version, version)) :
				false;
		} else {
			return true;
		}
	};
}


/**
 * 检查当前操作系统
 * @method isOS
 * @param {String} name 操作系统名。可用名称包括：
 *   pcWindow（PC的Windows系统）、
 *   iOS、
 *   macOS（macOS或OS X）、
 *   Android。
 * @param {String} cmp 版本号对比符号。可用符号包括：
 *   gt（大于）、
 *   gte（大于等于）、
 *   lt（小于）、
 *   lte（小于等于）、
 *   eq（等于）。
 * @param {String} version 对比版本号。
 * @return {Boolean} 检查结果。
 */
exports.isOS = wrap('os');

/**
 * 检查当前浏览器核心。
 * @method isBrowserCore
 * @param {String} name 浏览器核心名。可用名称只有Webkit。
 * @param {String} cmp 版本号对比符号，同isOS。
 * @param {String} version 对比版本号。
 * @return {Boolean} 检查结果。
 */
exports.isBrowserCore = wrap('browserCore');

/**
 * 检查当前浏览器。
 * @method isBrowser
 * @param {String} name 浏览器名。可用名称有：
 *   IE（包括PC端和移动端）、
 *   Edge（包括PC端和移动端）、
 *   mUC（移动端UC浏览器）、
 *   mQQ（移动端QQ浏览器）、
 *   Chrome（包括PC端和移动端）。
 * @param {String} cmp 版本号对比符号，同isOS。
 * @param {String} version 对比版本号。
 * @return {Boolean} 检查结果。
 */
exports.isBrowser = wrap('browser');

/**
 * 检查当前客户端。
 * @method isClient
 * @param {String} name 客户端名。可用名称有：
 *   Weixin（微信，包括PC端和移动端）、
 *   mQQ（手机QQ）、
 *   Weibo（手机端微博）。
 * @param {String} cmp 版本号对比符号，同isOS。
 * @param {String} version 对比版本号。
 * @return {Boolean} 检查结果。
 */
exports.isClient = wrap('client');

/**
 * 当前是否移动端设备。
 * @property isMobile
 * @type {Boolean}
 */
var isMobile = exports.isMobile = /android|mobile|phone/i.test(ua);

/**
 * 当前是否平板电脑设备。
 * @property isTablet
 * @type {Boolean}
 */
exports.isTablet = /iPad/.test(ua) || (isMobile && !/mobile/i.test(ua));

/**
 * 当前是否PC设备。
 * @property isPC
 * @type {Boolean}
 */
exports.isPC = !isMobile;