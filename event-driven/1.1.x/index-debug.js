/*!
 * JRaiser 2 Javascript Library
 * event-driven - v1.1.0 (2015-09-02T14:42:46+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供事件驱动机制
 * @module event-driven/1.1.x/
 * @category Infrastructure
 */

var base = require('base/1.1.x/'), EventArg = require('./event-arg');


/**
 * 事件驱动机制
 * @class EventDriven
 * @exports
 * @constructor
 * @param {Object<String,Function>} [handlers] 初始的事件监听
 */
return base.createClass(function(handlers) {
	// 存放回调函数
	this.__eventHandlers = { };

	if (handlers) {
		for (var e in handlers) {
			if (handlers.hasOwnProperty(e) && handlers[e]) {
				this.on(e, handlers[e]);
			}
		}
	}
}, {
	/**
	 * 触发事件
	 * @method trigger
	 * @for EventDriven
	 * @param {String} type 事件类型
	 * @param {Object} [props] 事件属性
	 * @param {Any} [thisObj] 监听函数的this，默认为当前对象
	 * @return {Object} 事件参数
	 */
	trigger: function(type, props, thisObj) {
		var handlers = this.__eventHandlers[type], e = new EventArg(type, props);
		if (handlers) {
			for (var i = 0; i < handlers.length; i++) {
				handlers[i].call(thisObj || this, e);
			}
		}

		return e;
	},

	/**
	 * 注册事件监听
	 * @method on
	 * @for EventDriven
	 * @param {String} type 事件类型
	 * @param {Function} handler 处理函数
	 * @return {Object} 当前对象
	 */
	on: function(type, handler) {
		var handlers = this.__eventHandlers;
		handlers[type] = handlers[type] || [ ];
		handlers[type].push(handler);

		return this;
	},

	/**
	 * 注销事件监听
	 * @method off
	 * @for EventDriven
	 * @param {String} [type] 事件类型。如不指定，则注销所有事件监听
	 * @param {Function} [handler] 处理函数。如不指定，则注销指定事件类型的所有监听
	 * @return {Object} 当前对象
	 */
	off: function(type, handler) {
		switch (arguments.length) {
			case 0:
				this.__eventHandlers = { };
				break;

			case 1:
				delete this.__eventHandlers[type];
				break;

			case 2:
				var handlers = this.__eventHandlers[type];
				if (handlers) {
					for (var i = handlers.length - 1; i >= 0; i--) {
						if (handlers[i] === handler) {
							handlers.splice(i, 1);
						}
					}
					if (!handlers.length) { delete this.__eventHandlers[type]; }
				}
				break;
		}

		return this;
	}
});

});