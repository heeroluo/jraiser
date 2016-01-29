/*!
 * JRaiser 2 Javascript Library
 * ajax - v1.2.3 (2016-01-29T14:50:05+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供异步请求接口
 * @module ajax/1.2.x/
 * @category Utility
 */


var base = require('base/1.1.x/'), qs = require('querystring/1.0.x/');


// 包装一些选项处理
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
		if (options.nocache) { url = qs.append(url, { _: +new Date }); }

		var args = [url, options];
		for (var i = arguments.length - 1; i > 1; i--) {
			args.push(arguments[i]);
		}
		fn.apply(this, args);
	};
}


var scriptOnloadEvent = 'onload' in document.createElement('script') ? 'onload' : 'onreadystatechange',
	head = document.head || document.getElementsByTagName('head')[0];

/**
 * 加载脚本文件
 * @method getScript
 * @param {String} src 文件URL
 * @param {Function(statusText)} [onload] 加载完成（无论成功与否）后的回调函数
 * @return {Object} 请求对象
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
 *   @param {Function(statusText)} [options.onload] 加载完成（无论成功与否）后的回调函数
 * @return {Object} 请求对象
 */
var getScript = wrap(function(src, options, callbackName) {
	// callbackName仅供内部使用

	var script = document.createElement('script'), statusText;

	var onload = base.once(function(status) {
		statusText = status;
		if (options.onload) { options.onload.call(window, statusText); }
	});

	var scriptOnload = function() {
		if ( !script.readyState || /loaded|complete/.test(script.readyState) ) {
			script[scriptOnloadEvent] = null;

			// 移除script节点
			head.removeChild(script);
			script = null;

			// 释放全局回调函数
			if (callbackName) { base.deleteGlobalVar(callbackName); }

			onload('success');
		}
	};

	// JSONP回调函数
	if (callbackName) {
		window[callbackName] = function() {
			if (!statusText && options.onsuccess) {
				options.onsuccess.apply(window, arguments);
			}
		};
	}

	if (options.charset) { script.charset = options.charset; }
	script.async = true;
	script[scriptOnloadEvent] = scriptOnload;
	script.src = src;

	head.insertBefore(script, head.firstChild);

	var timeout = Number(options.timeout);
	if (timeout > 0) {
		setTimeout(function() { onload('timeout'); }, timeout);
	}

	return {
		abort: function() { onload('aborted'); }
	};
});


