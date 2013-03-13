/*!
 * jRaiser 2 Javascript Library
 * querystring - v1.0.0 (2013-03-13T15:37:14+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供URL参数序列化与反序列化接口
 * @module querystring/1.0.x/
 * @category Utility
 */

var base = require('base/1.0.x/');


return {
	/**
	 * 把数据序列化为URL参数
	 * @method stringify
	 * @param {Object} data 数据
	 * @param {Object} [o] 参数
	 *   @param {Function} [o.encode=encodeURIComponent] 编码函数
	 * @return {String} URL参数
	 */
	stringify: function(data, o) {
		o = base.extend({
			encode: encodeURIComponent
		}, o);

		var result = [ ];
		base.each(data, function(val, key) {
			result.push( o.encode(key) + ( val == null ? '' : ( '=' + o.encode(val) ) ) );
		});

		return result.join('&');
	},
	
	/**
	 * 把URL参数反序列化为数据
	 * @method parse
	 * @param {String} [qs] URL参数，默认为当前窗口的location.search
	 * @param {Object} [o] 参数
	 *   @param {Function} [o.decode=decodeURIComponent] 解码函数
	 * @return {Object} 数据
	 */
	parse: function (qs, o) {
		o = base.extend({
			decode: decodeURIComponent
		}, o);
		
		var data = { };

		qs = ( qs || window.location.search.substr(1) )
			.replace(/(?:^|&)([^&]+)=([^&]+)/g, function($0, $1, $2) {
				data[$1] = o.decode($2);
				return '';
			})
			.split('&');

		for (var i = 0; i < qs.length; i++) {
			if (qs[i]) { data[ qs[i] ] = null; }
		}

		return data;
	},

	/**
	 * 把数据序列化为URL参数后添加到指定URL
	 * @method append
	 * @param {String} url URL
	 * @param {Object|String} data 数据
	 * @param {Object} [o] 参数
	 *   @param {Function(value)} [o.encode=encodeURIComponent] 编码函数
	 * @return {String} 处理后的URL
	 */
	append: function(url, data, o) {
		if ( !data || base.isEmptyObject(data) ) { return url; }

		if (typeof data !== 'string') {
			data = this.stringify(data, o);
		}
		data = data.replace(/^[?&]+/, '');

		var temp = url.indexOf('#'), hash = '';
		if (temp !== -1) {
			hash = url.substring(temp, url.length);
			url = url.substring(0, temp);
		}
		url = url.replace(/[?&]+$/, '');

		return url + (url.indexOf('?') === -1 ? '?' : '&') + data + hash;
	}
};

});