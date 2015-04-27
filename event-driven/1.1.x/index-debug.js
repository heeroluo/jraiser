/*!
 * JRaiser 2 Javascript Library
 * event-driven - v1.1.0 (2015-04-27T10:32:48+0800)
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
 */
return base.createClass(function() {
	// 存放回调函数
	var handlers = { };

	/**
	 * 触发事件
	 * @method trigger
	 * @for EventDriven
	 * @param {String} type 事件类型
	 * @param {Object} [props] 事件属性
	 * @return {Object} 事件参数
	 */
	this.trigger = function(type, props) {
		var theHandlers = handlers[type], e = new EventArg(type, props);
		if (theHandlers) {
			for (var i = 0; i < theHandlers.length; i++) {
				theHandlers[i].call(this, e);
			}
		}

		return e;
	};

	/**
	 * 注册事件监听
	 * @method on
	 * @for EventDriven
	 * @param {String} type 事件类型
	 * @param {Function|Array} handler 处理函数。多个处理函数以数组传入
	 * @return {Object} 当前对象
	 */
	this.on = function(type, handler) {
		handlers[type] = handlers[type] || [ ];
		if ( base.isArray(handler) ) {
			base.merge(handlers[type], handler);
		} else {
			handlers[type].push(handler);
		}

		return this;
	};

	/**
	 * 移除事件监听
	 * @method off
	 * @for EventDriven
	 * @param {String} [type] 事件类型。如不指定，则取消所有事件类型的监听
	 * @param {Function} [handler] 处理函数。如不指定，则取消指定事件类型的所有监听
	 * @return {Object} 当前对象
	 */
	this.off = function(type, handler) {
		if (!arguments.length) {
			handlers = { };
		} else if (!handler) {
			delete handlers[type];
		} else {
			var theHandlers = handlers[type];
			if (theHandlers) {
				for (var i = theHandlers.length - 1; i >= 0; i--) {
					if (theHandlers[i] === handler) {
						theHandlers.splice(i, 1);
					}
				}
				if (!theHandlers.length) { delete handlers[type]; }
			}
		}

		return this;
	};
});

});
