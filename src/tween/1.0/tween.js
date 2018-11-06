/**
 * 本模块提供补间数值变化相关接口。
 * @module tween/1.0/tween
 * @category Infrastructure
 */

var base = require('../../base/1.2/base');
var Promise = require('../../promise/1.2/promise');

// 兼容浏览器和Node.js的全局作用域
var theGlobal;
if (typeof global !== 'undefined') {
	theGlobal = global;
} else if (typeof window !== 'undefined') {
	theGlobal = window;
} else {
	theGlobal = this;
}


// 内置缓动函数
var easings = {
	// 以下缓动函数来自jQuery
	linear: function(p) { return p; },
	swing: function(p) { return 0.5 - Math.cos(p * Math.PI) / 2; },

	/* eslint-disable */
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
	/* eslint-enable */
};


// 计算补间过程中的值
function computeStepValue(startValue, endValue, totalTime, easing, progress) {
	var stepValue;

	if (typeof startValue === 'number' && typeof endValue === 'number') {
		stepValue = startValue +
			(endValue - startValue) *
			easing.call(easings, progress, totalTime * progress, 0, 1, totalTime);
	} else if (Array.isArray(startValue) && Array.isArray(endValue)) {
		stepValue = startValue.map(function(v, i) {
			return computeStepValue(v, endValue[i], totalTime, easing, progress);
		});
	}

	// startValue和endValue非法时，无法计算出step，此时直接返回endValue
	return stepValue != null ? stepValue : endValue;
}

// 执行任务的主要逻辑
function runStep(task, percentage, key) {
	var startValue = task.startValue;
	var endValue = task.endValue;
	var nextValue;

	if (base.isObject(startValue) && base.isObject(endValue)) {
		nextValue = {};
		// 为对象时，对每个属性递归调用本函数
		for (key in startValue) {
			if (startValue.hasOwnProperty(key)) {
				nextValue[key] = runStep({
					startValue: startValue[key],
					endValue: endValue[key],
					duration: task.duration,
					easing: task.easing,
					frame: task.frame
				}, percentage, key);
			}
		}
	} else {
		// 补间最后一帧时直接使用最终值（小数计算可能有误差，这样最保险），否则使用计算出来的值
		nextValue = percentage >= 1 ? endValue : computeStepValue(
			startValue,
			endValue,
			task.duration,
			task.easing,
			percentage
		);

		try {
			task.frame.call(theGlobal, nextValue, key);
		} catch (e) {
			if (task.onerror) {
				task.onerror.call(theGlobal, e);
			} else {
				throw e;
			}
		}
	}

	return nextValue;
}

// 执行任务
function runTask(task, remaining) {
	var percentage = 1 - (remaining / task.duration);
	// 执行任务的主要逻辑可能会递归调用，封装成独立函数（runStep）
	var stepValue = runStep(task, percentage);

	if (task.onprogress) {
		task.onprogress.call(theGlobal, stepValue, percentage, remaining);
	}
	if (percentage >= 1 && task.oncomplete) {
		task.oncomplete.call(theGlobal);
	}

	return percentage;
}


// 任务队列管理
var queueManager = (function() {
	var queue = []; // 存放任务队列
	var autoId = 0; // 任务自增id

	return {
		// 增加任务
		add: function(task) {
			task.taskId = ++autoId;
			task.startTime = +new Date;
			queue.push(task);
			return task.taskId;
		},

		// 根据任务id查找对应任务在队列中的位置
		findIndex: function(taskId) {
			var min = 0, max = queue.length - 1, mid;
			while (min <= max) {
				mid = parseInt((min + max) / 2);
				if (queue[mid].taskId == taskId) {
					return mid;
				} else if (queue[mid].taskId > taskId) {
					max = mid - 1;
				} else {
					min = mid + 1;
				}
			}
			return -1;
		},

		// 根据队列索引移除任务
		remove: function(i) { return queue.splice(i, 1)[0]; },

		// 队列是否为空
		isEmpty: function() { return !queue.length; },

		// 一帧
		tick: function() {
			var i = 0, task, percentage;
			while ((task = queue[i])) {
				percentage = runTask(
					task,
					Math.max(0, task.startTime + task.duration - new Date)
				);
				if (percentage >= 1) {
					// 移除已完成任务
					queue.splice(i, 1);
				} else {
					i++;
				}
			}
		}
	};
})();


// 补间任务管理
var schedule = (function() {
	var doc = theGlobal.document;
	var requestAnimationFrame = theGlobal.requestAnimationFrame;

	// 使用setTimeout时的间隔
	var TICK_INVERVAL = 13;

	// 标识是否正在运行，防止重复运行
	var isRunning;

	// 指定任务队列
	function run() {
		if (queueManager.isEmpty()) {
			isRunning = false;
		} else {
			isRunning = true;
			if (doc && doc.hidden === false && requestAnimationFrame) {
				requestAnimationFrame(run);
			} else {
				setTimeout(run, TICK_INVERVAL);
			}
			queueManager.tick();
		}
	}

	return {
		run: function() {
			if (!isRunning) { run(); }
		}
	};
})();


/**
 * 创建补间。
 * @method create
 * @param {Object} options 补间参数。
 *   @param {Number|Array|Object} options.startValue 初始值。
 *   @param {Number|Array|Object} options.endValue 结束值。
 *   @param {Function(value,key)} options.frame 在此函数中执行每一帧的操作。
 *   @param {Number} [options.duration=400] 持续时间。
 *   @param {Function|String} [options.easing='linear'] 缓动函数。
 *   @param {Function(value,progress,remaining)} [options.onprogress] 每一帧执行后的回调函数。
 *   @param {Function(taskId)} [options.receiveId] 接收补间任务id的函数。
 * @return {Promise} 补间promise。
 */
exports.create = function(options) {
	return new Promise(function(resolve, reject) {
		var easing = options.easing || 'linear';
		if (typeof easing !== 'function') {
			var easingType = String(easing);
			easing = easings[easingType];
			if (!easing) {
				reject(new Error('Easing "' + easingType + '" does not exist'));
				return;
			}
		}

		options = base.extend({}, options, { easing: easing });
		options.duration = Math.abs(parseFloat(options.duration)) || 400;
		if (!options.frame) {
			reject(new Error('Please specify the "frame" function'));
			return;
		}

		options.oncomplete = resolve;
		options.onerror = reject;

		var taskId = queueManager.add(options);
		schedule.run();
		if (options.receiveId) {
			options.receiveId.call(theGlobal, taskId);
		}
	});
};


/**
 * 移除补间任务（移除后补间promise将马上解决）。
 * @method remove
 * @param {Number} taskId 任务id。
 * @param {Boolean} [jumpToEnd=false] 是否执行补间最后一帧（跳到完成状态）。
 */
exports.remove = function(taskId, jumpToEnd) {
	var i = queueManager.findIndex(taskId);
	if (i !== -1) {
		var task = queueManager.remove(i);
		if (jumpToEnd) {
			runTask(task, 0);
		} else {
			task.oncomplete.call(theGlobal);
		}
	}
};