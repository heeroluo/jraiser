/*!
 * jRaiser 2 Javascript Library
 * ajax - v1.0.0 (2013-01-21T14:19:04+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供异步请求接口
 * @module ajax/1.0.x/
 * @category Utility
 */

var base = require('base/1.0.x/'),
	qs = require('querystring/1.0.x/'),
	JSON = require('json/1.0.x/');


// 加载js或css文件统一接口
function loadFile(url, opts) {
	var head = document.getElementsByTagName('head')[0] || document.documentElement, node;

	function onload() {
		var readyState = this.readyState;
		if (!readyState || readyState === 'loaded' || readyState === 'complete') {
			this.onload = this.onreadystatechange = null;
			// 执行回调
			opts.onload && opts.onload.call(this);
			// 加载js后可以移除节点，但加载css后不可以
			if (opts.removable) { this.parentNode.removeChild(this); }
		}

		node = null;
	}

	// 添加get参数
	if (opts.data) { url = qs.append(url, opts.data); }

	// 添加timestamp防止缓存
	if (opts.nocache) { url = qs.append(url, { _: +new Date }); }

	// 设置节点属性
	node = base.mix(document.createElement(opts.nodeName), opts.nodeAttrs, {
		ignoreNull: true
	});
	node[opts.urlAttrName] = url;

	node.onload = node.onreadystatechange = onload;

	// 插入到页面中使其生效
	if (document.body) {
		head.appendChild(node);
	} else {
		head.insertBefore(node, head.firstChild);
	}
}


/**
 * 创建XMLHttpRequest对象
 * @method createXhr
 * @return {XMLHttpRequest} XMLHttpRequest对象
 */
var createXHR = window.ActiveXObject ? function() {
	try {
		return new ActiveXObject('Microsoft.XMLHTTP');
	} catch (e) { }
} : function() {
	try {
		return new XMLHttpRequest();
	} catch (e) { }
};


