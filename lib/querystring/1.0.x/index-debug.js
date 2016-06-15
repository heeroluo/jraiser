/*!
 * JRaiser 2 Javascript Library
 * querystring - v1.0.4 (2015-08-04T17:09:54+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供URL参数序列化与反序列化接口
 * @module querystring/1.0.x/
 * @category Utility
 */

var base = require('base/1.1.x/');


function encode(name, value, encoder) {
	return encoder(name) + ( value == null ? '' : ( '=' + encoder(value) ) );
}

return {
	/**
	 * 把数据序列化为URL参数
	 * @method stringify
	 * @param {Object|Array<Object<name,value>>} data 数据
	 * @param {Object} [o] 参数
	 *   @param {Function} [o.encode=encodeURIComponent] 编码函数
	 * @return {String} URL参数串
	 */
	stringify: function(data, o) {
		if (typeof data === 'string') { return data; }

		o = base.extend({
			encode: encodeURIComponent
		}, o);

		var result = [ ];
		if ( base.isArray(data) ) {
			data.forEach(function(d) {
				result.push( encode(d.name, d.value, o.encode) );
			});
		} else {
			for (var name in data) {
				result.push( encode(name, data[name], o.encode) );
			}
		}

		return result.join('&');
	},

	/**
	 * 把URL参数反序列化为数据
	 * @method parse
	 * @param {String} [qs] URL参数，默认为当前窗口的location.search
	 * @param {Object} [o] 参数
	 *   @param {Function} [o.decode=decodeURIComponent] 解码函数
	 *   @param {String} [o.dataType] 返回数组类型，默认为Object，参数值为'array'时返回数组
	 * @return {Object|Array<Object<name,value>>} 数据
	 */
	parse: function (qs, o) {
		o = base.extend({
			decode: decodeURIComponent
		}, o);

		var returnArray = o.dataType === 'array', data = returnArray ? [ ] : { };

		qs = ( qs || window.location.search )
			.replace(/^\?+/, '').split('&').forEach(function(pair) {
				if (!pair) { return; }

				pair = pair.split('=');
				// 只有参数名，没有等号和值的情况
				if (pair.length < 2) { pair.push(null); }

				if (returnArray) {
					data.push({
						name: o.decode(pair[0]),
						value: o.decode(pair[1])
					});
				} else {
					data[o.decode(pair[0])] = o.decode(pair[1]);
				}
			});

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
		if ( !data || (base.isArray(data) && !data.length) || base.isEmptyObject(data) ) {
			return url;
		}

		data = typeof data !== 'string' ? this.stringify(data, o) : data.replace(/^[?&]+/, '');

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