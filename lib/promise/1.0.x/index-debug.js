/*!
 * JRaiser 2 Javascript Library
 * promise@1.0.0 (2016-06-21T15:15:46+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块对Promise编程模式提供支持
 * @module promise@1.0.x, promise/1.0.x/
 * @category Infrastructure
 */


var base = require('base@1.1.x'), console = window.console;


// 输出错误日志（兼容旧浏览器）
var logError = console && typeof console.error === 'function' ?
	function(e) { console.error('Uncaught (in promise) %o', e); } :
	function() { };


// 判断某个对象是否支持then方法
function isThenable(obj) { return obj && typeof obj.then === 'function'; }

// 如果value是thenable的，就执行then，否则resolve
function thenOrResolve(value, resolve, reject) {
	if ( isThenable(value) ) {
		value.then(resolve, reject);
	} else {
		resolve(value);
	}
}


// Promise的四种状态（其中canceled是扩展的）
var STATUS_PENDING = 0,
	STATUS_FULFILLED = 1,
	STATUS_REJECTED = 2,
	STATUS_CANCELED = 3;


/**
 * ES6 Promise的兼容实现，并进行了必要的扩展
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

	// 封装拒绝状态的确定（下面好几个地方用到）
	function reject(reason) { t._settle(STATUS_REJECTED, reason); }

	try {
		executor(function(value) {
			thenOrResolve(value, function(value) {
				t._settle(STATUS_FULFILLED, value);
			}, reject);
		}, reject, function(canceler) {
			if (typeof canceler !== 'function') {
				throw new Error('Promise canceler must be a function');
			}
			t._canceler = canceler;
		});
	} catch (e) {
		reject(e);
	}
}, {
	// 确定状态并执行对应的回调
	_settle: function(status, value) {
		var t = this;
		// 如果不是处于初始状态，就不能再变了
		if (t._status !== STATUS_PENDING) { return; }

		t._status = status;
		t._value = value;
 
		// 拒绝状态下，如果没有对此状态的回调，则认为没有进行异常处理，输出拒绝信息
		if (t._status === STATUS_REJECTED) {
			setTimeout(function() {
				if (!t._hasRejectedHandler) { logError(value); }
			}, 0);
		}

		// 执行回调
		var callbacks = t._pendings[status];
		if (callbacks) {
			callbacks.forEach(function(cb) { cb(value); });
		}

		delete t._pendings;
	},

	// 添加回调函数
	_listen: function(status, cb) {
		var t = this;

		// 记录当前promise有对拒绝状态进行处理
		if (status === STATUS_REJECTED) { t._hasRejectedHandler = true; }

		switch (t._status) {
			case STATUS_PENDING:
				t._pendings[status] = t._pendings[status] || [ ];
				t._pendings[status].push(cb);
				break;

			case status:
				cb(t._value);
				break;
		}
	},

	/**
	 * 取消操作（仅当promise的状态未确定时有效）
	 * @method cancel
	 * @for Promise
	 */
	cancel: function() {
		var t = this;
		if (t._status === STATUS_PENDING) {
			if (t._canceler) {
				t._canceler.call(window);
				t._settle(STATUS_CANCELED);
			} else {
				throw new Error('Promise canceler is undefined');
			}
		}
	},

	// 对then和spread的统一处理	
	_then: function(onFulfilled, onRejected, toSpread) {
		var t = this;

		return new Promise(function(resolve, reject, setCanceler) {
			t._listen(STATUS_FULFILLED, function() {
				var value = t._value;
				if (onFulfilled) {
					try {
						if (toSpread) {
							value = onFulfilled.apply(window, value);
						} else {
							value = onFulfilled.call(window, value);
						}
					} catch (e) {
						reject(e);
						return;
					}
				}
				thenOrResolve(value, resolve, reject);
			});

			t._listen(STATUS_REJECTED, function() {
				var value = t._value;
				if (onRejected) {
					try {
						value = onRejected.call(window, value);
					} catch (e) {
						reject(e);
						return;
					}
					thenOrResolve(value, resolve, reject);
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
	 * 指定当前promise被解决后的操作
	 * @method then
	 * @for Promise
	 * @param {Function} onFulfilled 当前promise被满足后调用的函数
	 * @param {Function} onRejected 当前promise被拒绝后调用的函数
	 * @return {Promise} 以回调函数解决的promise
	 */
	then: function(onFulfilled, onRejected) {
		return this._then(onFulfilled, onRejected);
	},

	/**
	 * 指定当前promise被满足后的操作。仅当满足promise的值是数组时可用，数组会展开为回调函数的参数
	 * @method spread
	 * @for Promise
	 * @param {Function} onFulfilled 当前promise被满足后调用的函数
	 * @return {Promise} 以回调函数解决的promise
	 */
	spread: function(onFulfilled) {
		return this._then(onFulfilled, null, true);
	},

	/**
	 * 指定当前promise被拒绝后执行的操作
	 * @method catch
	 * @for Promise
	 * @param {Function} onRejected 当前promise被拒绝后调用的函数
	 * @return {Promise} 以回调函数解决的promise
	 */
	'catch': function(onRejected) {
		return this.then(null, onRejected);
	},

	/**
	 * 指定当前promise被解决或被取消后执行的操作
	 * @method finally
	 * @for Promise
	 * @param {Function} handler 状态确定后执行的函数，唯一的参数表示当前promise是否被取消
	 * @return {Promise} 与当前promise状态相同的新promise
	 */
	'finally': function(handler) {
		var t = this;

		return new Promise(function(resolve, reject, setCanceler) {
			function callback() {
				var result = {
					code: t._status,
					FULFILLED: STATUS_FULFILLED,
					REJECTED: STATUS_REJECTED,
					CANCELED: STATUS_CANCELED
				};

				var settle, value = t._value;
				switch (t._status) {
					case STATUS_FULFILLED:
						result.value = value;
						settle = function() { resolve(value); };
						break;

					case STATUS_REJECTED:
						result.reason = value;
						settle = function() { reject(value); };
						break;
				}

				if (handler) {
					try {
						handler.call(window, result);
					} catch (e) {
						reject(e);
						return;
					}
				}

				if (settle) { settle(); }
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
				thenOrResolve(value, resolve, reject);
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