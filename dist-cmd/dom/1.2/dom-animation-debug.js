define(function(require, exports, module) {
'use strict'; 

/**
 * 本模块提供节点动画接口。
 * @module dom/1.2/dom-animation
 * @catgory Infrastructure
 * @ignore
 */

var base = require('../../base/1.2/base');
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


// 动画队列
var AnimationQueue = base.createClass(function() {
	// 队列数组
	this._queue = [];
	// 当前正在执行的动画任务id
	this._taskId = null;
}, {
	add: function(executor) {
		this._queue.push(executor);
		this.execNext();
	},

	stop: function(clearQueue, jumpToEnd) {
		if (clearQueue) { this._queue = []; }
		if (this._taskId) {
			tween.remove(this._taskId, jumpToEnd);
			this._taskId = null;
		}
	},

	execNext: function() {
		var t = this;
		// taskId不为null意味着正在执行动画
		if (t._taskId || !this._queue.length) { return; }

		var executor = this._queue.shift();
		executor.exec(function(taskId) {
			// 记录动画任务id，用于停止补间
			t._taskId = taskId;
		}).then(
			executor.resolve,
			executor.reject
		)['finally'](function() {
			t._taskId = null;
			t.execNext();
		});
	}
});


// 用于记录节点的动画队列
var animationSpace = domData.createDataSpace({ cloneable: false });

// 动画队列数据项的key
var ANIMATION_QUEUE_KEY = 'animationQueue';

// 停止动画
function stop(node, clearQueue, jumpToEnd) {
	if (!domBase.isHTMLElement(node)) { return; }

	var queue = animationSpace.get(node, ANIMATION_QUEUE_KEY);
	if (queue) {
		queue.stop(clearQueue, jumpToEnd);
		if (clearQueue) { animationSpace.clear(node); }
	}
}

// 开始动画
function start(node, endStyle, options) {
	return new Promise(function(resolve, reject) {
		if (!domBase.isHTMLElement(node)) {
			resolve();
			return;
		}

		options = options || { };

		var queue = animationSpace.get(node, ANIMATION_QUEUE_KEY);
		if (!queue) {
			queue = new AnimationQueue();
			animationSpace.set(node, ANIMATION_QUEUE_KEY, queue);
		}

		queue.add({
			resolve: resolve,
			reject: reject,
			exec: function(receiveId) {
				// 获取节点的当前样式
				var startStyle = getRelatedStyle(node, endStyle);
				// 修正最终样式的样式值
				endStyle = fixEndStyle(endStyle, startStyle);

				return tween.create({
					startValue: startStyle,
					endValue: endStyle,
					duration: options.duration,
					easing: options.easing,
					receiveId: receiveId,
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
				}).then(function() {
					// 执行回调函数
					if (options.oncomplete) { options.oncomplete.call(node); }
				});
			}
		});
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

		var promises = Promise.all(
			this.map(function(node) {
				return start(node, endStyle, options);
			})
		);

		if (returnPromise) {
			return promises;
		} else {
			// 防止控制台出现错误日志
			promises['catch'](function() {});

			return this;
		}
	},

	/**
	 * 停止当前所有节点的动画。
	 * @method stop
	 * @for NodeList
	 * @param {Boolean} [clearQueue=false] 是否清理节点的动画队列。
	 * @param {Boolean} [jumpToEnd=false] 是否跳跃到当前动画的最后一帧。
	 * @return {NodeList} 当前节点集合。
	 */
	stop: function(clearQueue, jumpToEnd) {
		this.forEach(function(node) { stop(node, clearQueue, jumpToEnd); });
		return this;
	}
};

});