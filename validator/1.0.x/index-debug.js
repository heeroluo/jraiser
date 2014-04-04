/*!
 * JRaiser 2 Javascript Library
 * validator - v1.0.0 (2013-11-23T16:12:31+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 表单验证组件
 * @module validator/1.0.x/
 * @category Widget
 */

var base = require('base/1.0.x/'),
	ajax = require('ajax/1.1.x/'),
	$ = require('dom/1.0.x/'),
	widget = require('widget/1.0.x/'),
	Step = require('./step');


// 内置验证规则
var ruleHelpers = {
	// 是否非数字
	isNumber: function(val) { return !isNaN(val); },
	// 最小值
	min: function (val, ref) { return Number(val) >= ref; },
	// 最大值
	max: function (val, ref) { return Number(val) <= ref; },
	// 最小长度
	minLength: function (val, ref) { return val.length >= ref; },
	// 最大长度
	maxLength: function (val, ref) { return val.length <= ref; },
	// 是否Email
	isEmail: function(val) {
		var temp = /^[\w-]+(?:\.[\w-]+)*@[\w-]+(?:\.[\w-]+)*\.[a-zA-Z]{2,}$/.test(val);
		if (temp) {
			// 检查[@.]分隔的每一段是否以下划线、连字符开头或结尾
			// 最后一段不用检测，因为已经在正则里面限制
			temp = val.replace('@', '.').split('.');
			for (var i = temp.length - 2; i >= 0; i--) {
				if ( /^[-_]/.test(temp[i]) || /[_-]$/.test(temp[i]) ) {
					return false;
				}
			}
		} else {
			return false;
		}

		return true;
	},
	// 是否QQ号
	isQQ: function(val) { return /^[1-9]\d{4,}$/.test(val); },
	// 是否手机号码
	isMobileNO: function(val) { return /^1\d{10}$/.test(val) },
	// 是否固话号码
	isTelNO: function(val) { return /^(?:0\d{2,3}-)?[2-9]\d{6,7}(?:-\d{1,4})?$/.test(val); }
};


/**
 * 表单验证组件类
 * @class Validator
 * @extends widget/1.0.x/{WidgetBase}
 * @constructor
 * @exports
 * @param {Object} options 组件设置
 *   @param {NodeList} options.form 目标表单
 *   @param {Array<Object>} option.steps 验证步骤
 *   @param {Boolean} [options.validateOnChange=false] 是否在值变化后执行验证
 *   @param {Boolean} [options.breakOnError=false] 是否在遇到错误的时候中止后续验证
 *   @param {Object<String,Function>} [options.helpers] 预置验证函数
 *   @param {Function} [options.submitProxy] 表单提交代理函数。
 *     第一个参数是表单数据，第二个参数是表单
 */
