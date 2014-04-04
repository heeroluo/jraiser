/*!
 * JRaiser 2 Javascript Library
 * widget - v1.0.2 (2013-10-16T18:03:41+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * widget模块提供创建组件接口
 * @module widget/1.0.x/
 * @category Infrastructure
 */

var base = require('base/1.0.x/'), EventDriven = require('event-driven/1.0.x/');


/**
 * 组件基类
 * @class WidgetBase
 * @constructor
 * @extends EventDriven
 */
var WidgetBase = base.createClass(function() {
	
}, {
	/**
	 * 初始化组件
	 * @method init
	 * @for WidgetBase
	 */
	init: function() {
		if (!this._inited) {
			var events = this._options.events;
			if (events) {
				for (var e in events) {
					this.on(e, events[e]);
				}
			}
			this._init(this._options);
			this._inited = true;
		}
	},

	/**
	 * 初始化组件主体。此方法由init方法调用
	 * @method _init
	 * @protected
	 * @for WidgetBase
	 * @param {Object} 组件设置
	 */
	_init: function(options) { },

	/**
	 * 销毁组件
	 * @method destroy
	 * @for WidgetBase
	 */
	destroy: function() {
		if (this._inited) {
			this._destroy(this._options);
			this.off();
			delete this._inited;
		}
	},

	/**
	 * 销毁组件主体。此方法由destroy方法调用
	 * @method _destroy
	 * @protected
	 * @for WidgetBase
	 * @param {Object} 组件设置
	 */
	_destroy: function(options) { },

	/**
	 * 修改组件设置（此操作会导致组件销毁并重新初始化）
	 * @method options
	 * @for WidgetBase
	 * @param {Object} newOptions 新设置
	 */
	options: function(newOptions) {
		this.destroy();
		base.mix(this._options, newOptions);
		if (!this._options.disabled) {
			this.init();
		}
	}
}, EventDriven);

/**
 * 创建组件
 * @method create
 * @param {Function} body 构造函数
 * @param {Object} [methods] 方法
 * @param {Object} [defaultOptions] 默认组件配置
 * @param {Function} [parentClass] 父类，默认为WidgetBase
 * @return {Function} 组件类
 */
function create(body, methods, defaultOptions, parentClass) {
	parentClass = parentClass || WidgetBase;

	// 继承父类的默认设置
	if (parentClass && parentClass.defaultOptions) {
		defaultOptions = base.mix(defaultOptions || { }, parentClass.defaultOptions, {
			overwrite: false
		});
	}

	var extendOptions = function(options) {
		return base.extend({ }, defaultOptions, options);
	};

	var trueClass = base.createClass(function(options) {
		// disabled参数，兼容原来的enable
		if ( options && ('enable' in options) ) {
			options.disabled = !options.enable;
			delete options.enable;
		}

		options = this._options = extendOptions(options);

		body.call(this, options);

		if (!options.disabled) {
			this.init();
		}
	}, methods, parentClass, function(options) {
		options = extendOptions(options);
		// 不初始化父类，子类初始化时才调用init方法
		options.disabled = true;
		return [options];
	});

	trueClass.defaultOptions = defaultOptions;

	return trueClass;
}

// See line 17
exports.WidgetBase = WidgetBase;
// See line 90
exports.create = create;

});