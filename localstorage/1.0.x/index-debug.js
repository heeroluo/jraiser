/*!
 * JRaiser 2 Javascript Library
 * localstorage - v1.0.0 (2013-03-13T22:26:08+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供兼容IE6/7的localStorage
 * @module localstorage/1.0.x/
 * @category Utility
 */

var localStorage = window.localStorage, isNative = localStorage != null;
if (!isNative) {
	// IE下通过UserData模拟localStorage
	localStorage = {
		init: function() {
			var input = this._input = document.createElement('input');
			input.type = 'hidden';
			input.addBehavior('#default#userData');
			document.body.insertBefore(input, document.body.firstChild);

			this._filename = window.location.hostname;
			input.load(this._filename);
		},

		_save: function(expires) {
			if (!expires) {
				// 默认过期时间为1年
				expires = new Date();
				expires.setFullYear(expires.getFullYear() + 1);
			}
			this._input.expires = expires.toUTCString();
			this._input.save(this._filename);
		},

		getItem: function(key) { return this._input.getAttribute(key); },

		setItem: function(key, val) {
			this._input.setAttribute(key, val);
			this._save();
		},

		removeItem: function(key) {
			this._input.removeAttribute(key);
			this._save();
		},

		clear: function() {
			// 1979年12月31日23时59分59秒
			// 这是删除UserData的最靠前的一个有效expires时间了
			this._save( new Date(315532799000) );
			this._input.load(this._filename);
		}
	};

	localStorage.init();
}


return {
	/**
	 * 获取当前浏览器是否原生支持localStorage
	 * @property isNative
	 * @type {Boolean}
	 */
	isNative: isNative,
	/**
	 * 获取键名对应的值
	 * @method getItem
	 * @param {String} key 键名
	 * @return {String} 键值
	 */
	getItem: function() {
		return localStorage.getItem.apply(localStorage, arguments);
	},
	/**
	 * 设置键名对应的值
	 * @method setItem
	 * @param {String} key 键名
	 * @param {String} value 键值
	 */
	setItem: function() {
		return localStorage.setItem.apply(localStorage, arguments);
	},
	/**
	 * 删除键名对应的值
	 * @method removeItem
	 * @param {String} key 键名
	 */
	removeItem: function() {
		return localStorage.removeItem.apply(localStorage, arguments);
	},
	/**
	 * 清除所有键值对
	 * @method clear
	 */
	clear: function() {
		return localStorage.clear.apply(localStorage, arguments);
	}
};


});