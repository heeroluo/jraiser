/*!
 * jRaiser 2 Javascript Library
 * placeholder - v1.0.0 (2013-01-09T18:21:55+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本部件提供兼容旧浏览器的输入框占位符功能
 * @module placeholder/1.0.x/
 * @category Widget
 */

var $ = require('dom/1.0.x/'), widget = require('widget/1.0.x/');


// 检测是否原生支持placeholder
var isSupportPlaceholder = 'placeholder' in document.createElement('input');	


/**
 * 输入框占位符部件（本部件行为与浏览器内建的placeholder不完全一致
 *   ，当浏览器原生支持placeholder时，本部件不做任何操作）
 * @class Placeholder
 * @extends widget/1.0.x/{WidgetBase}
 * @exports
 * @constructor
 * @param {Object} options 部件设置
 *   @param {NodeList} options.inputs 目标输入框
 *   @param {NodeList} [options.classWhenOn='ui-placeholder-on'] 占位符处于显示状态时添加的样式类
 */
return widget.create(function(options) {

}, {
	_init: function(options) {
		// 如果原生支持placeholder，就不用折腾了
		if (isSupportPlaceholder) { return; }

		var t = this, inputs = options.inputs;

		t._onFocus = function() {
			var placeholder = this.getAttribute('placeholder');
			if (placeholder != null) {
				if (this.value.trim() === placeholder) { this.value = ''; }
			}
			$(this).removeClass(options.classWhenOn);
		};

		t._onBlur = function() {
			var placeholder = this.getAttribute('placeholder');
			if (placeholder != null) {
				var value = this.value.trim();
				if (!value || value === placeholder) {
					this.value = placeholder;
					$(this).addClass(options.classWhenOn);
				}
			}
		};

		/**
		 * 还原成真正的值
		 * @method toTrueValue
		 * @for Placeholder
		 */
		t.toTrueValue = function() {
			inputs.forEach(function(input) {
				var placeholder = input.getAttribute('placeholder');
				if (placeholder != null && this.value.trim() === placeholder) {
					this.value = '';
				}
			});
		};

		// 提交表单的时候要把占位值清掉
		inputs.parents('form').on('submit', t.toTrueValue);

		inputs.on('focus', t._onFocus).on('blur', t._onBlur).trigger('blur');
	},

	_destroy: function(options) {
		if (isSupportPlaceholder && options.usePlaceholder) { return; }

		var t = this, inputs = t._options.inputs;
		
		inputs.parents('form').off('submit', t.toTrueValue);
		inputs
			.off('focus', t._onFocus)
			.on('blur', t._onBlur)
			.removeClass(options.classWhenOn);

		delete t._onFocus;
		delete t._onBlur;
		delete t.toTrueValue;
	}
}, {
	classWhenOn: 'ui-placeholder-on'
});

});