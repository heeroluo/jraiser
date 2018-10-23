/**
 * 本模块提供Promise化的异步请求接口。
 * @module ajax@1.5
 * @category Utility
 */

var base = require('../../base/1.2/base');
var Promise = require('../../promise/1.2/promise');
var timespan = require('../../timespan/1.0/timespan');
var qs = require('../../querystring/1.1/querystring');

var win = window;
var doc = win.document;
var head = doc.head;


// 创建放弃请求的错误
var CANCEL_MESSAGE = 'Cancel';
function createCancelError() {
	var err = new Error(CANCEL_MESSAGE);
	err.isAJAXCancel = true;
	return err;
}

// 创建超时的错误
var TIMEOUT_MESSAGE = 'Timeout';
function createTimeoutError() {
	var err = new Error(TIMEOUT_MESSAGE);
	err.isAJAXTimeout = true;
	return err;
}


// 包装getScript、getImage的一些相同参数的处理
function wrap(fn) {
	return function(url, options) {
		if (typeof options === 'function') {
			options = { onload: options };
		} else {
			options = base.extend({ }, options);
		}

		if (options.timeout) {
			options.timeout = timespan.parse(options.timeout);
		}

		var data = base.extend({ }, options.data);
		// 添加timestamp防止缓存
		if (options.nocache) { data._ = +new Date; }
		// 添加GET参数
		url = qs.append(url, options.data);

		var args = [url, options];
		// 把后续参数放回参数数组
		for (var i = 2; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		return fn.apply(this, args);
	};
}


// 记录通过哪个事件监听script加载完成
var SCRIPT_ONLOAD = 'onload' in doc.createElement('script') ?
	'onload' :
	'onreadystatechange';

/**
 * 加载脚本文件。
 * @method getScript
 * @param {String} src 文件URL。
 * @param {Object} [options] 其他选项。
 *   @param {Object} [options.data] 发送的数据。
 *   @param {Boolean} [options.nocache=false] 是否在URL中添加时间戳（参数名为“_”）防止缓存。
 *   @param {String} [options.charset] 文件编码。
 *   @param {Number|String} [options.timeout] 超时时间，可传入数字（毫秒）或timespan模块支持的格式。
 *   @param {Function(abort)} [options.receiveCancel] 接收放弃请求方法的函数。
 * @return {Object} 加载脚本文件的promise。
 */
var getScript = exports.getScript = wrap(function(src, options, callbackName) {
	// callbackName参数仅供内部使用

	return new Promise(function(resolve, reject) {
		// 用于保存节点
		var script;
		// 用于保存超时检测计时器id
		var timeoutTimer;
		// 无法取消script节点的请求，通过这个变量控制不执行回调函数
		var cancelled;

		function cancel(createError) {
			if (!cancelled && script) {
				cancelled = true;
				script[SCRIPT_ONLOAD]();
				if (createError) { reject(createError()); }
			}
		}

		// JSONP回调函数
		if (callbackName) {
			win[callbackName] = function() {
				// 此处先于 SCRIPT_ONLOAD 执行
				if (!cancelled) { resolve(base.toArray(arguments)); }
			};
		}

		script = doc.createElement('script');
		if (options.charset) { script.charset = options.charset; }
		script.async = true;

		script[SCRIPT_ONLOAD] = function() {
			// script节点不存在，说明已经清理过
			if (!script) { return; }

			// 加载完成后，执行清理并解决promise
			if (cancelled || !script.readyState || /loaded|complete/.test(script.readyState)) {
				// 移除script节点
				script[SCRIPT_ONLOAD] = null;
				head.removeChild(script);
				script = null;

				// 清理超时检测计时器
				if (timeoutTimer) { clearTimeout(timeoutTimer); }

				// 释放JSONP全局回调
				if (callbackName) { base.deleteGlobalVar(callbackName); }

				// 已放弃时不应resolve
				if (!cancelled) { resolve(); }
			}
		};

		script.src = src;
		// 插入到HTML文档中
		if (head.firstChild) {
			head.insertBefore(script, head.firstChild);
		} else {
			head.appendChild(script);
		}

		if (options.receiveCancel) {
			options.receiveCancel.call(win, function() {
				cancel(createCancelError);
			});
		}

		// 超时处理
		var timeout = Number(options.timeout);
		if (timeout > 0) {
			timeoutTimer = setTimeout(function() {
				cancel(createTimeoutError);
			}, timeout);
		}
	});
});


// JSONP POST
// 实现原理为表单提交到iframe，iframe内页面调用parent[callback]
function postScript(action, options, callbackName) {
	return new Promise(function(resolve, reject) {
		// 用于保存元素
		var div, iframe;
		// 用于保存超时检测计时器
		var timeoutTimer;
		// 无法取消iframe节点的请求，通过这个变量控制不执行回调函数
		var cancelled;

		// JSONP回调函数
		if (callbackName) {
			win[callbackName] = function() {
				if (!cancelled) { resolve(Array.from(arguments)); }
			};
		}

		// 加载完成后执行清理，并解决promise
		function iframeOnload() {
			// 辅助元素不存在，说明已经清理过
			if (!div) { return; }

			// 释放事件回调
			if (iframe.removeEventListener) {
				iframe.removeEventListener('load', iframeOnload, false);
			} else if (iframe.detachEvent) {
				iframe.detachEvent('onload', iframeOnload);
			}

			// 移除辅助元素
			if (div.parentNode) { div.parentNode.removeChild(div); }
			div = iframe = null;

			// 清理超时检测计时器
			if (timeoutTimer) { clearTimeout(timeoutTimer); }

			// 释放全局回调函数
			if (callbackName) { base.deleteGlobalVar(callbackName); }

			// 已放弃时不应resolve
			if (!cancelled) { resolve(); }
		}

		function cancel(createError) {
			if (!cancelled && div) {
				cancelled = true;
				iframeOnload();
				if (createError) { reject(createError()); }
			}
		}

		div = doc.createElement('div');
		div.style.display = 'none';

		var targetId = base.rndStr('form-target-');
		div.innerHTML =
			'<form action="' + action + '" target="' + targetId + '" method="post">' +
				'<input type="hidden" name="callback" value="' + callbackName + '" />' +
			'</form>' +
			'<iframe name="' + targetId + '" id="' + targetId + '"></iframe>';

		var form = div.firstChild;
		// 添加数据到表单
		function addDataToForm(value, name) {
			// 如果是数组，则递归调用写入
			if (Array.isArray(value)) {
				value.forEach(function(subValue) {
					addDataToForm(subValue, name);
				});
			}

			var input = doc.createElement('input');
			input.type = 'hidden';
			input.name = name;
			input.value = value;
			form.appendChild(input);
		}
		// 写入到表单隐藏控件
		base.each(options.data, addDataToForm);

		// 辅助元素添加到body
		var body = doc.body;
		if (body.firstChild) {
			body.insertBefore(div, body.firstChild);
		} else {
			body.appendChild(div);
		}

		form.submit();

		iframe = form.nextSibling;
		if (iframe.addEventListener) {
			iframe.addEventListener('load', iframeOnload, false);
		} else if (iframe.attachEvent) {
			iframe.attachEvent('onload', iframeOnload);
		}

		if (options.receiveCancel) {
			options.receiveCancel.call(win, function() {
				cancel(createCancelError);
			});
		}

		// 超时处理
		var timeout = Number(timespan.parse(options.timeout || 0));
		if (timeout > 0) {
			timeoutTimer = setTimeout(function() {
				cancel(createTimeoutError);
			}, timeout);
		}
	});
}


// 自动生成JSONP回调函数名
function generateCallbackName(src) {
	// 利用a元素获取URL的各部分
	var a = doc.createElement('a');
	a.href = src;

	var pathname = a.pathname.split('/');
	pathname = (pathname[pathname.length - 1] || 'index').replace(/\.\w+$/, '');

	// 取主机和路径的最后一段作为前缀
	var prefix = 'jsonp_callback_' + (a.host + '_' + pathname).replace(/\W+/g, '');
	var callbackName = prefix;
	var counter = 1;

	// 如果不存在名字跟前缀一样的全局变量，就把前缀作为函数名
	// 否则在后面拼接数字
	while (win[callbackName] != null) {
		callbackName = prefix + '_' + counter++;
	}

	return callbackName;
}


/**
 * 发送JSONP请求。
 * @method jsonp
 * @param {String} src 请求地址。
 * @param {Object} [options] 其他选项。
 *   @param {String} [options.method='GET'] 请求方式，GET或POST。
 *   @param {Object} [options.data] 发送的数据。
 *   @param {String} [options.callbackName] 回调函数名，如不指定则按照特定规则生成。
 *   @param {Boolean} [options.nocache=false] 是否在URL中添加时间戳（参数名为“_”）防止缓存。
 *     请求方式为POST时忽略此参数。
 *   @param {String} [options.charset] 编码。请求方式为POST时忽略此参数。
 *   @param {Number|String} [options.timeout] 超时时间，可传入数字（毫秒）或timespan模块支持的格式。
 *   @param {Function(abort)} [options.receiveCancel] 接收放弃请求方法的函数。
 * @return {Promise} 加载JSONP的promise。
 */
var jsonp = exports.jsonp = function(src, options) {
	// 复制一份，避免影响原选项对象
	options = base.extend({ }, options);

	var callbackName;
	var isPost = String(options.method).toUpperCase() === 'POST';
	// 识别URL中的回调函数名
	if (/[?&]callback=([^&]+)/.test(src)) {
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
};


// 用于把image对象存起来，以防被回收
var allImages = { };

/**
 * 请求图片。
 * @method getImage
 * @param {String} src 图片URL。
 * @param {Object} [options] 其他选项。
 *   @param {Object} [options.data] 发送的数据。
 *   @param {Boolean} [options.nocache=false] 是否在URL中添加时间戳（参数名为“_”）防止缓存。
 * @return {Promise} 加载图片的promise。
 */
exports.getImage = wrap(function(src) {
	var id = Math.random();

	return new Promise(function(resolve, reject) {
		var img = new Image();
		// 把img存起来，以防被回收
		allImages[id] = img;

		img.onload = function() { resolve(src); };
		img.onabort = img.onerror = function() {
			reject(new Error('Failed to load image'));
		};
		img.src = src;
	})['finally'](function() {
		delete allImages[id];
	});
});


/**
 * 创建XMLHttpRequest对象。
 * @method createXHR
 * @return {XMLHttpRequest} XMLHttpRequest对象。
 */
var createXHR = exports.createXHR = win.ActiveXObject && doc.documentMode < 9 ?
	function() { return new win.ActiveXObject('Microsoft.XMLHTTP'); } :
	function() { return new XMLHttpRequest(); };

// 判断是否跨域
function isCrossDomain(url) {
	var div = doc.createElement('div');
	div.innerHTML = '<a href="' + url + '"></a>';

	var a = div.firstChild;
	// 此语句用于修复旧IE下的一些BUG
	a.href = a.href; // eslint-disable-line

	var result = a.host !== win.location.host;

	div = a = null;

	return result;
}

// 由响应头中的Content-Type解析出数据类型
var reParseMIMEType = /(?:^|;\s*)(?:application|text)\/([a-z]+)/i;
function parseMIMEType(contentType) {
	if (reParseMIMEType.test(contentType)) {
		return RegExp.$1.toLowerCase();
	}
}

/**
 * 发送AJAX请求。
 * @method send
 * @param {String} [url] 请求URL。此参数也可以作为options参数的属性。
 * @param {Object} [options] 其他选项。
 *   @param {String} [options.url] 请求URL。
 *   @param {Object} [options.data] 发送的数据。
 *   @param {String} [options.dataType] 返回的数据格式：json、jsonp、xml或text。
 *     默认根据响应头的Content-Type自动识别。
 *   @param {String} [options.method='GET'] 请求方式：GET、POST、PUT或DELETE。
 *   @param {Boolean} [options.nocache=false] 是否在URL中添加时间戳（参数名为“_”）防止缓存。
 *   @param {Object} [options.headers] 要设置的HTTP头，dataType为jsonp时无效。
 *	 @param {Number|String} [options.timeout] 超时时间，仅在异步请求时有效，可传入数字（毫秒）或timespan模块支持的格式。
 *   @param {Boolean} [options.withCredentials] 是否在跨域请求中发送凭据(cookie等）。
 *   @param {Boolean} [options.async=true] 是否使用异步方式请求，dataType为jsonp时只能为true。
 *   @param {Function(xhr)} [options.beforeSend] 发送请求前执行的回调函数，dataType为jsonp时无效。
 *   @param {Function(abort)} [options.receiveCancel] 接收放弃请求方法的函数。
 *   @param {String} [options.callbackName] jsonp回调函数名，如不指定则按照特定规则生成。
 *     仅当dataType为jsonp时有效。
 * @return {Promise} 发送请求的promise。
 */
exports.send = function(url, options) {
	// 重载，允许把url写到options中
	if (typeof url !== 'string') {
		options = url;
		url = options.url;
	}
	options = options || { };

	var dataType = String(options.dataType || '').toLowerCase();
	if (dataType === 'jsonp') {
		return jsonp(url, options);
	}

	return new Promise(function(resolve, reject) {
		// 创建用于发送请求的XMLHttpRequest
		var xhr = createXHR();
		// 用于保存超时检测计时器id
		var timeoutTimer;
		// 记录是否已取消请求或请求失败
		var aborted;

		function abort(createError) {
			if (!aborted && xhr.readyState !== 4) {
				xhr.abort();
				aborted = true;
				if (createError) { reject(createError); }
			}
		}

		// XMLHttpRequest状态改变时的回调函数
		// 也用于直接触发错误回调
		function onreadystatechange() {
			if (aborted) { return; }

			var readyState = xhr.readyState;
			var status = readyState === 4 ? xhr.status : 0;
			if (readyState !== 4 || !status) { return; }

			if (timeoutTimer) { clearTimeout(timeoutTimer); }

			var response, errMsg;
			dataType = dataType || parseMIMEType(xhr.getResponseHeader('Content-Type'));
			switch (dataType) {
				case 'json':
					var responseText = (xhr.responseText || '').trim();
					if (responseText) {
						try {
							response = JSON.parse(responseText);
						} catch (e) {
							errMsg = 'Invalid JSON format';
						}
					}
					break;

				case 'xml':
					response = xhr.responseXML;
					if (!response || !response.documentElement) {
						errMsg = 'Invalid XML format';
					}
					break;

				default:
					response = xhr.responseText;
			}

			var isErrorStatus = !(
				(status >= 200 && status < 300) || status === 1223 || status === 304
			);
			var error;
			if (isErrorStatus) {
				error = new Error('Error (HTTP status code: ' + status + ')');
				error.code = status;
				error.data = response;
			} else if (errMsg) {
				error = new Error(errMsg);
			}

			if (error) {
				reject(error);
			} else {
				resolve(response);
			}
		}

		var method = (options.method || 'GET').toUpperCase();
		var async = typeof options.async === 'boolean' ? options.async : true;
		var data = options.data;
		var headers = options.headers || { };

		if (data) {
			data = qs.stringify(data);
			if (method === 'GET') {
				url = qs.append(url, data);
				data = null;
			} else {
				headers['Content-Type'] = headers['Content-Type'] ||
					'application/x-www-form-urlencoded; charset=UTF-8';
			}
		}

		// 添加timestamp防止缓存
		if (options.nocache) {
			url = qs.append(url, { _: +new Date });
		}

		if (async) {
			// 超时设置仅在异步模式下有效
			var timeout = Number(timespan.parse(options.timeout || 0));
			if (timeout > 0) {
				timeoutTimer = setTimeout(function() {
					abort(createTimeoutError);
				}, timeout);
			}

			xhr.onreadystatechange = onreadystatechange;

			if ('onerror' in xhr) {
				xhr.onerror = function() {
					if (timeoutTimer) { clearTimeout(timeoutTimer); }
					aborted = true;
					reject(new Error('Network error'));
				};
			}
		}

		if (options.username) {
			xhr.open(method, url, async, options.username, options.password);
		} else {
			xhr.open(method, url, async);
		}

		if (isCrossDomain(url)) {
			xhr.withCredentials = !!options.withCredentials;
		}

		base.each(headers, function(value, key) {
			xhr.setRequestHeader(key, value);
		});

		// 触发beforeSend，可以在此函数中再次设置XMLHttpRequest对象
		if (options.beforeSend) {
			options.beforeSend.call(win, xhr);
		}

		xhr.send(data || '');

		if (options.receiveCancel) {
			options.receiveCancel.call(win, function() {
				abort(createCancelError);
			});
		}

		if (!async) { onreadystatechange.call(xhr); }
	});
};


/**
 * 获取表单数据
 * @method serializeForm
 * @param {NodeList|Element} form 表单
 * @return {Object<key,value>} 表单数据
 */
exports.serializeForm = function(form) {
	// 为NodeList类型时，取第一个节点
	if (!('nodeType' in form) && typeof form.get === 'function') {
		form = form.get(0);
	}

	if (form.tagName !== 'FORM') {
		throw new Error('Form must be an HTML form element');
	}

	var data = {};
	var elements = form.elements;
	var i, elt, name, value, len = elements.length;
	for (i = 0; i < len; i++) {
		elt = elements[i];
		name = elt.name;
		// name属性为空或disabled的元素不被提交
		if (elt.disabled || !name) { continue; }

		// 单选框和多选框的值在选中状态下才有效
		if (elt.tagName === 'INPUT' &&
			(elt.type === 'radio' || elt.type === 'checkbox') &&
			!elt.checked
		) { continue; }

		value = elt.type === 'password' ? elt.value : elt.value.trim();
		if (data.hasOwnProperty(name)) {
			if (!Array.isArray(data[name])) {
				data[name] = [data[name]];
			}
			data[name].push(value);
		} else {
			data[name] = value;
		}
	}

	return data;
};