// JSONP POST
function postScript(action, options, callbackName) {
	var div = document.createElement('div');
	div.style.display = 'none';

	// 生成随机的iframe id/name
	var target = base.randomStr('form-target-');
	// 无刷新POST实现原理为表单提交到iframe
	// iframe内页面调用父页面callback函数
	div.innerHTML =
		'<form action="' + action + '" target="' + target + '" method="post">' +
			'<input type="hidden" name="callback" value="' + callbackName + '" />' +
		'</form>' + 
		'<iframe name="' + target + '" id="' + target + '"></iframe>';

	var form = div.firstChild;
	// 添加数据到表单
	function addDataToForm(value, name) {
		var input = document.createElement('input');
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

	var statusText;

	if (callbackName) {
		window[callbackName] = function() {
			if (!statusText && options.onsuccess) {
				options.onsuccess.apply(window, arguments);
			}
		};
	}

	var onload = base.once(function(status) {
		statusText = status;
		if (options.onload) { options.onload.call(window, statusText); }
	});

	var body = document.body;
	body.insertBefore(div, body.firstChild);
	form.submit();

	function iframeOnload() {
		// 移除提交数据用的表单和iframe
		if (div.parentNode) { div.parentNode.removeChild(div); }
		// 释放全局回调函数
		if (callbackName) { base.deleteGlobalVar(callbackName); }

		onload('success');
	}
	var iframe = form.nextSibling;
	if (iframe.addEventListener) {
		iframe.addEventListener('load', iframeOnload, false);
	} else if (iframe.attachEvent) {
		iframe.attachEvent('onload', iframeOnload);
	}

	var timeout = Number(options.timeout);
	if (timeout > 0) {
		setTimeout(function() { onload('timeout'); }, timeout);
	}

	return {
		abort: function() { onload('aborted'); }
	};
}

// 根据请求地址生成回调函数名
function generateCallbackName(src) {
	var a = document.createElement('a');
	// 利用a元素获取URL的各部分
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

	return callbackName;
}

/**
 * 发送JSONP请求
 * @method jsonp
 * @param {String} src 请求地址
 * @param {Object} [options] 其他选项
 *   @param {Object} [options.data] 发送的数据
 *   @param {String} [options.callbackName] 回调函数名。如不指定则按照特定规则生成
 *   @param {Boolean} [options.nocache=false] 是否在URL中添加时间戳（参数名为“_”）防止缓存。
 *     请求方式为POST时忽略此参数
 *   @param {String} [options.charset] 编码。请求方式为POST时忽略此参数
 *   @param {Number} [options.timeout] 超时时间（毫秒）
 *   @param {String} [options.method='GET'] 请求方式。GET或POST
 *   @param {Function} [options.onsuccess] 回调函数
 *   @param {Function} [options.oncomplete] 加载完成（无论成功与否）后执行的函数
 * @return {Object} 请求对象
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
		if (!isPost) { src = qs.append(src, { callback: callbackName }); }
	}

	options.onload = function() {
		if (options.oncomplete) { options.oncomplete.apply(window, arguments); }
	};

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
 *   @param {Function} [options.onload] 请求完成（无论成功与否）后的回调函数
 */
var getImage = wrap(function(src, options) {
	var img = new Image(), id = Math.random();

	// 把img存起来，以防被回收
	allImages[id] = img;

	img.onload = img.onabort = img.onerror = function() {
		delete allImages[id];
		if (options.onload) { options.onload.call(window); }
	};

	img.src = src;
});


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
	// See line 279
	createXHR: createXHR,

	/**
	 * 获取表单数据
	 * @method serializeForm
	 * @param {NodeList|Element} form 表单
	 * @param {String} [dataType] 返回数据类型，默认为数组。
	 *   参数值为'string'时返回序列化后的字符串；
	 *   参数值为'map'时返回键值对（一键多值时只记录其最后一个值）
	 * @return {Array|Object|String} 表单数据
	 */
	serializeForm: function(form, dataType) {
		// 当传入节点集合时，取第一个节点
		if (!('nodeType' in form) && typeof form.get === 'function') { form = form.get(0); }

		if (form.tagName !== 'FORM') { throw new Error('invalid form element'); }

		var data = [ ], elements = form.elements;
		for (var i = 0, elt; elt = elements[i]; i++) {
			if (elt.disabled || !elt.name) { continue; }
			// 单选框和多选框在选中状态下值才有效
			if (elt.tagName === 'INPUT' &&
				(elt.type === 'radio' || elt.type === 'checkbox') && !elt.checked)
			{
				continue;
			}

			data.push({
				name: elt.name,
				value: elt.value.trim()
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
	},

	// See line 45
	getScript: getScript,

	// See line 214
	jsonp: jsonp,

	/**
	 * 加载样式文件
	 * @method getCSS
	 * @param {String} href 文件URL
	 * @param {Object} [options] 加载设置
	 *   @param {Object} [options.props] 样式节点特性
	 * @return {Element} 样式节点
	 */
	getCSS: function(href, options) {
		return head.appendChild(
			base.extend(
				document.createElement('link'),
				base.extend({
					rel: 'stylesheet',
					type: 'text/css',
					href: href
				}, options.props)
			)
		);
	},

	// See line 255
	getImage: getImage,

	/**
	 * 发送AJAX请求
	 * @method send
	 * @param {String} url 请求URL
	 * @param {Object} [options] 其他选项
	 *   @param {Object} [options.data] 发送的数据
	 *   @param {String} [options.dataType='text'] 返回的数据格式，json、jsonp、xml或text
	 *   @param {String} [options.method='GET'] 请求方式，GET、POST
	 *   @param {Boolean} [options.nocache=false] 是否在URL中添加时间戳（参数名为“_”）防止缓存
	 *   @param {Object} [options.headers] 要设置的HTTP头，dataType为jsonp时无效
	 *   @param {Boolean} [options.async=true] 是否使用异步方式请求，dataType为jsonp时只能为true
	 *	 @param {Number} [options.timeout] 超时时间，仅在异步请求方式时有效
	 *   @param {XMLHttpRequest} [options.xhr] 进行请求的XMLHttpRequest对象，如不指定则自动创建，dataType为jsonp时无效
	 *   @param {String} [options.callbackName] jsonp回调函数名，如不指定则按照特定规则生成。
	 *     仅当dataType为jsonp时有效
	 *   @param {Function(xhr)} [options.onbeforesend] 发送请求前执行的操作，dataType为jsonp时无效
	 *   @param {Function(xhr,statusText)} [options.onload] 请求回应（无论HTTP状态值是什么）后执行的操作，dataType为jsonp时无效
	 *   @param {Function(result,xhr,statusText)} [options.onsuccess] 请求成功后执行的操作
	 *   @param {Function(xhr,statusText)} [options.onerror] 请求失败后执行的操作，dataType为jsonp时无效
	 *   @param {Function(xhr,statusText)} [options.oncomplete] 请求完成且回调结束后执行的操作
	 * @return {XMLHttpRequest} 进行请求的XMLHttpRequest对象
	 */
	/**
	 * 发送AJAX请求
	 * @method send
	 * @param {Object} [options] 选项
	 *   @param {String} [options.url] URL
	 *   @param {Object} [options.data] 发送的数据
	 *   @param {String} [options.dataType='text'] 返回的数据格式，json、jsonp、xml或text
	 *   @param {String} [options.method='GET'] 请求方式，GET、POST
	 *   @param {Boolean} [options.nocache=false] 是否在URL中添加时间戳（参数名为“_”）防止缓存
	 *   @param {Object} [options.headers] 要设置的HTTP头，dataType为jsonp时无效
	 *   @param {Boolean} [options.async=true] 是否使用异步方式请求，dataType为jsonp时只能为true
	 *	 @param {Number} [options.timeout] 超时时间，仅在异步请求方式时有效
	 *   @param {XMLHttpRequest} [options.xhr] 进行请求的XMLHttpRequest对象，
	 *     如不指定则自动创建，dataType为jsonp时无效
	 *   @param {String} [options.callbackName] jsonp回调函数名，如不指定则按照特定规则生成。
	 *     仅当dataType为jsonp时有效
	 *   @param {Function(xhr)} [options.onbeforesend] 发送请求前执行的操作，dataType为jsonp时无效
	 *   @param {Function(xhr,statusText)} [options.onload] 请求回应（无论HTTP状态值是什么）后执行的操作，
	 *     dataType为jsonp时无效
	 *   @param {Function(result,xhr,statusText)} [options.onsuccess] 请求成功后执行的操作
	 *   @param {Function(xhr,statusText)} [options.onerror] 请求失败后执行的操作，dataType为jsonp时无效
	 *   @param {Function(xhr,statusText)} [options.oncomplete] 请求完成且回调结束后执行的操作
	 * @return {XMLHttpRequest} 进行请求的XMLHttpRequest对象
	 */
	send: function(url, options) {
		// 重载，允许把url写到options中
		if (typeof url !== 'string') {
			options = url;
			url = options.url;
		}

		var dataType = options.dataType;
		if (dataType) { dataType = dataType.toLowerCase(); }

		if (dataType === 'jsonp') {
			return jsonp(
				url, base.customExtend({ }, options, {
					whiteList: [
						'data',
						'callbackName',
						'onsuccess',
						'oncomplete',
						'charset',
						'nocache',
						'timeout',
						'method'
					]
				})
			);
		}

		// readystatechange回调函数
		var onreadystatechange = function(e, statusText) {
			var readyState = xhr.readyState;
			if (readyState !== 4 && !statusText) { return; }

			var status = readyState === 4 ? xhr.status : 0, eventType;
			if ( (status >= 200 && status < 300) || status === 1223 || status === 304 ) {
				eventType = 'onsuccess';
				statusText = 'success';
			} else if (status || statusText) { // 忽略status为0的情况
				eventType = 'onerror';
				if (!statusText) { statusText = 'error'; }
			}

			// 触发onload事件
			if (options.onload) { options.onload.call(window, xhr, statusText); }

			if (eventType) {
				var result;
				if (eventType === 'onsuccess') {
					switch (dataType) {
						case 'json':
							var responseText = (xhr.responseText || '').trim();
							if (responseText) {
								try {
									result = JSON.parse(responseText);
								} catch (e) {
									eventType = 'onerror';
									statusText = 'parsererror';
								}
							}
						break;

						case 'xml':
							result = xhr.responseXML;
							if (result && !result.documentElement) { result = null; }
							if (!result) {
								eventType = 'onerror';
								statusText = 'parsererror';
							}
						break;

						default:
							result = xhr.responseText;
					}
				}

				// 触发回调
				var callback = options[eventType], args = [xhr, statusText];
				if (eventType === 'onsuccess') { args.unshift(result); }
				if (callback) { callback.apply(window, args); }
			}

			// 触发oncomplete事件
			if (options.oncomplete) { options.oncomplete.call(window, xhr, statusText); }
		};

		// 修正参数值
		var method = (options.method || 'GET').toUpperCase(),
			async = typeof options.async === 'boolean' ? async : true,
			data = options.data,
			headers = options.headers || { },
			xhr = options.xhr || createXHR();

		if (data) {
			data = qs.stringify(data);
			switch (method) {
				case 'GET':
					url = qs.append(url, data);
					data = null;
				break;

				case 'POST':
					base.customExtend(headers, {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					}, {
						overwrite: false
					});
				break;
			}
		}

		if (options.nocache) {
			// 添加timestamp防止缓存
			url = qs.append(url, { _: +new Date });
		}

		if (async) {
			// 超时设置仅在异步情况下有效
			var timeout = Number(options.timeout);
			if (timeout > 0) {
				setTimeout(function() {
					if (xhr.readyState !== 4) {
						xhr.abort();
						onreadystatechange.call(xhr, null, 'timeout');
					}
				}, timeout);
			}

			xhr.onreadystatechange = onreadystatechange;

			if ('onerror' in xhr) {
				xhr.onerror = function() {
					onreadystatechange.call(xhr, null, 'error');
				};
			}
		}

		if (options.username) {
			xhr.open(method, url, async, options.username, options.password);
		} else {
			xhr.open(method, url, async);
		}

		if (!headers['X-Requested-With']) {
			headers['X-Requested-With'] = 'XMLHttpRequest';
		}
		for (var i in headers) {
			if ( headers.hasOwnProperty(i) ) {
				xhr.setRequestHeader(i, headers[i]);
			}
		}

		// 触发beforesend事件，可以在此事件中配置XMLHttpRequest对象
		options.onbeforesend && options.onbeforesend.call(window, xhr);

		xhr.send(data || '');

		if (!async) { onreadystatechange.call(xhr); }

		return xhr;
	}
};

});