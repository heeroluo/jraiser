/**
 * 本模块提供URL参数序列化与反序列化接口。
 * @module querystring/1.1/querystring
 * @category Utility
 */

var base = require('../../base/1.2/base');


/**
 * 把查询字符串反序列化为数据。
 * @method parse
 * @param {String} [str] 查询字符串。
 * @param {Object} [options] 参数。
 *   @param {Function} [options.decode=decodeURIComponent] 解码函数。
 *   @param {Boolean} [options.ignoreEmpty] 是否忽略空值（包括null、undefined、空字符串）。
 * @return {Object} 解析结果。
 */
exports.parse = function(str, options) {
	if (typeof str !== 'string') { return {}; }

	options = base.extend({
		decode: decodeURIComponent
	}, options);

	var result = {};

	str.split('&').forEach(function(pair) {
		if (!pair) { return; }
		pair = pair.split('=');
		var key = options.decode(pair[0]);
		var value = options.decode(pair[1] || '');

		// 忽略空值的情况
		if (!value && options.ignoreEmpty) { return; }

		if (result.hasOwnProperty(key)) {
			if (!Array.isArray(result[key])) {
				result[key] = [result[key]];
			}
			result[key].push(value);
		} else {
			result[key] = value;
		}
	});

	return result;
};


/**
 * 把数据序列化为查询字符串。
 * @method stringify
 * @param {Object} data 数据。
 * @param {Object} [options] 参数。
 *   @param {Function} [options.encode=encodeURIComponent] 编码函数。
 *   @param {Boolean} [options.ignoreEmpty] 是否忽略空值（包括null、undefined、空字符串）。
 * @return {String} 序列化结果。
 */
var stringify = exports.stringify = function(data, options) {
	if (typeof data !== 'object') { return ''; }

	options = base.extend({
		encode: encodeURIComponent
	}, options);

	var result = [];
	function addToResult(key, value) {
		if (value == null) { value = ''; }
		// 忽略空值的情况
		if (value === '' && options.ignoreEmpty) { return; }

		result.push(
			options.encode(key) + '=' + options.encode(value)
		);
	}

	var key, value;

	// 避免在循环中生成匿名函数，提到循环外
	function loopItem(item) { addToResult(key, item); }

	for (key in data) {
		if (data.hasOwnProperty(key)) {
			value = data[key];
			if (Array.isArray(value)) {
				value.forEach(loopItem);
			} else {
				addToResult(key, value);
			}
		}
	}

	return result.join('&');
};


/**
 * 把数据序列化为查询字符串后添加到指定URL。
 * @method append
 * @param {String} url 指定URL。
 * @param {Object|String} data 数据。
 * @param {Object} [options] 参数。
 *   @param {Function} [options.encode=encodeURIComponent] 编码函数。
 *   @param {Boolean} [options.ignoreEmpty] 是否忽略空值（包括null、undefined、空字符串）。
 * @return {String} 处理后的URL。
 */
exports.append = function(url, data, options) {
	// 数据为空，直接返回url
	if (!(
		(typeof data === 'string' && data !== '') ||
		(typeof data === 'object' && !base.isEmptyObject(data))
	)) {
		return url;
	}

	// 如果url中包含hash，要先剪出来
	var temp = url.indexOf('#');
	var hash = '';
	if (temp !== -1) {
		hash = url.substring(temp, url.length);
		url = url.substring(0, temp);
	}

	// 移除位于末尾的?和&，方便拼接
	url = url.replace(/[?&]$/, '');

	if (typeof data !== 'string') {
		data = stringify(data, options);
	} else {
		// 移除位于开头的?和&，方便拼接
		data = data.replace(/^[?&]/, '');
	}

	return url + (url.indexOf('?') !== -1 ? '&' : '?') + data + hash;
};