return widget.create(function(options) {

}, {
	_init: function(options) {
		var t = this;

		if (!options.form || options.form.prop('nodeName') !== 'FORM') {
			throw new Error('please specify a form to validate');
		}
		if (!options.steps) {
			throw new Error('please specify validation steps');
		}

		t._form = options.form;
		t._helpers = base.extend({ }, ruleHelpers, options.helpers);

		function _beforeSend(e) { t.trigger('beforesend', e); }
		function _onCorrect(e) { t._stepCorrect(e); }
		function _onError(e) { t._stepError(e); }

		t._steps = options.steps;
		for (var i = t._steps.length - 1; i >= 0; i--) {
			if ( !(t._steps[i] instanceof Step) ) {
				t._steps[i] = new Step(t._steps[i]);
			}
			t._steps[i].syncWithValidator({
				ajaxSettings: options.ajaxSettings,
				breakOnError: options.breakOnError,
				beforeSend: _beforeSend,
				onCorrect: _onCorrect,
				onError: _onError
			});
		}

		// 是否在元素的change及blur事件中检查值的合法性
		if (options.validateOnChange) {
			t._onChange = function() {
				if (this.name) { t.validate(this.name); }
			};

			var $elements = $( base.toArray(t._form.get(0).elements) );
			$elements.filter('input[type=text],input[type=password],textarea')
				.on('blur', t._onChange);
			$elements.filter('input[type=checkbox],input[type=radio]')
				.on('click', t._onChange);
			$elements.filter('input[type=file],select').on('change', t._onChange);
		}

		t._onSubmit = function(e) {
			var errObjs = t.validateAll(true);
			if (errObjs && errObjs.length) {
				e.preventDefault();
				/**
				 * 提交表单出现验证错误时触发
				 * @event submiterror
				 * @for Validator
				 * @param {Object} e 事件对象
				 *   @param {Array<String>} e.errorSteps 验证错误的步骤
				 *   @param {String} e.target 目标表单
				 */
				t.trigger('submiterror', {
					errorObjs: errObjs,
					target: e.target
				});
			} else {
				/**
				 * 验证通过后表单发送前触发
				 * @event beforesubmit
				 * @for Validator
				 * @param {Object} e 事件对象
				 *   @param {String} e.target 目标表单
				 *   @param {Function} e.preventDefault() 可以调用此方法阻止表单提交
				 */
				var isDefaultPrevented = t.trigger('beforesubmit', {
					target: e.target
				}).isDefaultPrevented();

				if (isDefaultPrevented) {
					e.preventDefault();
					return;
				}

				if (options.submitProxy) {
					e.preventDefault();
					options.submitProxy.call(window, ajax.serializeForm(this), t._form);
				}
			}
		};

		t._form.on('submit', t._onSubmit);
	},

	_destroy: function() {
		var t = this;

		if (t._onChange) {
			$(t._form.get(0).elements)
				.off('change blur click', t._onChange);
			delete t._onChange;
		}

		t._form.off('submit', t._onSubmit);
		delete t._onSubmit;

		delete t._form;
		delete t._helpers;
		delete t._steps;
		delete t._remoteErrors;
	},

	/**
	 * 验证指定字段
	 * @method validate
	 * @for Validator
	 * @param {String|Array<String>} fields 字段
	 * @param {Boolean} ignoreRemote 是否忽略远程验证的步骤
	 * @return {Array} 验证错误的步骤
	 */
	validate: function(fields, ignoreRemote) {
		if (typeof fields === 'string') { fields = fields.split(/\s+/); }

		var steps = fields ? this._steps.filter(function(step) {
			for (var i = fields.length - 1; i >= 0; i--) {
				if (step.fields().indexOf(fields[i]) !== -1) { return true; }
			}
		}) : this._steps;

		return this._execSteps(steps, ignoreRemote);
	},

	/**
	 * 验证全部步骤
	 * @method validateAll
	 * @for Validator
	 * @param {Boolean} ignoreRemote 是否忽略远程验证步骤
	 * @return {Array} 验证错误的步骤
	 */
	validateAll: function(ignoreRemote) {
		return this._execSteps(this._steps, ignoreRemote);
	},

	/**
	 * 执行验证
	 * @method _execStep
	 * @protected
	 * @for Validator
	 * @param {Object} step 步骤
	 * @param {Boolean} ignoreRemote 是否忽略远程验证步骤
	 * @return {Object} 如果验证错误，则返回错误对象
	 */
	_execStep: function(step, ignoreRemote) {
		var fields = this._getFields( step.fields() );
		return step.exec(fields.elements, fields.values, this._helpers, ignoreRemote);
	},

	/**
	 * 执行指定步骤
	 * @method _execSteps
	 * @protected
	 * @for Validator
	 * @param {Array} steps 步骤
	 * @param {Boolean} ignoreRemote 是否忽略远程验证步骤
	 * @return {Array} 验证过程中产生的错误事件对象
	 */
	_execSteps: function(steps, ignoreRemote) {
		if (!steps || !steps.length) { return; }

		var	t = this,
			fieldStats = { },	// 记录验证涉及的字段及其状态
			errObjs = [ ];		// 记录错误事件对象

		steps.every(function(step) {
			if ( step.stepDisabled() ) { return true; }

			var fields = step.fields();

			var hasState = fields.some(function(name) {
				return !!fieldStats[name];
			});
			// 字段已经有错误或正在进行远程验证，不再继续验证
			if (hasState) { return true; }

			var err = t._execStep(step, ignoreRemote);
			if (err) { errObjs.push(err); }

			fields.forEach(function(name) {
				fieldStats[name] = err ? 1 : (step.isRemote() ? 2 : 0);
			});

			return !err || !t._options.breakOnError;
		});

		return errObjs;
	},

	/**
	 * 触发步骤验证错误的操作
	 * @method _stepError
	 * @protected
	 * @for Validator
	 * @param {Object} e 错误事件对象
	 */
	_stepError: function(e) {
		if (e.isRemote) {
			this._remoteErrors = this._remoteErrors || { };
			this._remoteErrors[e.stepId] = e;
		}

		/**
		 * 步骤验证错误时触发
		 * @event steperror
		 * @for Validator
		 * @param {Object} e 事件对象
		 *   @param {Array<Element>} e.elements 相关字段元素
		 *   @param {String} e.message 错误信息
		 */
		this.trigger('steperror', e);
	},

	/**
	 * 触发步骤验证通过的操作
	 * @method _stepCorrect
	 * @protected
	 * @for Validator
	 * @param {Object} e 事件对象
	 */
	_stepCorrect: function(e) {
		if (e.isRemote && this._remoteErrors) {
			delete this._remoteErrors[e.stepId];
		}

		/**
		 * 步骤验证通过时触发
		 * @event stepcorrect
		 * @for Validator
		 * @param {Object} e 事件对象
		 *   @param {Array<Element>} e.elements 相关字段元素
		 */
		this.trigger('stepcorrect', e);
	},

	/**
	 * 获取指定字段
	 * @method _getFields
	 * @for Validator
	 * @protected
	 * @param {Array<String>} fields 字段名
	 * @return {Object} 字段元素（数组结构）和字段值（{字段名:字段值数组}结构）
	 */
	_getFields: function(fields) {
		var elementsArray = [ ], valuesMap = { };

		if (fields && fields.length) {
			var elements = this._form.get(0).elements;
			for (var i = 0, elt, val; elt = elements[i]; i++) {
				if (elt.disabled || !elt.name || fields.indexOf(elt.name) === -1) {
					continue;
				}

				elementsArray.push(elt);

				if ( elt.nodeName === 'INPUT' && (elt.type === 'radio' || elt.type === 'checkbox') ) {
					val = elt.checked ? elt.value.trim() : null;
				} else {
					val = elt.value.trim();
				}
				valuesMap[elt.name] = valuesMap[elt.name] || [ ];
				valuesMap[elt.name].push(val);
			}
		}

		return {
			elements: elementsArray,
			values: valuesMap
		};
	}
}, {
	events: {
		submiterror: function(e) {
			alert( e.errorObjs.map(function(err) {
				return err.message;
			}).join('\r\n') );
			$(e.errorObjs[0].elements).focus();
		}
	}
});

});