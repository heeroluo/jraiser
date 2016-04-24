/*!
 * JRaiser 2 Javascript Library
 * promise - v1.0.0 (2016-04-24T13:18:38+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供Promise的兼容实现
 * @module promise/1.0.x/
 * @category Utility
 */


var base = require('base/1.1.x/');


// 输出错误日志（兼容旧浏览器）
var logError = typeof console !== 'undefined' && console.error ?
	function(e) { console.error('(in promise) ' + e); } :
	function() { }


// 判断某个对象是否支持then方法
function isThenable(obj) {
	return obj && typeof obj.then === 'function';
}


// Promise的三种状态
var STATUS_PENDING = 0,
	STATUS_FULFILLED = 1,
	STATUS_REJECTED = 2;


/**
 * ES6 Promise的兼容实现
 * @class Promise
 * @constructor
 * @exports
 * @param {Function} executor 带有resolve、reject两个参数的函数
 */
var Promise = base.createClass(function(executor) {
	if (typeof executor !== 'function') {
		throw new Error('Promise executor must be a function');
	}

	var t = this;

	// 初始状态为pending
	t._status = STATUS_PENDING;

	t._pendings = { };
	// 存放promise被解决后的回调函数
	t._pendings[STATUS_FULFILLED] = [ ];
	// 存放promise被拒绝后的回调函数
	t._pendings[STATUS_REJECTED] = [ ];

	try {
		executor(function(value) {
			t._settle(STATUS_FULFILLED, value);
		}, function(reason) {
			t._settle(STATUS_REJECTED, reason);
		});
	} catch (e) {
		t._settle(STATUS_REJECTED, e);
	}
}, {
	// 确定状态并执行对应的回调
	_settle: function(status, value) {
		var t = this;
		// 如果不是处于初始状态，就不能再变了
		if (t._status !== STATUS_PENDING) { return; }

		t._status = status;
		t._value = value;

		t._pendings[status].forEach(function(cb) {
			cb(value);
		});

		delete t._pendings;
	},

	// 添加回调函数
	_listen: function(status, cb) {
		var t = this;
		if (t._status === STATUS_PENDING) {
			t._pendings[status].push(cb);
		} else if (t._status === status) {
			cb(t._value);
		}
	},

	/**
	 * 指定当前promise状态确定后的操作
	 * @method then
	 * @for Promise
	 * @param {Function} onFulfilled 当前promise被解决后调用的函数
	 * @param {Function} onRejected 当前promise被拒绝后调用的函数
	 * @return {Promise} 以回调函数执行结果确定状态的promise
	 */
	then: function(onFulfilled, onRejected) {
		var t = this;

		return new Promise(function(resolve, reject) {
			t._listen(STATUS_FULFILLED, function() {
				var value = t._value;
				if (onFulfilled) {
					try {
						value = onFulfilled(value);
					} catch (e) {
						logError(e);
						reject(e);
						return;
					}
				}
				if ( isThenable(value) ) {
					value.then(resolve, reject);
				} else {
					resolve(value);
				}
			});

			t._listen(STATUS_REJECTED, function() {
				var value = t._value;
				if (onRejected) {
					try {
						value = onRejected(value);
					} catch (e) {
						logError(e);
						reject(e);
						return;
					}
					if ( isThenable(value) ) {
						value.then(resolve, reject);
					} else {
						resolve(value);
					}
				} else {
					reject(value);
				}
			});
		});
	},

	/**
	 * 指定当前promise被拒绝后执行的操作
	 * @method catch
	 * @for Promise
	 * @param {Function} onRejected 当前promise被拒绝后调用的函数
	 * @return {Promise} 以回调函数执行结果确定状态的promise
	 */
	'catch': function(onRejected) { return this.then(null, onRejected); }
});

// 静态方法
base.extend(Promise, {
	/**
	 * 返回一个表示所有指定promise操作结果的promise
	 * @method all
	 * @for Promise
	 * @static
	 * @param {Array<Promise>} promises 指定的promise
	 * @return {Promise} promise
	 */
	all: function(promises) {
		var count = promises.length;

		if (count) {
			return new Promise(function(resolve, reject) {
				var values = new Array(count);
				promises.forEach(function(promise, i) {
					promise.then(function(value) {
						values[i] = value;
						if (!--count) { resolve(values); }
					}, reject);
				});
			});
		} else {
			return Promise.resolve([ ]);
		}
	},

	/**
	 * 返回一个promise，这个promise根据第一个确定状态的指定promise而确定状态
	 * @method race
	 * @for Promise
	 * @static
	 * @param {Array<Promise>} promises 指定的promise
	 * @return {Promise} promise
	 */
	race: function(promises) {
		return new Promise(function(resolve, reject) {
			promises.forEach(function(promise, i) {
				promise.then(resolve, reject);
			});
		});
	},

	/**
	 * 返回一个以指定值解析的promise
	 * @method resolve
	 * @for Promise
	 * @static
	 * @param {Any} value 指定值。可以是定值、promise或者thenable
	 * @return {Promise} promise
	 */
	resolve: function(value) {
		return new Promise(function(resolve, reject) {
			resolve(value);
		});
	},

	/**
	 * 返回一个拒绝状态的promise
	 * @method reject
	 * @for Promise
	 * @static
	 * @param {Any} reason 拒绝原因
	 * @return {Promise} promise
	 */
	reject: function(reason) {
		return new Promise(function(resolve, reject) {
			reject(reason);
		});
	}
});


return Promise;

});