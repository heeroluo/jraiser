/**
 * 本模块提供节点动画接口。
 * @module dom/1.2/dom-animation
 * @catgory Infrastructure
 * @ignore
 */

var Promise = require('../../promise/1.2/promise');
var tween = require('../../tween/1.0/tween');
var domBase = require('./dom-base');
var domData = require('./dom-data');
var domStyle = require('./dom-style');
var domOffset = require('./dom-offset');


// 一些解析样式需要用到的正则表达式
var rNumber = /^[+-]?\d+(?:\.\d+)?[^\s]*$/;
var rScroll = /^scroll(Top|Left)$/;
var rColor = /color$/i;
var rSharpColor = /^#[0-9a-f]{6}$/i;
var rRGBColor = /^rgb\((\d+),\s(\d+),\s(\d+)\)$/;

// 转换样式值为可用于动画运算的数值
function parseStyleValue(name, value) {
	if (typeof value === 'string') {
		if (rNumber.test(value)) {
			value = parseFloat(value, 10) || 0;
		} else if (rColor.test(name)) {
			if (rSharpColor.test(value)) {
				// #开头的十六进制颜色值转数组
				value = [
					parseInt(value.substr(1, 2), 16),
					parseInt(value.substr(3, 2), 16),
					parseInt(value.substr(5, 2), 16)
				];
			} else if (rRGBColor.test(value)) {
				// rgb(R,G,B)颜色值转数组
				value = [
					Number(RegExp.$1),
					Number(RegExp.$2),
					Number(RegExp.$3)
				];
			}
		} else {
			value = value.toLowerCase();
		}
	}

	return value;
}

// 获取与最终样式对应的初始样式值
function getRelatedStyle(node, refStyle) {
	var style = { }, val;
	for (var name in refStyle) {
		if (refStyle.hasOwnProperty(name)) {
			if (name === 'width' || name === 'height') {
				val = domStyle.getSize(node, name);
			} else if (rScroll.test(name)) {
				val = domOffset.getScroll(node, RegExp.$1);
			} else {
				val = parseStyleValue(name, domStyle.getStyle(node, name));
			}
			style[name] = val;
		}
	}

	return style;
}

// 修正最终样式
function fixEndStyle(endStyle, startStyle) {
	var name, style = { };
	for (name in endStyle) {
		if (endStyle.hasOwnProperty(name)) {
			style[name] = domStyle.rRelNumber.test(endStyle[name]) ?
				(parseFloat(startStyle[name], 10) || 0) + Number(RegExp.$1 + RegExp.$2) :
				parseStyleValue(name, endStyle[name]);
		}
	}

	return style;
}


// 用于记录节点正在执行的动画的任务id
var idSpace = domData.createDataSpace({ cloneable: false });

// 停止动画
function stop(node, jumpToEnd) {
	if (!domBase.isHTMLElement(node)) { return; }

	var taskId = idSpace.get(node, 'taskId');
	if (taskId) {
		tween.remove(taskId, jumpToEnd);
		idSpace.clear(node);
	}
}

// 开始动画
function start(node, endStyle, options) {
	if (!domBase.isHTMLElement(node)) { return; }

	options = options || { };

	// 获取节点的当前样式
	var startStyle = getRelatedStyle(node, endStyle);
	// 修正最终样式的样式值
	endStyle = fixEndStyle(endStyle, startStyle);

	// 停止已有的动画，防止冲突
	stop(node);

	return tween.create({
		startValue: startStyle,
		endValue: endStyle,
		duration: options.duration,
		easing: options.easing,
		receiveId: function(id) {
			// 记录任务id（停止动画时清除）
			idSpace.set(node, 'taskId', id);
		},
		frame: function(value, key) {
			if (rScroll.test(key)) {
				domOffset.setScroll(node, RegExp.$1, value);
			} else {
				domStyle.setStyle(
					node,
					key,
					rColor.test(key) ?
						'rgb(' + value.map(function(v) {
							// RGB只能用整数表示
							return Math.min(255, Math.round(v));
						}).join(', ') + ')' :
						value
				);
			}
		},
		onprogress: function() {
			if (options.onprogress) { options.onprogress.apply(node, arguments); }
		}
	})['finally'](function() {
		// 动画执行完成，清理任务id
		idSpace.clear(node);
		// 执行回调函数
		if (options.oncomplete) { options.oncomplete.call(node); }
	});
}


exports.shortcuts = {
	/**
	 * 对当前所有节点执行动画。
	 * @method animate
	 * @for NodeList
	 * @param {Object} endStyle 最终样式。
	 * @param {Object} [options] 其他参数。
	 *   @param {Number} [options.duration=400] 动画时长（毫秒）。
	 *   @param {String|Function} [options.easing='linear'] 缓动函数。
	 *   @param {Function(value,progress,remaining)} [options.onprogress] 动画每一帧执行后的回调函数。
	 *   @param {Function} [options.oncomplete] 动画执行完成后的回调函数。
	 * @param {Boolean} [returnPromise] 为true时返回动画promise。
	 * @return {NodeList|Promise} 当前节点集合或动画promise。
	 */
	animate: function(endStyle, options, returnPromise) {
		// 重载，允许省略options
		if (typeof options === 'boolean') {
			returnPromise = options;
			options = null;
		}

		for (var name in endStyle) {
			if (endStyle.hasOwnProperty(name)) {
				endStyle[name] = parseStyleValue(name, endStyle[name]);
			}
		}

		var promises = this.map(function(node) {
			return start(node, endStyle, options);
		});

		if (returnPromise) {
			return Promise.all(promises);
		} else {
			return this;
		}
	},

	/**
	 * 停止当前所有节点的动画。
	 * @method stop
	 * @for NodeList
	 * @param {Boolean} [jumpToEnd=false] 是否跳跃到最后一帧。
	 * @return {NodeList} 当前节点集合。
	 */
	stop: function(jumpToEnd) {
		this.forEach(function(node) { stop(node, jumpToEnd); });
		return this;
	}
};