define(function(require, exports, module) {
'use strict'; 

/**
 * 本模块提供Cookie读写接口。
 * @module cookie/1.1/cookie
 * @category Utility
 */

var base = require('../../base/1.2/base');
var timespan = require('../../timespan/1.0/timespan');


/**
 * 写入cookie。
 * @method set
 * @param {String} key cookie键。
 * @param {String} value cookie值。
 * @param {Object} [options] 参数。
 *   @param {String} [options.domain] 所在域。
 *   @param {String} [options.path] 所在路径。
 *   @param {Date|Number|String} [options.expires] 过期时间。
 *     为日期类型时表示绝对时间；
 *     为数字或字符串时表示相对时间（当前时间+相对值），支持格式同timespan模块。
 *   @param {Boolean} [options.secure] 是否只在https连接中有效。
 *   @param {Function(value):String} [options.encode=encodeURIComponent] 编码函数。
 */
var set = exports.set = function(key, value, options) {
	options = base.extend({
		encode: encodeURIComponent
	}, options);

	var content = options.encode(key) + '=' + options.encode(value);
	if (options.expires != null) {
		content += '; expires=' + (
			base.isDate(options.expires) ?
				options.expires :
				timespan.addToDate(new Date(), options.expires)
		).toUTCString();
	}
	if (options.path) { content += '; path=' + options.path; }
	if (options.domain) { content += '; domain=' + options.domain; }
	if (options.secure === true) { content += '; secure'; }

	document.cookie = content;
};


/**
 * 读取cookie。
 * @method get
 * @param {String} name cookie名。
 * @param {Object} [options] 参数。
 *   @param {Function(value):String} [o.encode=encodeURIComponent] 编码函数。
 *   @param {Function(value):String} [o.decode=decodeURIComponent] 解码函数。
 * @return {String} cookie值。
 */
var get = exports.get = function(key, options) {
	options = base.extend({
		encode: encodeURIComponent,
		decode: decodeURIComponent
	}, options);

	key = '; ' + options.encode(key) + '=';
	var cookie = '; ' + document.cookie;
	var beginPos = cookie.indexOf(key);

	if (beginPos === -1) { return null; }

	beginPos += key.length;
	var endPos = cookie.indexOf(';', beginPos);
	if (endPos === -1) { endPos = cookie.length; }

	return options.decode(cookie.substring(beginPos, endPos));
};


// iOS9下设置过期不会马上生效，先设为空
var shouldSetEmptyBeforeRemove = (function() {
	var TEST_KEY = '__jraiser__test__cookie__';
	document.cookie = TEST_KEY + '=1';
	document.cookie = TEST_KEY + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
	return !!get(TEST_KEY);
})();

/**
 * 移除cookie。
 * @method remove
 * @param {String} name cookie名。
 * @param {Object} [options] 参数。
 *   @param {String} [options.domain] 所在域。
 *   @param {String} [options.path] 所在路径。
 *   @param {Function(value):String} [options.encode=encodeURIComponent] 编码函数。
 */
exports.remove = function(name, options) {
	if (shouldSetEmptyBeforeRemove) { set(name, '', options); }

	options = options || { };
	// 让其过期即为删除
	options.expires = new Date(0);
	set(name, '', options);
};

});