/**
 * 本模块对Promise编程模式提供支持。
 * @module promise@1.2
 * @category Infrastructure
 */

var Promise;
if (typeof global !== 'undefined') {
	Promise = global.Promise;
} else if (typeof window !== 'undefined') {
	Promise = window.Promise;
}


/**
 * ES6 Promise的兼容实现，并进行了扩展。
 * @class Promise
 * @constructor
 * @exports
 * @param {Function(resolve,reject)} executor 执行函数。
 */
Promise = Promise ?
	require('./promise-wrap') :
	require('./promise-sim');

/**
 * 指定当前promise被解决后的操作。
 * @method then
 * @for Promise
 * @param {Function(value)} onFulfilled 当前promise被满足后调用的函数。
 * @param {Function(reason)} onRejected 当前promise被拒绝后调用的函数。
 * @return {Promise} 以回调函数返回值解决的promise。
 */

/**
 * 指定当前promise被满足后的操作，数组值会展开为回调函数的参数。
 * @method spread
 * @for Promise
 * @param {Function(values*)} onFulfilled 当前promise被满足后调用的函数。
 * @return {Promise} 以回调函数返回值解决的promise。
 */

/**
 * 指定当前promise被拒绝后执行的操作。
 * @method catch
 * @for Promise
 * @param {Function(reason)} onRejected 当前promise被拒绝后调用的函数。
 * @return {Promise} 以回调函数返回值解决的promise。
 */

/**
 * 指定当前promise状态确定（无论被解决还是被拒绝）后执行的操作。
 * @method finally
 * @for Promise
 * @param {Function} handler 状态确定后执行的函数。
 * @return {Promise} 与当前promise状态相同的新promise。
 */

/**
 * 返回一个表示所有指定promise解决结果的promise。
 * @method all
 * @for Promise
 * @static
 * @param {Array<Promise>} promises 指定promise。
 * @return {Promise} promise。
 */

/**
 * 返回一个promise，这个promise在任意一个指定promise被解决后，立刻以相同的状态被解决。
 * @method race
 * @for Promise
 * @static
 * @param {Array<Promise>} promises 指定promise。
 * @return {Promise} promise。
 */

/**
 * 返回一个以指定值解决的promise。
 * @method resolve
 * @for Promise
 * @static
 * @param {Any} value 指定值。可以是定值、promise或者thenable。
 * @return {Promise} 以指定值解决的promise。
 */

/**
 * 返回一个以指定原因拒绝的promise。
 * @method reject
 * @for Promise
 * @static
 * @param {Any} reason 拒绝原因。
 * @return {Promise} 以指定原因拒绝的promise。
 */

/**
 * 按顺序执行指定promise。
 * @method series
 * @for Promise
 * @static
 * @param {Array<Function(value):Promise>} creators 返回promise实例的函数数组。
 *   函数的参数为上一个promise的值。
 * @return {Promise} 如果执行过程中出现拒绝状态，则返回以该状态解决的promise；
 *   否则返回以最后一个promise的值解决的promise。
 */
Promise.series = function(creators) {
	if (creators.length) {
		return creators.slice(1).reduce(function(promise, creator) {
			return promise.then(function(value) {
				return creator(value);
			});
		}, creators[0]());
	} else {
		return Promise.resolve();
	}
};

/**
 * 返回在指定时间后解决的promise。
 * @method delay
 * @for Promise
 * @static
 * @param {Number} ms 延迟时间（毫秒）。
 * @return 指定时间后解决的promise。
 */
Promise.delay = function(ms) {
	return new Promise(function(resolve) {
		setTimeout(resolve, ms);
	});
};


module.exports = Promise;