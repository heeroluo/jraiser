/*!
 * JRaiser 2 Javascript Library
 * cookie@1.0.2 (2016-06-21T15:15:46+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供cookie读写接口
 * @module cookie@1.0.x, cookie/1.0.x/
 * @category Utility
 */

var base = require('base@1.1.x');


// 时间间隔转换为日期对象
var timespanToDate = (function() {
	// 时间单位
	var timeUnits = {
		SEC: 1000,
		MIN: 60 * 1000,
		HOUR: 60 * 60 * 1000,
		DAY: 24 * 60 * 60 * 1000,
		MONTH: 30 * 24 * 60 * 60 * 1000,
		YEAR: 365 * 24 * 60 * 60 * 1000
	};

	// 匹配带单位的时间值
	var rTime = /^(\d+(?:\.\d+)?)\s*([a-z]+?)s?$/i;

	return function(timespan) {
		// 日期对象，直接返回
		if ( base.isDate(timespan) ) { return timespan; }

		if (typeof timespan !== 'number') {
			if ( rTime.test(timespan) ) {
				var unit = RegExp.$2.toUpperCase();
				// 无此时间单位，抛出异常
				if ( !timeUnits.hasOwnProperty(unit) ) {
					throw new Error('No such time unit("' + RegExp.$2 + '")');
				}
				timespan = parseFloat(RegExp.$1) * timeUnits[unit];
			} else {
				throw new Error('Invalid timespan');
			}
		}

		var date = new Date();
		date.setTime(date.getTime() + timespan);
		return date;
	};
})();


return {
	/**
	 * 写入cookie
	 * @method set
	 * @param {String} name cookie名
	 * @param {String} value cookie值
	 * @param {Object} [o] 参数
	 *   @param {String} [o.domain] 所在域
	 *   @param {String} [o.path] 所在路径
	 *   @param {Date|Number|String} [o.expires] 过期时间。可传入带单位的时间值，例如'1 hour'，
	 *     支持的时间单位有sec、min、hour、day，month、year
	 *   @param {Boolean} [o.secure] 是否只在https连接中有效
	 *   @param {Function(value)} [o.encode=encodeURIComponent] 编码函数
	 */
	set: function (name, value, o) {
		o = base.extend({
			encode: encodeURIComponent
		}, o);

		var text = o.encode(name) + '=' + o.encode(value);

		if (o.expires != null) { text += '; expires=' + timespanToDate(o.expires); }
		if (o.path) { text += '; path=' + o.path; }
		if (o.domain) { text += '; domain=' + o.domain; }
		if (o.secure === true) { text += '; secure'; }

		document.cookie = text;
	},

	/**
	 * 读取cookie
	 * @method get
	 * @param {String} name cookie名
	 * @param {Object} [o] 参数
	 *   @param {Function(value)} [o.encode=encodeURIComponent] 编码函数
	 *   @param {Function(value)} [o.decode=decodeURIComponent] 解码函数
	 * @return {String} cookie值
	 */
	get: function(name, o) {
		o = base.extend({
			encode: encodeURIComponent,
			decode: decodeURIComponent
		}, o);

		name = '; ' + o.encode(name) + '=';
		var cookie = '; ' + document.cookie, beginPos = cookie.indexOf(name), endPos;

		if (beginPos === -1) { return null; }

		beginPos += name.length;
		endPos = cookie.indexOf(';', beginPos);
		if (endPos === -1) { endPos = cookie.length; }

		return o.decode( cookie.substring(beginPos, endPos) );
	},

	/**
	 * 移除cookie
	 * @method remove
	 * @param {String} name cookie名
	 * @param {Object} [o] 参数
	 *   @param {String} [o.domain] 所在域
	 *   @param {String} [o.path] 所在路径
	 *   @param {Function(value)} [o.encode=encodeURIComponent] 编码函数
	 *   @param {Function(value)} [o.decode=decodeURIComponent] 解码函数
	 */
	remove: function (name, o) {
		o = o || { };
		o.expires = new Date(0);

		this.set(name, '', o);
	}
};

});