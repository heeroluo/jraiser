/*!
 * JRaiser 2 Javascript Library
 * web-storage@1.0.1 (2016-06-19T20:18:50+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供本地存储接口的封装（不兼容IE6/7）
 * @module web-storage@1.0.x, web-storage/1.0.x/
 * @category Utility
 */

var base = require('base/1.1.x/');


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
	 * 获取存储项
	 * @method get
	 * @param {String) key 键名
	 * @return {String} 存储值
	 */
	get: function(key) {
		// 先从sessionStorage中获取
		var value = sessionStorage.getItem(key);

		// 如果不在sessionStorage中，就从localStorage获取
		if (value == null) {
			var item = localStorage.getItem(key);
			if (item != null) {
				try {
					item = JSON.parse(item);
				} catch (e) {

				}

				if (item.expires && new Date() > item.expires) {
					// 已经过期，移除之
					localStorage.removeItem(key);
				} else {
					value = item.value;
				}
			}
		}

		return value;
	},

	/**
	 * 获取存储项并转换成JSON对象
	 * @method getAsJSON
	 * @param {String} key 键名
	 * @return {Object} JSON对象
	 */
	getAsJSON: function(key) {
		var value = this.get(key);
		try {
			value = JSON.parse(value);
		} catch (e) {
			value = null;
		}
		return value;
	},

	/**
	 * 存储数据
	 * @method set
	 * @param {String) key 键名
	 * @param {Any} value 键值。其中Object类型（不包括其子类）会被序列化
	 * @param {Date|Number|String} [expires] 过期时间。可传入带单位的时间值，例如'1 hour'，
	 *   支持的时间单位有sec、min、hour、day，month、year
	 */
	set: function(key, value, expires) {
		// 设置新值前先移除旧值
		// 防止sessionStorage和localStorage中同时存在数据
		this.remove(key);

		if (value.constructor === Object) { value = JSON.stringify(value); }

		if (expires) {
			var item = {
				value: value,
				expires: timespanToDate(expires).getTime()
			};

			// 在Safari的无痕浏览模式下setItem会抛出异常
			// 但getItem和removeItem都不会
			try {
				localStorage.setItem( key, JSON.stringify(item) );
			} catch (e) {

			}
		} else {
			try {
				sessionStorage.setItem(key, value);
			} catch (e) {

			}
		}
	},

	/**
	 * 移除存储数据
	 * @method remove
	 * @param {String) key 键名
	 */
	remove: function(key) {
		sessionStorage.removeItem(key);
		localStorage.removeItem(key);
	}
};

});