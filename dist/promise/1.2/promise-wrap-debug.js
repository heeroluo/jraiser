define(function(require, exports, module) {
'use strict'; 

/**
 * 对原生Promise的包装，并进行了扩展。
 * @module promise/1.2/promise-wrap
 * @category Infrastructure
 * @ignore
 */

var base = require('../../base/1.2/base');


var PromiseWrap = base.createClass(function(executor) {
	/* global Promise:false */
	this._promise = new Promise(executor);
}, {
	then: function(onFulfilled, onRejected) {
		var t = this;
		return new PromiseWrap(function(resolve) {
			resolve(t._promise.then(onFulfilled, onRejected));
		});
	},

	spread: function(onFulfilled, onRejected) {
		var t = this;
		return new PromiseWrap(function(resolve) {
			resolve(
				t._promise.then(function(value) {
					return onFulfilled.apply(this, value);
				}, onRejected)
			);
		});
	},

	'catch': function(onFulfilled) {
		var t = this;
		return new PromiseWrap(function(resolve) {
			resolve(
				t._promise['catch'](onFulfilled)
			);
		});
	},

	'finally': function(handler) {
		var t = this;
		return new PromiseWrap(function(resolve, reject) {
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


module.exports = PromiseWrap;

});