/*!
 * JRaiser 2 Javascript Library
 * promise - v1.0.0 (2016-04-25T17:42:15+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块对Promise编程模式提供支持
 * @module promise/1.0.x/
 * @category Utility
 */


var base = require('base/1.1.x/');


// 输出错误日志（兼容旧浏览器）
var logError = typeof console !== 'undefined' && console.error ?
	function(e) { console.error('Uncaught (in promise) ' + e); } :
	function() { }


// 判断某个对象是否支持then方法
function isThenable(obj) { return obj && typeof obj.then === 'function'; }


// Promise的三种状态
var STATUS_PENDING = 0,
	STATUS_FULFILLED = 1,
	STATUS_REJECTED = 2,
	STATUS_CANCELED = 3;


/**
 * ES6 Promise的兼容实现，同时提供一些扩展功能
 * @class Promise
 * @constructor
 * @exports
 * @param {Function} executor 带有resolve、reject、setCanceler三个参数的函数，
 *   其中setCanceler用于指定cancel时执行的函数
 */
var Promise = base.createClass(function(executor) {
	if (typeof executor !== 'function') {
		throw new Error('Promise executor must be a function');
	}

	var t = this;

	// 初始状态为pending
	t._status = STATUS_PENDING;

	// 存放各种状态下的回调函数
	t._pendings = { };

	try {
		executor(function(value) {
			t._settle(STATUS_FULFILLED, value);
		}, function(reason) {
			t._settle(STATUS_REJECTED, reason);
		}, function(canceler) {
			if (typeof canceler !== 'function') {
				throw new Error('Promise canceler must be a function');
			}
			t._canceler = canceler;
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

		var callbacks = t._pendings[status];

		// 拒绝状态下，如果没有对此状态的回调函数，则输出拒绝信息
		if (t._status === STATUS_REJECTED) {
			setTimeout(function() {
				if (!callbacks || !callbacks.length) { logError(value); }
			}, 0);
		}

		if (callbacks) {
			callbacks.forEach(function(cb) { cb(value); });
		}

		delete t._pendings;
	},

	// 添加回调函数
	_listen: function(status, cb) {
		var t = this;
		if (t._status === STATUS_PENDING) {
			t._pendings[status] = t._pendings[status] || [ ];
			t._pendings[status].push(cb);
		} else if (t._status === status) {
			cb(t._value);
		}
	},

	/**
	 * 取消操作（仅当promise的状态未确定时有效）
	 * @method cancel
	 * @for Promise
	 */
	cancel: function() {
		var t = this;
		if (t._canceler) {
			t._canceler.call(window);
			t._settle(STATUS_CANCELED);
		} else {
			throw new Error('Promise canceler is undefined');
		}
	},

	/**
	 * 指定当前promise状态确定后的操作
	 * @method then
	 * @for Promise
	 * @param {Function} onFulfilled 当前promise被满足后调用的函数
	 * @param {Function} onRejected 当前promise被拒绝后调用的函数
	 * @return {Promise} 以回调函数解决的promise
	 */
	then: function(onFulfilled, onRejected) {
		var t = this;

		return new Promise(function(resolve, reject, setCanceler) {
			t._listen(STATUS_FULFILLED, function() {
				var value = t._value;
				if (onFulfilled) {
					try {
						value = onFulfilled(value);
					} catch (e) {
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

			if (t._canceler) {
				setCanceler(function() { t.cancel(); });
			}
		});
	},

	/**
	 * 指定当前promise被拒绝后执行的操作
	 * @method catch
	 * @for Promise
	 * @param {Function} onRejected 当前promise被拒绝后调用的函数
	 * @return {Promise} 以回调函数解决的promise
	 */
	'catch': function(onRejected) { return this.then(null, onRejected); },

	/**
	 * 指定当前promise状态确定后（无论何种状态，包括被取消状态）执行的操作
	 * @method finally
	 * @for Promise
	 * @param {Function} handler 状态确定后执行的操作
	 * @return {Promise} 与当前promise状态相同的新promise
	 */
	'finally': function(handler) {
		var t = this;

		return new Promise(function(resolve, reject, setCanceler) {
			function callback() {
				if (handler) {
					try {
						handler();
					} catch (e) {
						reject(e);
						return;
					}
				}

				if (t._status === STATUS_FULFILLED) {
					resolve(t._value);
				} else if (t._status === STATUS_REJECTED) {
					reject(t._value);
				}
			}

			if (t._canceler) {
				setCanceler(function() { t.cancel(); });
			}

			t._listen(STATUS_FULFILLED, callback);
			t._listen(STATUS_REJECTED, callback);
			t._listen(STATUS_CANCELED, callback);
		});
	}
});

// 静态方法
base.extend(Promise, {
	/**
	 * 返回一个表示所有指定promise解决结果的promise
	 * @method all
	 * @for Promise
	 * @static
	 * @param {Array<Promise>} promises 指定promise
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
	 * 返回一个promise，这个promise在任意一个指定promise被解决后，立刻以相同的状态被解决
	 * @method race
	 * @for Promise
	 * @static
	 * @param {Array<Promise>} promises 指定promise
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
	 * 返回一个以指定值解决的promise
	 * @method resolve
	 * @for Promise
	 * @static
	 * @param {Any} value 指定值。可以是定值、promise或者thenable
	 * @return {Promise} 以指定值解决的promise
	 */
	resolve: function(value) {
		return new Promise(function(resolve, reject) {
			setTimeout(function() {
				if ( isThenable(value) ) {
					value.then(resolve, reject);
				} else {
					resolve(value);
				}
			}, 0);
		});
	},

	/**
	 * 返回一个以指定原因拒绝的promise
	 * @method reject
	 * @for Promise
	 * @static
	 * @param {Any} reason 拒绝原因
	 * @return {Promise} 以指定原因拒绝的promise
	 */
	reject: function(reason) {
		return new Promise(function(resolve, reject) {
			setTimeout(function() {
				reject(reason);
			}, 0);
		});
	}
});


return Promise;

});