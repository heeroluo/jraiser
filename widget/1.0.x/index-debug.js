/*!
 * jRaiser 2 Javascript Library
 * widget - v1.0.0 (2013-01-09T18:04:43+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * widget模块提供创建部件接口
 * @module widget/1.0.x/
 * @category Infrastructure
 */

var base = require('base/1.0.x/'), EventDriven = require('event-driven/1.0.x/');


/**
 * 部件基类
 * @class WidgetBase
 * @constructor
 * @extends EventDriven
 */
var WidgetBase = base.createClass(function() {
	
}, {
	/**
	 * 初始化部件
	 * @method init
	 * @for WidgetBase
	 */
	init: function() {
		if (!this._inited) {
			this._init(this._options);
			this._inited = true;
		}
	},

	/**
	 * 初始化部件主体。此方法由init方法调用
	 * @method _init
	 * @protected
	 * @for WidgetBase
	 * @param {Object} 部件设置
	 */
	_init: function(options) {

	},

	/**
	 * 销毁部件
	 * @method destroy
	 * @for WidgetBase
	 */
	destroy: function() {
		if (this._inited) {
			this._destroy(this._options);
			delete this._inited;
		}
	},

	/**
	 * 销毁部件主体。此方法由destroy方法调用
	 * @method _destroy
	 * @protected
	 * @for WidgetBase
	 * @param {Object} 部件设置
	 */
	_destroy: function(options) {

	},

	/**
	 * 修改部件设置（此操作会导致部件销毁并重新初始化）
	 * @param {Object} newOptions 新设置
	 */
	options: function(newOptions) {
		this.destroy();
		base.mix(this._options, newOptions);
		if (this._options.enable) {
			this.init();
		}
	}
}, EventDriven);

/**
 * 创建部件
 * @method create
 * @param {Function} body 构造函数
 * @param {Object} [methods] 方法
 * @param {Object} [defaultOptions] 默认部件配置
 * @param {Function} [parentClass] 父类，默认为WidgetBase
 * @return {Function} 部件类
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
		return base.extend({
			enable: true
		}, defaultOptions, options);
	};

	var trueClass = base.createClass(function(options) {
		options = this._options = extendOptions(options);

		body.call(this, options);

		if (options.enable) {
			this.init();
		}
	}, methods, parentClass, function(options) {
		options = extendOptions(options);
		// 不初始化父类，子类初始化时才调用init方法
		options.enable = false;
		return [options];
	});

	trueClass.defaultOptions = defaultOptions;

	return trueClass;
}

// See line 17
exports.WidgetBase = WidgetBase;
// See line 85
exports.create = create;

});