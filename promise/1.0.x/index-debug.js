/*!
 * JRaiser 2 Javascript Library
 * promise - v1.0.0 (2016-04-21T18:04:28+0800)
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
	return obj && typeof obj.then === 'function' && obj.then.length === 2;
}


// Promise对象的三种状态
var STATUS_PENDING = 0,
	STATUS_FULFILLED = 1,
	STATUS_REJECTED = 2;


/**
 * 地区选择组件
 * @class Promise
 * @constructor
 * @exports
 * @param {Function} executor 带有resolve、reject两个参数的函数
 */
var Promise = base.createClass(function(executor) {
	if (typeof executor !== 'function') {
		throw new Error('Executor must be a function');
	}

	var t = this;

	// 初始状态为pending
	t._status = STATUS_PENDING;

	t._pendings = { };
	// 存放操作成功的回调函数
	t._pendings[STATUS_FULFILLED] = [ ];
	// 存放操作失败的回调函数
	t._pendings[STATUS_REJECTED] = [ ];

	try {
		executor(function(value) {
			t._settle(STATUS_FULFILLED, value);
		}, function(error) {
			t._settle(STATUS_REJECTED, error);
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

	// 添加回调函数到指定的状态
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
	 * @param {Function} onFulfilled 当前promise操作成功后调用的函数
	 * @param {Function} onRejected 当前promise操作失败后调用的函数
	 * @return {Promise} 表示回调操作结果的promise
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
						logError(value);
						reject(e);
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
						logError(value);
						reject(e);
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
	 * 指定当前promise在操作失败后的操作
	 * @method then
	 * @for Promise
	 * @param {Function} onRejected 当前promise操作失败后调用的函数
	 * @return {Promise} 表示回调操作结果的promise
	 */
	'catch': function(onRejected) { return this.then(null, onRejected); }
});

// 静态方法
base.extend(Promise, {
	/**
	 * 返回一个表示所有指定Promise操作结果的Promise
	 * @method all
	 * @for Promise
	 * @static
	 * @param {Array<Promise>} promises 所有指定的Promise
	 * @return {Promise} 表示所有指定的Promise操作结果的Promise
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
	 * 生成操作成功状态的promise
	 * @method resolve
	 * @for Promise
	 * @static
	 * @param {Any} value 操作成功的值
	 * @return {Promise} promise
	 */
	resolve: function(value) {
		return new Promise(function(resolve, reject) {
			resolve(value);
		});
	},

	/**
	 * 生成操作失败状态的promise
	 * @method reject
	 * @for Promise
	 * @static
	 * @param {Any} value 失败原因
	 * @return {Promise} promise
	 */
	reject: function(value) {
		return new Promise(function(resolve, reject) {
			reject(value);
		});
	}
});


return Promise;

});