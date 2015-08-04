/*!
 * JRaiser 2 Javascript Library
 * animation - v1.0.1 (2015-08-04T17:44:55+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供基于缓动函数实现动画的相关接口
 * @module animation/1.0.x/
 * @category Infrastructure
 */


var base = require('base/1.1.x/');


var easings = {
	// 以下缓动函数来自jQuery
	linear: function(p) {
		return p;
	},
	swing: function(p) {
		return 0.5 - Math.cos(p * Math.PI) / 2;
	},

	// 以下缓动函数来自jQuery Easing (http://gsgd.co.uk/sandbox/jquery/easing/)
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - this.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return this.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return this.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
};


// 计算动画过程中的值
function computeStepValue(startValue, endValue, totalTime, easing, progress) {
	var stepValue;

	if (typeof startValue === 'number' && typeof endValue === 'number') {
		stepValue = startValue + (endValue - startValue) *
			easing.call(easings, progress, totalTime * progress, 0, 1, totalTime);
	} else if ( base.isArray(startValue) && base.isArray(endValue) ) {
		stepValue = startValue.map(function(v, i) {
			return computeStepValue(v, endValue[i], totalTime, easing, progress);
		});
	}

	return stepValue != null ? stepValue : endValue;
}


// 动画队列
var queue = [ ];

// 记录轮询动画队列操作的计时器id，以便在动画队列为空时停止轮询
var timerId;

// 动画任务自增id
var autoId = 0;

// 检查动画队列是否为空
function checkQueueEmpty() {
	if (!queue.length) {
		// 动画队列为空，停止轮询
		clearInterval(timerId);
		timerId = null;
	}
}

// 查找某个动画任务在队列中的位置
// 动画id是不断自增的，也就是说动画队列是有序的，因此搜索某个任务可以用二分搜索
function indexOfTask(taskId) {
	var min = 0, max = queue.length - 1, mid;

	while (min <= max) {
		mid = parseInt( (min + max) / 2 );
		if (queue[mid].id == taskId) {
			return mid;
		} else if (queue[mid].id > taskId) {
			max = mid - 1;
		} else {
			min = mid + 1;
		}
	}

	return -1;
}

// 执行动画
function exec(animation, percentage, key) {
	var startValue = animation.startValue, endValue = animation.endValue, nextValue;

	if ( base.isObject(startValue) && base.isObject(endValue) ) {
		nextValue = { };
		for (key in startValue) {
			nextValue[key] = exec({
				startValue: startValue[key],
				endValue: endValue[key],
				duration: animation.duration,
				easing: animation.easing,
				step: animation.step
			}, percentage, key);
		}
	} else {
		// 动画最后一帧时直接使用最终值（小数计算可能有误差，这样最保险），否则使用计算出来的值
		nextValue = percentage >= 1 ? endValue : computeStepValue(
			startValue,
			endValue,
			animation.duration,
			animation.easing,
			percentage
		);

		animation.step.call(window, nextValue, key);
	}

	return nextValue;
}

// 运行动画
function runAnimation(animation, remaining) {
	var percentage = 1 - (remaining / animation.duration || 0),
		stepValue = exec(animation, percentage);

	if (animation.onprogress) {
		animation.onprogress.call(window, stepValue, percentage, remaining);
	}

	if (percentage >= 1) {
		if (animation.oncomplete) {
			animation.oncomplete.call(window);
		}
	}

	return percentage;
}

// 运行动画队列
function runAnimationQueue() {
	var i = 0, animation, remaining, percentage, stepValue;

	while (animation = queue[i]) {
		percentage = runAnimation(
			animation,
			Math.max(0, animation.startTime + animation.duration - new Date)
		);

		if (percentage >= 1) {
			// 移除已完成动画
			queue.splice(i, 1);
		} else {
			i++;
		}
	}

	checkQueueEmpty();
}


return {
	/**
	 * 添加动画任务
	 * @method add
	 * @param {Object} options 动画参数
	 *   @param {Number|Array} options.startValue 初始值
	 *   @param {Number|Array} options.endValue 结束值
	 *   @param {Number} [options.duration=400] 持续时间
	 *   @param {Function} [options.easing='linear'] 缓动函数
	 *   @param {Function(value,key)} options.step 对动画过程中每个值进行处理的函数
	 *   @param {Function(value,progress,remaining)} [options.onprogress] 动画每一帧执行后的回调函数
	 *   @param {Function(taskId)} [options.oncomplete] 动画执行完成后的回调函数
	 * @return {Number} 动画任务id
	 */
	add: function(options) {
		var easing = options.easing || 'linear';
		if (typeof easing !== 'function') {
			var easingType = String(easing);
			easing = easings[easingType];
			if (!easing) {
				throw new Error('easing "' + easingType + '" does not exist');
			}
		}

		var taskId = ++autoId;

		queue.push(
			base.customExtend({
				easing: easing,
				id: taskId,
				duration: options.duration || 400,
				startTime: +new Date
			}, options, {
				overwrite: false
			})
		);

		if (!timerId) { timerId = setInterval(runAnimationQueue, 13); }

		return taskId;
	},

	/**
	 * 移除动画任务
	 * @method remove
	 * @param {Number} taskId 任务id
	 * @param {Boolean} [jumpToEnd=false] 是否执行动画最后一帧
	 */
	remove: function(taskId, jumpToEnd) {
		var i = indexOfTask(taskId);
		if (i !== -1) {
			if (jumpToEnd) { runAnimation(queue.splice(i)[0], 0); }
		}

		checkQueueEmpty();
	}
};

});