return {
	// See line 61
	createXHR: createXHR,
	
	/**
	 * 加载样式表文件
	 * @method getCSS
	 * @param {String} href 文件URL
	 * @param {Function} [onload] 加载完成后的回调函数
	 */
	/**
	 * 加载样式表文件
	 * @method getCSS
	 * @param {String} href 文件URL
	 * @param {Object} [opts] 加载设置
	 *   @param {String} [opts.media] 样式对何种设备有效（link标签的media属性）
	 *   @param {String} [opts.charset]  文件编码，当页面编码与样式表编码不同时指定
	 *   @param {Object} [opts.data] 附加到URL的GET参数
	 *   @param {Function} [opts.onload] 加载完成后的回调函数
	 *   @param {Boolean} [opts.nocache=false] 是否在URL中添加timestamp参数（参数名为“_”）以防止缓存
	 */
	getCSS: function(href, opts) {
		if (typeof opts === 'function') {
			opts = { onload: opts };
		} else if (!opts) {
			opts = { };
		}

		opts = base.extend({
			nodeName: 'link',
			urlAttrName: 'href',
			nodeAttrs: {
				rel: 'stylesheet',
				type: 'text/css',
				media: opts.media,
				charset: opts.charset
			}
		}, opts);

		loadFile(href, opts);
	},

	/**
	 * 加载脚本文件
	 * @method getScript
	 * @param {String} src 文件URL
	 * @param {Function} [onload] 加载完成后的回调函数
	 */
	/**
	 * 加载脚本文件
	 * @method getScript
	 * @param {String} src 文件URL
	 * @param {Object} [opts] 加载设置
	 *   @param {String} [opts.charset] 文件编码，当页面编码与样式表编码不同时指定
	 *   @param {Object} [opts.data] 附加到URL的GET参数
	 *   @param {Function} [opts.onload] 加载完成后的回调函数
	 *   @param {Boolean} [opts.nocache=true] 是否在URL中添加timestamp参数（参数名为“_”）以防止缓存
	 */
	getScript: function(src, opts) {
		if (typeof opts === 'function') {
			opts = { onload: opts };
		} else if (!opts) {
			opts = { };
		}

		opts = base.extend({
			nodeName: 'script',
			urlAttrName: 'src',
			nodeAttrs: {
				type: 'text/javascript',
				charset: opts.charset,
				async: true
			},
			removable: true,
			nocache: true
		}, opts);

		loadFile(src, opts);
	},

	/**
	 * 发送JSONP请求
	 * @method jsonp
	 * @param {String} url URL
	 * @param {String} callback 回调函数名
	 */
	/**
	 * 发送JSONP请求
	 * @method jsonp
	 * @param {String} url URL
	 * @param {Object} [opts] 其他参数
	 *   @param {String} [opts.callback] 回调函数名
	 *   @param {Boolean} [opts.removeCallback] 加载完成后是否移除全局回调函数
	 *   @param {String} [opts.charset] 文件编码，当页面编码与样式表编码不同时指定
	 *   @param {Object} [opts.data] 附加到URL的GET参数
	 *   @param {Boolean} [opts.nocache=true] 是否在URL中添加timestamp参数（参数名为“_”）以防止缓存
	 */
	jsonp: function(url, opts) {
		if (typeof opts === 'string') {
			opts = { callback: opts };
		} else if (!opts) {
			opts = { };
		}

		if (opts.callback) {
			opts.data = opts.data || { };
			opts.data.callback = opts.callback;
			if (opts.removeCallback !== false) {
				opts.onload = function() {
					if (window[opts.callback]) {
						try {
							delete window[opts.callback];
						} catch(e) {
							window[opts.callback] = null;
						}
					}
				};
			} else {
				delete opts.onload;
			}
		}

		this.getScript(url, opts);
	},
	
	/**
	 * 发送AJAX请求
	 * @method send
	 * @param {String} url URL
	 * @param {Object} [opts] 其他参数
	 *   @param {String} [opts.url] URL
	 *   @param {String} [opts.method='GET'] 发送方法，GET、POST或HEAD
	 *   @param {Object} [opts.data] 发送的数据
	 *   @param {Boolean} [opts.nocache=true] 是否在URL中添加timestamp参数（参数名为“_”）以防止缓存
	 *   @param {Object} [opts.headers] 要设置的HTTP头
	 *   @param {Boolean} [opts.async=true] 是否使用异步方式请求
	 *	 @param {Number} [opts.timeout] 超时时间，仅在异步方式下有效
	 *   @param {XMLHttpRequest} [opts.xhr] 进行请求的XMLHttpRequest对象，如不指定则自动创建
	 *   @param {String} [opts.dataType='text'] 返回的数据格式，json、xml或text
	 *   @param {Function(xhr,opts)} [opts.onbeforesend] 发送数据前执行的操作
	 *   @param {Function(xhr,statusText)} [opts.onload] 请求完成（不论成功与否）后执行的操作
	 *   @param {Function(result,xhr,statusText)} [opts.onsuccess] 请求成功时执行的操作
	 *   @param {Function(xhr,statusText)} [opts.onerror] 请求失败时执行的操作
	 *   @param {Function(xhr,statusText)} [opts.onend] 回调处理结束（不论成功与否）后执行的操作
	 * @return {XMLHttpRequest} 进行请求的XMLHttpRequest对象
	 */
	/**
	 * 发送AJAX请求
	 * @method send
	 * @param {Object} [opts] 其他参数同上
	 * @return {XMLHttpRequest} 进行请求的XMLHttpRequest对象
	 */
	send: function(url, opts) {
		// readystatechange回调函数
		function callback(e, statusText) {
			var readyState = xhr.readyState;
			if (readyState !== 4 && !statusText) { return; }

			var status = readyState === 4 ? xhr.status : 0, evtType;
			if ( (status >= 200 && status < 300) || status === 1223 || status === 304 ) {
				evtType = 'onsuccess';
			} else if (status || statusText) { // 忽略status为0的情况
				evtType = 'onerror';
				if (!statusText) { statusText = 'error'; }
			}

			if (evtType) {
				var result;
				if (evtType === 'onsuccess') {
					switch (opts.dataType) {
						case 'json':
							var responseText = (xhr.responseText || '').trim();
							if (responseText) {
								try {
									result = JSON.parse(responseText);
								} catch (e) {
									evtType = 'onerror';
									statusText = 'parsererror';
								}
							}
						break;
						
						case 'xml':
							result = xhr.responseXML;
							if (result && !result.documentElement) { result = null; }
							if (!result) {
								evtType = 'onerror';
								statusText = 'parsererror';
							}
						break;
						
						default:
							result = xhr.responseText;
					}
				}

				// 触发onload事件
				opts.onload && opts.onload.call(window, xhr, statusText);

				// 触发回调
				var callback = opts[evtType], args = [xhr, statusText];
				if (evtType === 'onsuccess') { args.unshift(result); }
				callback && callback.apply(window, args);

				// 触发onend事件
				opts.onend && opts.onend.call(window, xhr, statusText);
			}
		}

		// 重载，允许把url写到opts中
		if (typeof url !== 'string') {
			opts = url;
			url = opts.url;
		}

		// 触发beforesend事件，可以在此事件中再次修改opts
		opts.onbeforesend && opts.onbeforesend.call(window, xhr, opts);
		
		// 修正设置值
		var method = (opts.method || 'GET').toUpperCase(),
			async = typeof opts.async === 'boolean' ? async : true,
			data = opts.data,
			headers = opts.headers || { },
			xhr = opts.xhr || createXHR();

		if (data) {
			data = qs.stringify(data);
			switch (method) {
				case 'GET':
					url = qs.append(url, data);
					data = null;
				break;

				case 'POST':
					base.mix(headers, {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					}, {
						overwrite: false
					});
				break;
			}
		}
		
		if (opts.nocache !== false) {
			// 添加timestamp防止缓存
			url = qs.append(url, { _: +new Date });
		}

		if (async) {
			// 超时设置仅在异步情况下有效
			if (opts.timeout > 0) {
				setTimeout(function() {
					if (xhr.readyState !== 4) {
						xhr.abort();
						callback.call(xhr, null, 'timeout');
					}
				}, opts.timeout);
			}

			xhr.onreadystatechange = callback;
		}

		if (opts.username) {
			xhr.open(method, url, async, opts.username, opts.password);
		} else {
			xhr.open(method, url, async);
		}

		if (!headers['X-Requested-With']) { headers['X-Requested-With'] = 'XMLHttpRequest'; }
		for (var i in headers) {
			xhr.setRequestHeader(i, headers[i]);
		}

		xhr.send(data || '');

		if (!async) { callback.call(xhr); }

		return xhr;
	}
};

});