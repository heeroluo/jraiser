/*!
 * JRaiser 2 Javascript Library
 * querystring - v1.0.1 (2013-11-13T11:08:26+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供URL参数序列化与反序列化接口
 * @module querystring/1.0.x/
 * @category Utility
 */

var base = require('base/1.0.x/');


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

		qs = ( qs || window.location.search.substr(1) )
			.replace(/(?:^|&)([^&]+)=([^&]+)/g, function($0, $1, $2) {
				var value = $2;
				try {
					value = o.decode(value);
				} catch (e) {

				}
				if (returnArray) {
					data.push({
						name: $1,
						value: value
					});
				} else {
					data[$1] = value;
				}
				return '';
			})
			.split('&');

		for (var i = 0; i < qs.length; i++) {
			if (qs[i]) {
				if (returnArray) {
					data.push({
						name: qs[i],
						value: null
					});
				} else {
					data[ qs[i] ] = null;
				}
			}
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
		if ( !data || base.isEmptyObject(data) || (base.isArray(data) && !data.length) ) {
			return url;
		}

		if (typeof data !== 'string') { data = this.stringify(data, o); }
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