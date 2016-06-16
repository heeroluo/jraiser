/*!
 * JRaiser 2 Javascript Library
 * ajax@1.3.0 (2016-06-15T17:37:27+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供Promise化的异步请求接口
 * @module ajax@1.3.x, ajax/1.3.x/
 * @category Utility
 */

var base = require('base/1.1.x/'),
	qs = require('querystring/1.0.x/'),
	Promise = require('promise/1.0.x/'),
	doc = window.document,
	head = doc.head || doc.getElementsByTagName('head')[0];


// 包装getScript、getCSS、getImage的一些共同选项处理
function wrap(fn) {
	return function(url, options) {
		if (typeof options === 'function') {
			options = { onload: options };
		} else if (!options) {
			options = { };
		}

		// 添加GET参数
		url = qs.append(url, options.data);

		// 添加timestamp防止缓存
		if (options.nocache) {
			url = qs.append(url, { _: +new Date });
		}

		var args = [url, options];
		// 把后续参数放回参数数组
		for (var i = 2; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		
		return fn.apply(this, args);
	};
}


// 记录通过哪个事件监听script加载完成
var scriptOnloadEvent = 'onload' in doc.createElement('script') ? 'onload' : 'onreadystatechange';

/**
 * 加载脚本文件
 * @method getScript
 * @param {String} src 文件URL
 * @return {Promise} 加载脚本文件的promise
 */
/**
 * 加载脚本文件
 * @method getScript
 * @param {String} src 文件URL
 * @param {Object} [options] 其他选项
 *   @param {Object} [options.data] 发送的数据
 *   @param {Boolean} [options.nocache=false] 是否在URL中添加时间戳（参数名为“_”）防止缓存
 *   @param {String} [options.charset] 文件编码
 *   @param {Number} [options.timeout] 超时时间（毫秒）
 * @return {Object} 加载脚本文件的promise
 */
var getScript = exports.getScript = wrap(function(src, options, callbackName) {
	// callbackName参数仅供内部使用

	return new Promise(function(resolve, reject, setCanceler) {
		// 用于记录是否放弃请求：
		//   script节点没有abort方法，无法做到真正的放弃，
		//   只能通过这个变量控制不执行回调函数
		var isAborted;
		function abort() {
			isAborted = true;
			if (script) { script[scriptOnloadEvent](); }
		}

		setCanceler(abort);

		// JSONP回调函数
		if (callbackName) {
			window[callbackName] = function() {
				if (!isAborted && options.onsuccess) {
					options.onsuccess.apply(window, arguments);
				}
			};
		}

		var script = doc.createElement('script');
		if (options.charset) { script.charset = options.charset; }
		script.async = true;
		script[scriptOnloadEvent] = function() {
			if ( isAborted || !script.readyState || /loaded|complete/.test(script.readyState) ) {
				// 移除script节点
				script[scriptOnloadEvent] = null;
				head.removeChild(script);
				script = null;

				// 清除超时计时器
				if (timeoutTimer) { clearTimeout(timeoutTimer); }

				// 释放JSONP回调函数
				if (callbackName) { base.deleteGlobalVar(callbackName); }

				if (!isAborted) { resolve(); }
			}
		};
		script.src = src;
		if (head.firstChild) {
			head.insertBefore(script, head.firstChild);
		} else {
			head.appendChild(script);
		}

		// 超时处理
		var timeout = Number(options.timeout), timeoutTimer;
		if (timeout > 0) {
			timeoutTimer = setTimeout(function() {
				abort();
				reject( new Error('Timeout') );
			}, timeout);
		}
	});
});


// JSONP POST
// 实现原理为表单提交到iframe，iframe内页面调用parent[callback]
function postScript(action, options, callbackName) {
	return new Promise(function(resolve, reject, setCanceler) {
		// 用于记录是否放弃请求：
		//   iframe节点没有abort方法，无法做到真正的放弃，
		//   只能通过这个变量控制不执行回调函数
		var isAborted;
		function abort() {
			isAborted = true;
			iframeOnload();
		}

		setCanceler(abort);

		// JSONP回调函数
		if (callbackName) {
			window[callbackName] = function() {
				if (!isAborted && options.onsuccess) {
					options.onsuccess.apply(window, arguments);
				}
			};
		}

		var div = doc.createElement('div');
		div.style.display = 'none';

		// 生成随机的iframe id/name
		var targetId = base.randomStr('form-target-');

		div.innerHTML =
			'<form action="' + action + '" target="' + targetId + '" method="post">' +
				'<input type="hidden" name="callback" value="' + callbackName + '" />' +
			'</form>' + 
			'<iframe name="' + targetId + '" id="' + targetId + '"></iframe>';

		var form = div.firstChild;
		// 添加数据到表单
		function addDataToForm(value, name) {
			var input = doc.createElement('input');
			input.type = 'hidden';
			input.name = name;
			input.value = value;
			form.appendChild(input);
		}
		base.each(
			options.data,
			base.isArray(options.data) ?
				function(d) { addDataToForm(d.value, d.name); } :
				addDataToForm
		);

		var body = doc.body;
		body.insertBefore(div, body.firstChild);
		form.submit();

		var iframe = form.nextSibling;
		function iframeOnload() {
			// 释放事件回调
			if (iframe) {
				if (iframe.removeEventListener) {
					iframe.removeEventListener('load', iframeOnload, false);
				} else if (iframe.detachEvent) {
					iframe.detachEvent('onload', iframeOnload);
				}
			}
			// 移除提交数据用的元素
			if (div && div.parentNode) { div.parentNode.removeChild(div); }
			div = iframe = null;

			// 释放全局回调函数
			if (callbackName) { base.deleteGlobalVar(callbackName); }

			if (!isAborted) { resolve(); }
		}
		if (iframe.addEventListener) {
			iframe.addEventListener('load', iframeOnload, false);
		} else if (iframe.attachEvent) {
			iframe.attachEvent('onload', iframeOnload);
		}

		// 超时处理
		var timeout = Number(options.timeout);
		if (timeout > 0) {
			setTimeout(function() {
				if (!isAborted) {
					abort();
					reject( new Error('Timeout') );
				}
			}, timeout);
		}
	});
}


// 用于自动生成JSONP回调函数名
function generateCallbackName(src) {
	// 利用a元素获取URL的各部分
	var a = doc.createElement('a');
	a.href = src;

	var pathname = a.pathname.split('/');
	pathname = (pathname[pathname.length - 1] || 'index').replace(/\.\w+$/, '');

	// 取主机和路径的最后一段作为前缀
	var prefix = 'jsonp_callback_' + (a.host + '_' + pathname).replace(/\W+/g, ''),
		callbackName = prefix,
		counter = 1;

	// 如果不存在名字跟前缀一样的全局变量，就把前缀作为函数名
	// 否则在后面拼接数字
	while (window[callbackName] != null) {
		callbackName = prefix + '_' + counter++;
	}

	a = null;

	return callbackName;
}

/**
 * 发送JSONP请求
 * @method jsonp
 * @param {String} src 请求地址
 * @param {Object} [options] 其他选项
 *   @param {Object} [options.data] 发送的数据
 *   @param {Function} [options.onsuccess] 回调函数
 *   @param {String} [options.callbackName] 回调函数名。如不指定则按照特定规则生成
 *   @param {Boolean} [options.nocache=false] 是否在URL中添加时间戳（参数名为“_”）防止缓存。
 *     请求方式为POST时忽略此参数
 *   @param {String} [options.charset] 编码。请求方式为POST时忽略此参数
 *   @param {Number} [options.timeout] 超时时间（毫秒）
 *   @param {String} [options.method='GET'] 请求方式。GET或POST
 * @return {Promise} 加载JSONP文件的promise
 */
function jsonp(src, options) {
	// 复制一份，避免影响原选项对象
	options = base.extend({ }, options);

	var callbackName, isPost = String(options.method).toUpperCase() === 'POST';
	// 识别URL中的回调函数名
	if ( /[?&]callback=([^&]+)/.test(src) ) {
		callbackName = RegExp.$1;
	} else {
		// 使用指定的callback或重新生成一个
		callbackName = options.callbackName || generateCallbackName(src);
		// 非POST时要把callback参数加到URL上
		if (!isPost) {
			src = qs.append(src, { callback: callbackName });
		}
	}

	return isPost ?
		postScript(src, options, callbackName) :
		getScript(src, options, callbackName);
}


var allImages = { };
/**
 * 请求图片
 * @method getImage
 * @param {String} src 图片URL
 * @param {Object} [options] 其他选项
 *   @param {Object} [options.data] 发送的数据
 *   @param {Boolean} [options.nocache=false] 是否在URL中添加时间戳（参数名为“_”）防止缓存
 * @return {Promise} 加载图片的Promise
 */
var getImage = wrap(function(src, options) {
	var id = Math.random();

	return new Promise(function(resolve, reject) {
		var img = new Image();
		// 把img存起来，以防被回收
		allImages[id] = img;

		img.onload = function() { resolve(src); };
		img.onabort = img.onerror = function() {
			reject( new Error('Failed to load image') );
		};
		img.src = src;
	})['finally'](function() {
		delete allImages[id];
	});
});


/**
 * 加载样式表文件（无回调）
 * @method getCSS
 * @param {String} href 文件URL
 * @param {Object} [options] 加载设置
 *   @param {Object} [options.props] 样式节点特性
 * @return {Element} 样式节点
 */
function getCSS(href, options) {
	options = options || { };
	return head.appendChild(
		base.extend(
			doc.createElement('link'),
			base.extend({
				rel: 'stylesheet',
				type: 'text/css',
				href: href
			}, options.props)
		)
	);
}


/**
 * 创建XMLHttpRequest对象
 * @method createXHR
 * @return {XMLHttpRequest} XMLHttpRequest对象
 */
var createXHR = window.ActiveXObject && !(doc.documentMode >= 9) ?
	function() { return new ActiveXObject('Microsoft.XMLHTTP'); } :
	function() { return new XMLHttpRequest(); };

// 判断是否跨域
function isCrossDomain(url) {
	var div = doc.createElement('div');
	div.innerHTML = '<a href="' + url + '"></a>';

	var a = div.firstChild;
	// 此语句用于修复旧IE下的一些BUG
	a.href = a.href;

	var result = a.host !== window.location.host;

	div = a = null;

	return result;
}

// 由响应头中的Content-Type解析出数据类型
var re_parseMIMEType = /(?:^|;\s*)(?:application|text)\/([a-z]+)/i;
function parseMIMEType(contentType) {
	if ( re_parseMIMEType.test(contentType) ) { return RegExp.$1.toLowerCase(); }
}

/**
 * 发送AJAX请求
 * @method send
 * @param {String} url 请求URL
 * @param {Object} [options] 其他选项
 *   @param {Object} [options.data] 发送的数据
 *   @param {String} [options.dataType='text'] 返回的数据格式：json、jsonp、xml或text
 *   @param {String} [options.method='GET'] 请求方式：GET或POST
 *   @param {Boolean} [options.nocache=false] 是否在URL中添加时间戳（参数名为“_”）防止缓存
 *   @param {Object} [options.headers] 要设置的HTTP头，dataType为jsonp时无效
 *   @param {Boolean} [options.async=true] 是否使用异步方式请求，dataType为jsonp时只能为true
 *	 @param {Number} [options.timeout] 超时时间，仅在异步请求方式时有效
 *   @param {XMLHttpRequest} [options.xhr] 进行请求的XMLHttpRequest对象，如不指定则自动创建，dataType为jsonp时无效
 *   @param {Boolean} [options.withCredentials=true] 是否在跨域请求中发送凭据(cookie等）
 *   @param {String} [options.callbackName] jsonp回调函数名，如不指定则按照特定规则生成。
 *     仅当dataType为jsonp时有效
 *   @param {Function(xhr)} [options.beforeSend] 发送请求前执行的操作，dataType为jsonp时无效
 * @return {Promise} 发送请求的promise
 */
/**
 * 发送AJAX请求
 * @method send
 * @param {Object} [options] 选项
 *   @param {String} [options.url] URL
 *   @param {Object} [options.data] 发送的数据
 *   @param {String} [options.dataType='text'] 返回的数据格式：json、jsonp、xml或text
 *   @param {String} [options.method='GET'] 请求方式：GET或POST
 *   @param {Boolean} [options.nocache=false] 是否在URL中添加时间戳（参数名为“_”）防止缓存
 *   @param {Object} [options.headers] 要设置的HTTP头，dataType为jsonp时无效
 *   @param {Boolean} [options.async=true] 是否使用异步方式请求，dataType为jsonp时只能为true
 *	 @param {Number} [options.timeout] 超时时间，仅在异步请求方式时有效
 *   @param {XMLHttpRequest} [options.xhr] 进行请求的XMLHttpRequest对象，如不指定则自动创建，dataType为jsonp时无效
 *   @param {Boolean} [options.withCredentials=true] 是否在跨域请求中发送凭据(cookie等）
 *   @param {String} [options.callbackName] jsonp回调函数名，如不指定则按照特定规则生成。
 *     仅当dataType为jsonp时有效
 *   @param {Function(xhr)} [options.beforeSend] 发送请求前执行的操作，dataType为jsonp时无效
 * @return {Promise} 发送请求的promise
 */
function send(url, options) {
	// 重载，允许把url写到options中
	if (typeof url !== 'string') {
		options = url;
		url = options.url;
	}
	options = options || { };

	var dataType = String(options.dataType || '').toLowerCase();

	if (dataType === 'jsonp') {
		return jsonp(
			url, base.customExtend({ }, options, {
				whiteList: [
					'data',
					'callbackName',
					'onsuccess',
					'charset',
					'nocache',
					'timeout',
					'method'
				]
			})
		);
	}

	return new Promise(function(resolve, reject, setCanceler) {
		// 创建用于发送请求的XMLHttpRequest
		var xhr = options.xhr || createXHR();

		setCanceler(function() { xhr.abort(); });

		// XMLHttpRequest状态改变时的回调函数
		// 也用于直接触发错误回调
		function onreadystatechange(e, errorMsg) {
			var readyState = xhr.readyState, status = readyState === 4 ? xhr.status : 0;
			if ( (readyState !== 4 || !status) && !errorMsg ) { return; }

			if ( !errorMsg && !( (status >= 200 && status < 300) || status === 1223 || status === 304 ) ) {
				errorMsg = 'Error (HTTP status code: ' + status + ')';
			}

			var response;
			if (!errorMsg) {
				// 通过Content-Type识别数据类型
				dataType = dataType || parseMIMEType( xhr.getResponseHeader('Content-Type') );

				switch (dataType) {
					case 'json':
						var responseText = (xhr.responseText || '').trim();
						if (responseText) {
							try {
								response = JSON.parse(responseText);
							} catch (e) {
								errorMsg = 'Invalid JSON format';
							}
						}
						break;

					case 'xml':
						response = xhr.responseXML;
						if (!response || !response.documentElement) {
							errorMsg = 'Invalid XML format';
						}
						break;

					default:
						response = xhr.responseText;
				}
			}

			if (errorMsg) {
				reject( new Error(errorMsg) );
			} else {
				resolve([response, xhr]);
			}
		}

		// 修正参数值
		var method = (options.method || 'GET').toUpperCase(),
			async = typeof options.async === 'boolean' ? async : true,
			data = options.data,
			headers = options.headers || { };

		if (data) {
			data = qs.stringify(data);
			switch (method) {
				case 'GET':
					url = qs.append(url, data);
					data = null;
					break;

				case 'POST':
					headers['Content-Type'] = headers['Content-Type'] ||
						'application/x-www-form-urlencoded; charset=UTF-8';
					break;
			}
		}

		// 添加timestamp防止缓存
		if (options.nocache) {
			url = qs.append(url, { _: +new Date });
		}

		if (async) {
			// 超时设置仅在异步情况下有效
			var timeout = Number(options.timeout);
			if (timeout > 0) {
				setTimeout(function() {
					if (xhr.readyState !== 4) {
						xhr.abort();
						onreadystatechange.call(xhr, null, 'Timeout');
					}
				}, timeout);
			}

			xhr.onreadystatechange = onreadystatechange;

			if ('onerror' in xhr) {
				xhr.onerror = function() {
					onreadystatechange.call(xhr, null, 'Network error');
				};
			}
		}

		if (options.username) {
			xhr.open(method, url, async, options.username, options.password);
		} else {
			xhr.open(method, url, async);
		}

		headers['X-Requested-With'] = headers['X-Requested-With'] || 'XMLHttpRequest';
		for (var i in headers) {
			if ( headers.hasOwnProperty(i) ) {
				xhr.setRequestHeader(i, headers[i]);
			}
		}

		if (isCrossDomain(url) && options.withCredentials !== false) {
			xhr.withCredentials = true;
		}

		// 触发beforeSend，可以在此函数中再次调用XMLHttpRequest对象
		if (options.beforeSend) {
			options.beforeSend.call(window, xhr);
		}

		xhr.send(data || '');

		if (!async) { onreadystatechange.call(xhr); }
	});
}


/**
 * 获取表单数据
 * @method serializeForm
 * @param {NodeList|Element} form 表单
 * @param {String} [dataType] 返回的数据类型：
 *   string表示字符串；
 *   map表示键值对（一键多值时只记录其最后一个值）。
 *   默认为数组。
 * @return {Array|Object|String} 表单数据
 */
function serializeForm(form, dataType) {
	// 为NodeList类型时，取第一个节点
	if (!('nodeType' in form) && typeof form.get === 'function') { form = form.get(0); }

	if (form.tagName !== 'FORM') { throw new Error('Form must be an HTML form element'); }

	var data = [ ], elements = form.elements;
	for (var i = 0, elt; elt = elements[i]; i++) {
		// name属性为空或disabled的元素不被提交
		if (elt.disabled || !elt.name) { continue; }
		// 单选框和多选框的值在选中状态下才有效
		if (elt.tagName === 'INPUT' &&
			(elt.type === 'radio' || elt.type === 'checkbox') && !elt.checked)
		{
			continue;
		}

		data.push({
			name: elt.name,
			// 密码保持原来的值，其他去除两端的空白
			value: elt.type === 'password' ? elt.value : elt.value.trim()
		});
	}

	switch (dataType) {
		case 'string':
			data = qs.stringify(data);
			break;

		case 'map':
			var map = { };
			for (var i = 0; i < data.length; i++) {
				map[data[i].name] = data[i].value;
			}
			data = map;
			break;
	}

	return data;
}


return {
	getScript: getScript,
	getImage: getImage,
	getCSS: getCSS,
	jsonp: jsonp,
	createXHR: createXHR,
	send: send,
	serializeForm: serializeForm
};

});