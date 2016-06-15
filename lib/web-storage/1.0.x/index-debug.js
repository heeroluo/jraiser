/*!
 * JRaiser 2 Javascript Library
 * Uniform interfaces of web storage - v1.0.0 (2016-06-15T16:09:43+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供本地存储接口的封装（不兼容IE6/7）
 * @module web-storage/1.0.x/
 * @category Utility
 */


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
	 * @param {Number} [expires] 多久后过期（以毫秒为单位）。默认为session；小于0表示永不过期
	 */
	set: function(key, value, expires) {
		// 设置新值前先移除旧值
		// 防止sessionStorage和localStorage中同时存在数据
		this.remove(key);

		if (value.constructor === Object) { value = JSON.stringify(value); }

		if (expires) {
			var item = { value: value };
			if (expires > 0) { item.expires = +new Date() + expires; }
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