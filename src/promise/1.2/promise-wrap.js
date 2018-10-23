/**
 * 对原生Promise的包装，并扩展spread和finally方法
 * @module promise/1.2/promise-wrap
 * @category Infrastructure
 * @ignore
 */

var base = require('../../base/1.2/base');


var PromiseWrap = base.createClass(function(executor) {
	/* global Promise:true */
	this._promise = new Promise(executor);
}, {
	then: function(onFulfilled, onRejected) {
		return this._promise.then(onFulfilled, onRejected);
	},

	spread: function(onFulfilled, onRejected) {
		return this._promise.then(function(value) {
			return onFulfilled.apply(this, value);
		}, onRejected);
	},

	'catch': function(onFulfilled) {
		return this._promise['catch'](onFulfilled);
	},

	'finally': function(handler) {
		var t = this;
		return new Promise(function(resolve, reject) {
			t._promise.then(function(value) {
				handler.apply(this, arguments);
				resolve(value);
			}, function(reason) {
				handler.apply(this, arguments);
				reject(reason);
			});
		});
	}
});

[
	'all',
	'race',
	'reject',
	'resolve'
].forEach(function(method) {
	PromiseWrap[method] = Promise[method];
});

PromiseWrap.series = function(creators) {
	if (creators.length) {
		return creators.slice(1).reduce(function(promise, creator) {
			return promise.then(function(value) {
				return creator(value);
			});
		}, creators[0]());
	} else {
		return PromiseWrap.resolve();
	}
};


module.exports = PromiseWrap;