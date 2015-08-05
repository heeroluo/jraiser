/*!
 * JRaiser 2 Javascript Library
 * widget - v1.1.0 (2015-08-05T10:11:55+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * widget模块提供创建组件接口
 * @module widget/1.1.x/
 * @category Infrastructure
 */

var base = require('base/1.1.x/'),
	EventDriven = require('event-driven/1.1.x/'),
	DOMEventProxy = require('./dom-event-proxy');


/**
 * 组件基类
 * @class WidgetBase
 * @constructor
 */
var WidgetBase = exports.WidgetBase = base.createClass(function() {

}, {
	/**
	 * 初始化组件
	 * @method init
	 * @for WidgetBase
	 */
	init: function() {
		var t = this, options = t._options;
		if (!t.__inited) {
			// 创建组件事件驱动对象，并注册选项对象中指定的事件监听
			t.__eventDriven = new EventDriven(options.events);
			// 创建DOM事件代理
			// 主要用于保存绑定事件的历史记录，以便在销毁组件时解绑
			t.__domEventProxy = new DOMEventProxy();

			t._init(options);
			t.__inited = true;

			/**
			 * 组件初始化后触发
			 * @event init
			 * @for WidgetBase
			 */
			t._trigger('init');
		}
	},

	/**
	 * 初始化组件主体（由init调用）。此方法由子类实现
	 * @method _init
	 * @protected
	 * @for WidgetBase
	 * @param {Object} options 组件选项
	 */
	_init: function(options) { },

	/**
	 * 获取组件是否已初始化
	 * @method inited
	 * @for WidgetBase
	 * @return {Boolean} 组件是否已初始化
	 */
	inited: function() { return !!this.__inited; },

	/**
	 * 注册DOM事件监听
	 * @method _onDOMEvent
	 * @protected
	 * @for WidgetBase
	 * @param {NodeList|Array} elements HTML元素
	 * @param {String|Array} types 事件类型
	 * @param {Function|Object|String} handler 事件监听函数。
	 *   为string时，监听函数为当前对象的同名方法；
	 *   为object时，该对象可以有id（监听函数的id）和fn（函数本身）两个属性，
	 *     仅有id属性时表示获取该id的监听函数（必须已存在）作为监听函数
	 * @param {Object} [options] 其他事件监听选项
	 * @return {Object} 当前对象
	 */
	_onDOMEvent: function(elements, types, handler, options) {
		var t = this, fnName;

		if (typeof handler === 'string') {
			fnName = handler;
			handler = { };
		} else if (typeof handler.fn === 'string') {
			fnName = handler.fn;
		}
		// 直接调用当前对象的某个方法
		if (fnName) {
			handler.fn = function() {
				t[fnName].apply(t, arguments);
			};
		} else if (handler.id && !handler.fn) {
			handler = handler.id;
		}

		t.__domEventProxy.on(elements, types, handler, options);

		return t;
	},

	/**
	 * 注销DOM事件监听
	 * @method _offDOMEvent
	 * @protected
	 * @for WidgetBase
	 * @param {NodeList|Array} [elements] HTML元素。为空时移除所有监听
	 * @param {String|Array} [types] 事件类型。为空时移除指定元素的所有监听
	 * @param {String} [handerId] 监听函数id。为空时移除指定元素指定事件类型的所有监听
	 * @return {Object} 当前对象
	 */
	_offDOMEvent: function(elements, types, handlerId) {
		var domEventProxy = this.__domEventProxy;
		domEventProxy.off.apply(domEventProxy, arguments);
		return this;
	},

	/**
	 * 注册组件事件监听
	 * @method on
	 * @for WidgetBase
	 * @param {String} type 事件类型
	 * @param {Function} handler 处理函数
	 * @return {Object} 当前对象
	 */
	on: function(type, handler) {
		this.__eventDriven.on(type, handler);
		return this;
	},

	/**
	 * 注销组件事件监听
	 * @method off
	 * @for WidgetBase
	 * @param {String} [type] 事件类型。如不指定，则注销所有事件的监听
	 * @param {Function} [handler] 处理函数。如不指定，则注销指定事件的所有监听
	 * @return {Object} 当前对象
	 */
	off: function(type, handler) {
		this.__eventDriven.off(type, handler);
		return this;
	},

	/**
	 * 触发组件事件
	 * @method _trigger
	 * @protected
	 * @for WidgetBase
	 * @param {String} type 事件类型
	 * @param {Object} [props] 事件属性
	 * @return {Object} 事件参数
	 */
	_trigger: function(type, props) {
		return this.__eventDriven.trigger(type, props, this);
	},

	/**
	 * 销毁组件
	 * @method destroy
	 * @for WidgetBase
	 */
	destroy: function() {
		var t = this;
		if (t.__inited) {
			/**
			 * 组件销毁前触发
			 * @event destroy
			 * @for WidgetBase
			 */
			t._trigger('destroy');

			t._destroy(t._options);

			// 注销DOM事件监听
			t._offDOMEvent();
			// 注销组件事件监听
			t.off();

			// 移除属性
			for (var i in t) {
				if (t.hasOwnProperty(i) && i !== '_options') {
					delete t[i];
				}
			}
		}
	},

	/**
	 * 销毁组件主体（由destroy调用）。此方法由子类实现
	 * @method _destroy
	 * @protected
	 * @for WidgetBase
	 * @param {Object} 组件选项
	 */
	_destroy: function(options) { },

	/**
	 * 修改组件选项（此操作会导致组件销毁并重新初始化）
	 * @method options
	 * @for WidgetBase
	 * @param {Object} newOptions 新选项
	 */
	options: function(newOptions) {
		var t = this;

		t.destroy();

		base.extend(t._options, newOptions);
		if (!t._options.disabled) { t.init(); }
	}
});


/**
 * 创建组件
 * @method create
 * @param {Object} [methods] 方法
 * @param {Object} [defaultOptions] 默认组件选项
 * @param {Function} [parentWidget] 父组件，默认为WidgetBase
 * @return {Function} 组件类
 */
exports.create = function(methods, defaultOptions, parentWidget) {
	parentWidget = parentWidget || WidgetBase;

	// 继承父类的默认选项
	if (parentWidget && parentWidget.defaultOptions) {
		defaultOptions = base.customExtend(
			defaultOptions || { }, parentWidget.defaultOptions, {
				overwrite: false
			}
		);
	}

	// 子类构造函数会执行初始化逻辑，父类构造函数不需要做任何事
	var trueParentWidget = function() { };
	trueParentWidget.prototype = parentWidget.prototype;

	var WidgetClass = base.createClass(function(options) {
		this._options = base.extend({ }, defaultOptions, options);
		if (!this._options.disabled) {
			this.init();
		}
	}, methods, trueParentWidget);

	WidgetClass.defaultOptions = defaultOptions;

	return WidgetClass;
};

});