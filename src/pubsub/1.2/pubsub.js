/**
 * 本模块提供事件驱动机制。
 * @module pubsub@1.2
 * @category Infrastructure
 */

var EventArg = require('./event-arg');


/**
 * 事件驱动机制。
 * @class PubSub
 * @exports
 * @constructor
 * @param {Object<String,Function>} [handlers] 初始的事件监听。
 */
module.exports = function(handlers) {
	var __eventHandlers = {};

	if (handlers) {
		for (var e in handlers) {
			if (handlers.hasOwnProperty(e) && handlers[e]) {
				this.on(e, handlers[e]);
			}
		}
	}

	/**
	 * 触发事件。
	 * @method trigger
	 * @for PubSub
	 * @param {String} type 事件类型。
	 * @param {Object} [props] 事件属性。
	 * @param {Any} [thisObj] 监听函数的this，默认为当前对象。
	 * @return {Object} 事件参数。
	 */
	this.trigger = function(type, props, thisObj) {
		var e = new EventArg(type, props);
		var handlers = __eventHandlers[type];
		if (handlers) {
			for (var i = 0; i < handlers.length; i++) {
				handlers[i].call(thisObj || this, e);
			}
		}
		return e;
	};

	/**
	 * 注册事件监听。
	 * @method on
	 * @for PubSub
	 * @param {String} type 事件类型。
	 * @param {Function} handler 处理函数。
	 * @return {Object} 当前对象。
	 */
	this.on = function(type, handler) {
		__eventHandlers[type] = __eventHandlers[type] || [];
		__eventHandlers[type].push(handler);
		return this;
	};

	/**
	 * 注销事件监听。
	 * @method off
	 * @for PubSub
	 * @param {String} [type] 事件类型。如不指定，则注销所有事件监听。
	 * @param {Function} [handler] 处理函数。如不指定，则注销指定事件类型的所有监听。
	 * @return {Object} 当前对象。
	 */
	this.off = function(type, handler) {
		switch (arguments.length) {
			case 0:
				__eventHandlers = { };
				break;

			case 1:
				delete __eventHandlers[type];
				break;

			case 2:
				var handlers = __eventHandlers[type];
				if (handlers) {
					for (var i = handlers.length - 1; i >= 0; i--) {
						if (handlers[i] === handler) {
							handlers.splice(i, 1);
						}
					}
					if (!handlers.length) { delete __eventHandlers[type]; }
				}
				break;
		}

		return this;
	};
};