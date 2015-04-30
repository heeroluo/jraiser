/*!
 * JRaiser 2 Javascript Library
 * widget - v1.1.0 (2015-04-30T12:11:42+0800)
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
	$ = require('dom/1.1.x/');


/**
 * 组件基类
 * @class WidgetBase
 * @constructor
 * @extends EventDriven
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
			// 创建事件驱动对象，并添加选项对象中指定的事件监听
			t.__eventDriven = new EventDriven(options.events);

			// 生成DOM事件名字空间
			t.__domEventNamespace = base.randomStr('.widget-');
			// 存放绑定了事件监听记录
			t.__domEventRecord = {
				elements: [ ],	// 存放绑定了事件监听的元素
				types: { }		// 对应存放监听的事件类型
			};

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
	 * @param {String} [type] 事件类型。如不指定，则注销所有事件类型的监听
	 * @param {Function} [handler] 处理函数。如不指定，则注销指定事件类型的所有监听
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

	// 事件类型转换为数组，并添加命名空间
	__normalizeDOMEventTypes: function(types) {
		if (typeof types === 'string') { types = types.split(/\s+/); }
		if (types.length) {
			var domEventNamespace = this.__domEventNamespace;
			// 添加命名空间到事件类型
			return types.map(function(type) {
				return type + domEventNamespace;
			});
		}
	},

	/**
	 * 注册DOM元素事件监听（通过本方法注册的事件监听会在组件销毁时注销）
	 * @method _onDOMEvent
	 * @protected
	 * @for WidgetBase
	 * @param {NodeList} elements 元素
	 * @param {String|Array} types 事件类型
	 * @param {Function} handler 监听函数
	 * @param {Object} options 其他选项
	 */
	_onDOMEvent: function(elements, types, handler, options) {
		types = this.__normalizeDOMEventTypes(types);

		var elementRecord = this.__domEventRecord.elements,
			typeRecord = this.__domEventRecord.types;

		elements
			.on(types, handler, options)
			.forEach(function(element) {
				// 记录元素
				var i = elementRecord.indexOf(element);
				if (i === -1) {
					i = elementRecord.push(element) - 1;
					typeRecord[i] = { };
				}
				// 记录事件类型
				types.forEach(function(type) {
					typeRecord[i][type] = true;
				});
			});
	},

	/**
	 * 移除DOM元素事件监听（通过_onDOMEvents添加的事件监听要用此方法移除）
	 * @method _offDOMEvents
	 * @protected
	 * @for WidgetBase
	 * @param {NodeList} elements 元素。如不指定，则注销所有已记录的事件监听
	 * @param {String|Array} types 事件类型。如不指定，则注销指定元素所有已记录的事件监听
	 */
	_offDOMEvent: function(elements, types) {
		var elementRecord = this.__domEventRecord.elements,
			typeRecord = this.__domEventRecord.types;

		switch (arguments.length) {
			case 0:
				// 注销所有已记录的事件监听
				elementRecord.forEach(function(element, i) {
					$(element).off( Object.keys(typeRecord[i]) );
				});
				this.__domEventRecord = {
					elements: [ ],
					types: { }
				};
				break;

			case 1:
				// 注销指定元素的所有事件监听
				elements.forEach(function(element) {
					var i = elementRecord.indexOf(element);
					if (i !== -1) {
						$(element).off( Object.keys(typeRecord[i]) );
						elementRecord.splice(i, 1);
						delete typeRecord[i];
					}
				});
				break;

			case 2:
				types = this.__normalizeDOMEventTypes(types);
				// 注销指定元素的指定类型的事件监听
				elements.forEach(function(element) {
					var i = elementRecord.indexOf(element);
					if (i !== -1) {
						$(element).off(types);
						types.forEach(function(type) {
							delete typeRecord[i][type];
						});
						if ( base.isEmptyObject(typeRecord[i]) ) {
							elementRecord.splice(i, 1);
							delete typeRecord[i];
						}
					}
				});
				break;
		}
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

			// 注销DOM元素的事件监听
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