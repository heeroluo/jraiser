/*!
 * JRaiser 2 Javascript Library
 * event-driven - v1.0.0 (2013-01-09T10:16:54+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供事件驱动机制
 * @module event-driven/1.0.x/
 * @category Infrastructure
 */

var base = require('base/1.0.x/'), EventArg = require('dom/1.0.x/dom-event-arg');

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
	 * @param {Object} [props] 事件参数属性
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
	 * @param {Function(e)} handler 回调函数
	 * @return {Object} 当前对象
	 */
	this.on = function(type, handler) {
		handlers[type] = handlers[type] || [ ];
		handlers[type].push(handler);

		return this;
	};

	/**
	 * 移除事件监听
	 * @method off
	 * @for EventDriven
	 * @param {String} [type] 通知类型。如不指定，则取消所有订阅
	 * @param {Function} [handler] 回调函数。如不指定，则取消指定类型的所有订阅
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
				if (!theHandlers.length) {
					delete handlers[type];
				}
			}
		}

		return this;
	};
});

});