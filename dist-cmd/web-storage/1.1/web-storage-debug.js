define(function(require, exports, module) {
'use strict'; 

/**
 * 本模块提供本地存储接口的封装（不兼容IE6/7）。
 * @module web-storage/1.1/web-storage
 * @category Utility
 */

var base = require('../../base/1.2/base');
var timespan = require('../../timespan/1.0/timespan');


/**
 * 获取指定数据项的值。
 * @method get
 * @param {String} key 键名。
 * @return {String} 值。
 */
var get = exports.get = function(key) {
	// 先从sessionStorage中获取
	var value = sessionStorage.getItem(key);

	// 如果不在sessionStorage中，就从localStorage获取
	if (value == null) {
		var item = localStorage.getItem(key);
		if (item != null) {
			try {
				item = JSON.parse(item);
			} catch (e) { }

			if (item.expires && new Date() > item.expires) {
				// 已经过期，移除之
				localStorage.removeItem(key);
			} else {
				value = item.value;
			}
		}
	}

	return value;
};


/**
 * 获取指定数据项的值并将其转换成JSON对象。
 * @method getAsJSON
 * @param {String} key 键名。
 * @return {Object} JSON对象。如果转换失败，则返回null。
 */
exports.getAsJSON = function(key) {
	var value = get(key);
	try {
		value = JSON.parse(value);
	} catch (e) {
		value = null;
	}
	return value;
};


/**
 * 移除数据项。
 * @method remove
 * @param {String} key 键名。
 */
var remove = exports.remove = function(key) {
	sessionStorage.removeItem(key);
	localStorage.removeItem(key);
};


/**
 * 写入数据项。
 * @method set
 * @param {String} key 键名。
 * @param {Any} value 值。其中Object类型（不包括其子类）会被序列化。
 * @param {Date|Number|String} [expires] 过期时间。
 *   为日期类型时表示绝对时间；
 *   为数字或字符串时表示相对时间（当前时间+相对值），支持格式同timespan模块。
 * @return {Boolean} 存储成功时返回true，否则返回false。
 */
exports.set = function(key, value, expires) {
	// 设置新值前先移除旧值
	// 防止sessionStorage和localStorage中同时存在数据
	remove(key);

	if (value.constructor === Object) { value = JSON.stringify(value); }

	if (expires) {
		if (!base.isDate(expires)) {
			expires = timespan.addToDate(new Date(), expires);
		}

		// 已经过期的就不用写入了
		if (expires < new Date()) { return true; }

		var item = {
			value: value,
			expires: expires.getTime()
		};

		// 在浏览器的隐私模式下setItem会抛出异常
		// 但getItem和removeItem都不会
		try {
			localStorage.setItem(key, JSON.stringify(item));
		} catch (e) {
			return false;
		}

	} else {
		try {
			sessionStorage.setItem(key, value);
		} catch (e) {
			return false;
		}
	}

	return true;
};

});