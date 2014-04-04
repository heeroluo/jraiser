/*!
 * JRaiser 2 Javascript Library
 * ajax - v1.1.1 (2013-09-07T12:10:17+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供异步请求接口
 * @module ajax/1.1.x/
 * @category Utility
 */

var base = require('base/1.0.x/'),
	qs = require('querystring/1.0.x/'),
	JSON = require('json/1.0.x/');


// IE10同时支持两种事件，但是当JS有缓存的时候，会先触发onreadystatechange再执行JS程序
var scriptOnloadEvent = 'onload' in document.createElement('script') ?
	'onload' : 'onreadystatechange';

// 加载js或css文件统一接口
function loadFile(url, opts) {
	var head = document.getElementsByTagName('head')[0] || document.documentElement, node;

	function onload() {
		var readyState = this.readyState;
		if (!readyState || readyState === 'loaded' || readyState === 'complete') {
			this[scriptOnloadEvent] = null;
			// 执行回调
			opts.onload && opts.onload.call(this);
			
			// 加载js后可以移除节点，但加载css后不可以
			if (this.nodeName === 'SCRIPT') { this.parentNode.removeChild(this); }
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

	node[scriptOnloadEvent] = onload;

	// 插入到页面中使其生效
	if (document.body) {
		head.appendChild(node);
	} else {
		head.insertBefore(node, head.firstChild);
	}
}


// JSONP回调函数计数器
var jsonpCallbackCounter = 0, randomNum = parseInt(Math.random() * 100000);
// 生成JSONP回调函数名
function generateCallbackName() {
	var callbackName;
	do {
		callbackName = 'jsonp_callback' + randomNum + '_' + (++jsonpCallbackCounter);
	} while(window[callbackName]);

	return callbackName;
}


/**
 * 创建XMLHttpRequest对象
 * @method createXHR
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
	/**
	 * 获取表单数据
	 * @method serializeForm
	 * @param {NodeList|Element} form 表单
	 * @param {String} [dataType] 返回数据类型，默认为数组，参数值为'string'时返回序列化后的字符串
	 * @return {Array<Object<name,value>>|String} 表单数据
	 */
	serializeForm: function(form, dataType) {
		if (!('nodeType' in form) && typeof form.get === 'function') { form = form.get(0); }
		if (form.tagName !== 'FORM') { throw new Error('invalid form element'); }

		var data = [ ], elements = form.elements;
		for (var i = 0, elt; elt = elements[i]; i++) {
			if (elt.disabled || !elt.name) { continue; }
			if (elt.tagName === 'INPUT' &&
				(elt.type === 'radio' || elt.type === 'checkbox') && !elt.checked) {
				continue;
			}

			data.push({
				name: elt.name,
				value: elt.value.trim()
			});
		}

		if (dataType === 'string') { data = qs.stringify(data); }

		return data;
	},

	// See line 77
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
	 *   @param {Object} [opts.data] 发送的数据
	 *   @param {Function} [opts.onload] 加载完成后的回调函数
	 *   @param {String} [opts.charset]  文件编码，当页面编码与样式表编码不同时指定
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
	 *   @param {Object} [opts.data] 发送的数据
	 *   @param {Function} [opts.onload] 加载完成后的回调函数
	 *   @param {String} [opts.charset] 文件编码，当页面编码与样式表编码不同时指定
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
			nocache: true
		}, opts);

		loadFile(src, opts);
	},

	/**
	 * 发送JSONP请求
	 * @method jsonp
	 * @param {String} url URL
	 * @param {Object} [opts] 其他参数
	 *   @param {String} [opts.callbackName] 回调函数名，如不指定则随机生成
	 *   @param {Function} [opts.onsuccess] 回调函数
	 *   @param {Function} [opts.oncomplete] 请求完成后的执行的函数
	 *   @param {Object} [opts.data] 发送的数据
	 *   @param {String} [opts.charset] 文件编码，当页面编码与样式表编码不同时指定
	 *   @param {Boolean} [opts.nocache=true] 是否在URL中添加timestamp参数（参数名为“_”）以防止缓存
	 */
	jsonp: function(url, opts) {
		opts = opts || { };
		opts.data = opts.data || { };

		var callback = opts.callbackName || generateCallbackName(),
			oncomplete = opts.oncomplete;

		if ( base.isArray(opts.data) ) {
			opts.data.push({
				name: 'callback',
				value: callback
			});
		} else {
			opts.data.callback = callback;
		}

		// 创建全局回调函数
		window[callback] = opts.onsuccess;

		opts.onload = function() {
			// 执行callback后将其清除
			if (window[callback]) {
				try {
					delete window[callback];
				} catch(e) {
					window[callback] = null;
				}
			}

			if (oncomplete) { oncomplete.apply(this, arguments); }
		};

		this.getScript(url, opts);
	},

	/**
	 * 发送AJAX请求
	 * @method send
	 * @param {String} url URL
	 * @param {Object} [opts] 其他参数
	 *   @param {String} [opts.url] URL
	 *   @param {String} [opts.dataType='text'] 返回的数据格式，json、jsonp、xml或text
	 *   @param {String} [opts.method='GET'] 请求方式，GET、POST或HEAD，dataType为jsonp时只能为GET
	 *   @param {Object} [opts.data] 发送的数据
	 *   @param {String} [opts.callbackName] jsonp回调函数名，如不指定则随机生成，仅当dataType为jsonp时有效
	 *   @param {Boolean} [opts.nocache=true] 是否在URL中添加timestamp参数（参数名为“_”）以防止缓存
	 *   @param {Object} [opts.headers] 要设置的HTTP头，dataType为jsonp时无效
	 *   @param {Boolean} [opts.async=true] 是否使用异步方式请求，dataType为jsonp时只能为true
	 *	 @param {Number} [opts.timeout] 超时时间，仅在异步方式且dataType不是jsonp时有效
	 *   @param {XMLHttpRequest} [opts.xhr] 进行请求的XMLHttpRequest对象，如不指定则自动创建，dataType为jsonp时无效
	 *   @param {Function(xhr)} [opts.onbeforesend] 发送请求前执行的操作，dataType为jsonp时无效
	 *   @param {Function(xhr,statusText)} [opts.onload] 请求回应（无论HTTP状态值是什么）后执行的操作，dataType为jsonp时无效
	 *   @param {Function(result,xhr,statusText)} [opts.onsuccess] 请求成功后执行的操作
	 *   @param {Function(xhr,statusText)} [opts.onerror] 请求失败后执行的操作，dataType为jsonp时无效
	 *   @param {Function(xhr,statusText)} [opts.oncomplete] 请求完成且回调结束后执行的操作
	 * @return {XMLHttpRequest} 进行请求的XMLHttpRequest对象，dataType为jsonp时无返回值
	 */
	/**
	 * 发送AJAX请求
	 * @method send
	 * @param {Object} [opts] 其他参数同上
	 * @return {XMLHttpRequest} 进行请求的XMLHttpRequest对象，jsonp时无返回值
	 */
	send: function(url, opts) {
		// 重载，允许把url写到opts中
		if (typeof url !== 'string') {
			opts = url;
			url = opts.url;
		}
		if (opts.dataType) { opts.dataType = opts.dataType.toLowerCase(); }

		if (opts.dataType === 'jsonp') {
			return this.jsonp( url, base.mix({ }, opts, {
				whiteList: ['callbackName', 'onsuccess', 'oncomplete', 'data', 'charset', 'nocache'],
				ignoreNull: true
			}) );
		}

		// readystatechange回调函数
		var onreadystatechange = function(e, statusText) {
			var readyState = xhr.readyState;
			if (readyState !== 4 && !statusText) { return; }

			var status = readyState === 4 ? xhr.status : 0, evtType;
			if ( (status >= 200 && status < 300) || status === 1223 || status === 304 ) {
				evtType = 'onsuccess';
				statusText = 'success';
			} else if (status || statusText) { // 忽略status为0的情况
				evtType = 'onerror';
				if (!statusText) { statusText = 'error'; }
			}

			// 触发onload事件
			if (opts.onload) { opts.onload.call(window, xhr, statusText); }

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

				// 触发回调
				var callback = opts[evtType], args = [xhr, statusText];
				if (evtType === 'onsuccess') { args.unshift(result); }
				if (callback) { callback.apply(window, args); }
			}

			// 触发oncomplete事件
			if (opts.oncomplete) { opts.oncomplete.call(window, xhr, statusText); }
		};

		
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
						onreadystatechange.call(xhr, null, 'timeout');
					}
				}, opts.timeout);
			}

			xhr.onreadystatechange = onreadystatechange;
		}

		if (opts.username) {
			xhr.open(method, url, async, opts.username, opts.password);
		} else {
			xhr.open(method, url, async);
		}

		if (!headers['X-Requested-With']) {
			headers['X-Requested-With'] = 'XMLHttpRequest';
		}
		for (var i in headers) {
			xhr.setRequestHeader(i, headers[i]);
		}

		// 触发beforesend事件，可以在此事件中再次修改opts
		opts.onbeforesend && opts.onbeforesend.call(window, xhr);

		xhr.send(data || '');

		if (!async) { onreadystatechange.call(xhr); }

		return xhr;
	}
};

});