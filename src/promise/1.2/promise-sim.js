/**
 * Promise的兼容实现，且扩展了spread和finally方法
 * @module promise/1.2/promise-sim
 * @category Infrastructure
 * @ignore
 */

var base = require('../../base/1.2/base');


// 输出错误日志（兼容旧浏览器）
var logError = typeof console !== 'undefined' && typeof console.error === 'function' ?
	function(e) { console.error('Uncaught (in promise) %o', e); } :
	function() { };


// 判断某个对象是否支持then方法
function isThenable(obj) { return obj && typeof obj.then === 'function'; }

// 如果value是thenable的，就执行then，否则resolve
function thenOrResolve(value, resolve, reject) {
	if (isThenable(value)) {
		value.then(resolve, reject);
	} else {
		resolve(value);
	}
}


// Promise的三种状态
var STATUS_PENDING = 0;
var STATUS_FULFILLED = 1;
var STATUS_REJECTED = 2;


var Promise = base.createClass(function(executor) {
	if (typeof executor !== 'function') {
		throw new Error('Executor must be a function');
	}

	var t = this;

	// 初始状态为pending
	t._status = STATUS_PENDING;

	// 存放各种状态下的回调函数
	t._pendings = { };

	// 封装拒绝状态的确定（下面好几个地方用到）
	function reject(reason) {
		t._settle(STATUS_REJECTED, reason);
	}

	try {
		executor(function(value) {
			thenOrResolve(value, function(value) {
				t._settle(STATUS_FULFILLED, value);
			}, reject);
		}, reject);
	} catch (e) {
		reject(e);
	}
}, {
	// 确定状态并执行对应的回调
	_settle: function(status, value) {
		var t = this;
		// 如果状态已确定，就不能再变了
		if (t._status !== STATUS_PENDING) { return; }

		t._status = status;
		t._value = value;

		// 回调是异步的
		setTimeout(function() {
			// 拒绝状态下，如果没有对此状态的回调，则认为没有进行异常处理，输出拒绝信息
			if (t._status === STATUS_REJECTED && !t._hasRejectedHandler) {
				logError(value);
				return;
			}

			// 执行回调
			var callbacks = t._pendings[status];
			if (callbacks) {
				callbacks.forEach(function(cb) { cb(value); });
			}

			// 状态确定后删除记录回调的属性
			// 后续回调可以直接执行
			delete t._pendings;
		}, 0);
	},

	// 添加回调函数
	_listen: function(status, cb) {
		var t = this;

		// 记录是否有对拒绝状态进行处理
		if (status === STATUS_REJECTED) { t._hasRejectedHandler = true; }

		if (t._pendings) {
			t._pendings[status] = t._pendings[status] || [];
			t._pendings[status].push(cb);
		} else if (t._status === status) {
			setTimeout(function() { cb(t._value); }, 0);
		}
	},

	// 对then和spread的统一处理
	_then: function(onFulfilled, onRejected, toSpread) {
		var t = this;

		return new Promise(function(resolve, reject) {
			t._listen(STATUS_FULFILLED, function() {
				var value = t._value;
				if (onFulfilled) {
					try {
						if (toSpread && Array.isArray(value)) {
							value = onFulfilled.apply(this, value);
						} else {
							value = onFulfilled.call(this, value);
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
						value = onRejected.call(this, value);
					} catch (e) {
						reject(e);
						return;
					}
					thenOrResolve(value, resolve, reject);
				} else {
					reject(value);
				}
			});
		});
	},

	then: function(onFulfilled, onRejected) {
		return this._then(onFulfilled, onRejected);
	},

	spread: function(onFulfilled) {
		return this._then(onFulfilled, null, true);
	},

	'catch': function(onRejected) {
		return this.then(null, onRejected);
	},

	'finally': function(handler) {
		var t = this;

		return new Promise(function(resolve, reject) {
			function callback() {
				var settle, value = t._value;
				switch (t._status) {
					case STATUS_FULFILLED:
						settle = function() { resolve(value); };
						break;

					case STATUS_REJECTED:
						settle = function() { reject(value); };
						break;
				}

				if (handler) {
					try {
						handler();
					} catch (e) {
						reject(e);
						return;
					}
				}

				if (settle) { settle(); }
			}

			t._listen(STATUS_FULFILLED, callback);
			t._listen(STATUS_REJECTED, callback);
		});
	}
});

// 静态方法
base.extend(Promise, {
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
			return Promise.resolve([]);
		}
	},

	race: function(promises) {
		return new Promise(function(resolve, reject) {
			promises.forEach(function(promise) {
				promise.then(resolve, reject);
			});
		});
	},

	resolve: function(value) {
		return new Promise(function(resolve, reject) {
			thenOrResolve(value, resolve, reject);
		});
	},

	reject: function(reason) {
		return new Promise(function(resolve, reject) {
			reject(reason);
		});
	},

	series: function(creators) {
		if (creators.length) {
			return creators.slice(1).reduce(function(promise, creator) {
				return promise.then(function(value) {
					return creator(value);
				});
			}, creators[0]());
		} else {
			return Promise.resolve();
		}
	}
});


module.exports = Promise;