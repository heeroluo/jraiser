/*!
 * JRaiser 2 Javascript Library
 * validator-step - v1.0.0 (2013-10-06T10:41:35+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 表单验证步骤
 * @module validator/1.0.x/step
 * @category Widget
 */

var base = require('base/1.0.x/'),
	$ = require('dom/1.0.x/'),
	ajax = require('ajax/1.1.x/'),
	widget = require('widget/1.0.x/');


// 把{key:array}的结构转换成[{key:item},....]
function mapToArray(map, key) {
	var data, i, result = [ ];

	if ( base.isArray(map) ) {
		data = map;
		map = { };
		map[key] = data;
	}

	for (key in map) {
		data = map[key];
		for (i = 0; i < data.length; i++) {
			if (data[i] != null) {
				result.push({
					name: key,
					value: data[i]
				});
			}
		}
	}

	return result;
}

// 自动编号id
var autoId = 0;


/**
 * 表单验证步骤
 * @class Step
 * @extends widget/1.0.x/{WidgetBase}
 * @constructor
 * @exports
 * @param {Object} options 步骤设置
 *   @param {String|Array<String>} [options.fields] 相关字段名
 *   @param {String|Function} options.rule 验证规则
 *   @param {Object} [options.ajaxSettings] 远程验证AJAX参数，为空时则使用表单验证组件的同名参数
 *   @param {Number} [options.eventMode=1] 当表单验证组件与步骤有相同的事件时，采用何种触发模式：
 *     1-两者均触发；2-只触发步骤的事件
 *   @param {String} [options.eventElements] 事件参数中相关字段元素的过滤条件。
 *     如不指定，则相关字段元素为表单内name为字段名的所有元素
 *   @param {Boolean} [options.stepDisabled] 是否禁用此规则
 */
return widget.create(function(options) {

}, {
	_init: function(options) {
		var t = this;

		t._id = ++autoId;

		// 记录表单验证组件的一些参数
		t._vOptions = { };

		t._fields = options.fields || [ ];
		if (typeof t._fields === 'string') { t._fields = t._fields.split(/\s+/); }

		t._rule = options.rule;
		if (typeof t._rule === 'string') {
			var refVars = [ ];
			t._ruleNames = [ ];

			// 把规则“编译”为函数
			var fnBody = t._rule.replace(
				/(\w+)(?::([^!&|()]+))?/g,
				function(match, $1, $2) {
					t._ruleNames.push($1);

					var replacement = '_helpers_.' + $1 + '(_val_';
					if ($2) {
						replacement += ',_refVars_[' + (refVars.push($2) - 1) + ']';
					}
					replacement += ')';

					return replacement;
				}
			);
			var fn = new Function(
				'_val_', '_refVars_', '_helpers_',
				'return ' + fnBody + ';'
			);

			fnBody = null;
			if (!refVars.length) { refVars = null; }

			t._rule = function(val, helpers) { return fn(val, refVars, helpers); };
		}

		if (options.stepDisabled) {
			t.disableStep();
		} else {
			t.enableStep();
		}
	},

	_destroy: function(options) {
		delete this._id;
		delete this._vOptions;
		delete this._fields;
		delete this._rule;
		delete this._ruleNames;
		delete this._message;
		delete this._stepDisabled;
		delete this._remoteCache;
	},

	/**
	 * 获取步骤编号
	 * @method id
	 * @for Step
	 * @return {Number} 步骤编号
	 */
	id: function() { return this._id; },

	/**
	 * 获取相关字段名
	 * @method fields
	 * @for Step
	 * @return {Array<String>} 相关字段名
	 */
	fields: function() { return this._fields.slice(); },

	/**
	 * 获取当前步骤是否为远程验证
	 * @method isRemote
	 * @for Step
	 * @return {Boolean} 当前步骤是否为远程验证
	 */
	isRemote: function() { return !!this._options.remoteURL; },

	/**
	 * 获取当前步骤是否被禁用
	 * @method disabled
	 * @for Step
	 * @return {Boolean} 当前步骤是否被禁用
	 */
	stepDisabled: function() { return this._stepDisabled; },

	/**
	 * 启用当前步骤
	 * @method enable
	 * @for Step
	 */
	enableStep: function() { this._stepDisabled = false; },

	/**
	 * 禁用当前步骤
	 * @method enable
	 * @for Step
	 */
	disableStep: function() { this._stepDisabled = true; },

	/**
	 * 同步表单验证组件的设置
	 * @method syncWithValidator
	 * @for Step
	 * @param {Object} vOptions 表单验证组件设置
	 */
	syncWithValidator: function(vOptions) {
		this._vOptions = base.extend({ }, vOptions);
	},

	/**
	 * 执行验证
	 * @method exec
	 * @for Step
	 * @param {Array<Element>} elements 相关字段元素
	 * @param {Object} values 相关字段值
	 * @param {Object} helpers 预置验证函数
	 * @param {Boolean} ignoreRemote 是否忽略远程验证
	 * @return {Number|Object} 如果验证不通过，则返回错误对象；
	 *   如果步骤被禁用，则返回0；其他情况无返回值
	 */
	exec: function(elements, values, helpers, ignoreRemote) {
		var t = this;

		if ( t.stepDisabled() ) { return 0; }

		// 检查预置规则是否存在
		var ruleNames = t._ruleNames;
		if (ruleNames) {
			for (var i = ruleNames.length - 1; i >= 0; i--) {
				if (!helpers[ ruleNames[i] ]) {
					throw new Error('not such rule(' + ruleNames[i] + ')');
				}
			}
		}

		/**
		 * 验证前触发
		 * @event beforevalidate
		 * @for Step
		 * @param {Object} e 事件参数
		 *   @param {Array} e.elements 相关字段元素
		 */
		t.trigger('beforevalidate', {
			elements: elements.slice()
		});

		var fields = this._fields, totalFields = fields.length;
		if (totalFields === 1) { values = values[ fields[0] ]; }

		var options = t._options, result = true, errElements;
		if (totalFields !== 1 || options.oneByOne === false || options.remoteURL) {
			// 只有一个字段时，检查是否必填
			if (totalFields === 1 && options.required !== false) {
				result = values.length > 0 && values.join('') !== '';
			}
			if (result && t._rule) {
				if (options.remoteURL) {
					var onRemoteSuccess = function(result) {
						t._remoteCache = result;
						t._message = t._rule.call(window, result);
						if (t._message) {
							return t._error(elements.slice(), true);
						} else {
							t._correct(elements.slice(), true);
						}
						onRemoteSuccess = null;
					};

					if (ignoreRemote) {
						// 忽略远程验证时，使用上次验证时的缓存
						if ('_remoteCache' in t) { return onRemoteSuccess(t._remoteCache); }
					} else {
						t._beforeSend( elements.slice() );
						// 远程验证
						ajax.send(
							options.remoteURL,
							base.mix({
								data: mapToArray(values, fields[0]),
								onsuccess: onRemoteSuccess
							}, options.ajaxSettings || t._vOptions.ajaxSettings, {
								overwrite: false
							})
						);
						return;
					}
				} else {
					// 自定义规则验证
					var args;
					switch (totalFields) {
						case 0:
							args = [ ];
							break;

						case 1:
							args = [values.slice()];
							break;

						default:
							args = fields.map(function(f) {
								return values[f] ? values[f].slice() : null;
							});
					}
					args.push(helpers);
					result = t._rule.apply(window, args);
					if (typeof result === 'string') {
						t._message = result;
						result = false;
					}
				}
			}
			if (!result) { errElements = elements.slice(); }
		} else {
			result = options.required === false || values.length > 0;
			if (result) {
				var errElements = [ ];
				// 逐个值进行检查
				values.every(function(val, i) {
					var subResult, isEmpty = val === '' || val == null;
					if (options.required === false) {
						if (isEmpty) {
							return true;
						} else {
							subResult = true;
						}
					} else {
						subResult = !isEmpty;
					}

					if (subResult && val != null && t._rule) {
						subResult = t._rule.call(window, val, helpers);
					}
					if (!subResult) {
						errElements.push(elements[i]);
					}

					result = result && subResult;

					return subResult || !t._vOptions.breakOnError;
				});
			} else {
				errElements = elements.slice();
			}
		}

		if (result) {
			t._correct( elements.slice() );
		} else {
			return t._error(errElements, true);
		}
	},

	/**
	 * 添加事件参数属性
	 * @method _makeEventArg
	 * @protected
	 * @for Step
	 * @param {Object} e 源对象
	 */
	_makeEventArg: function(e) {
		e.stepId = this.id();
		if (this._options.eventElements) {
			e.elements = base.toArray(
				$(e.elements).filter(this._options.eventElements)
			);
		}

		return e;
	},

	/**
	 * 触发远程验证前的操作
	 * @method _beforeSend
	 * @protected
	 * @for Step
	 * @param {Array<Elements>} elements 相关字段元素
	 * @return {Object} 事件参数
	 */
	_beforeSend: function(elements) {
		var e = this._makeEventArg({
			elements: elements
		});

		if (this._options.eventMode == 1 && this._vOptions.beforeSend) {
			this._vOptions.beforeSend.call(window, e);
		}

		/**
		 * 发送远程验证前触发
		 * @event beforesend
		 * @for Step
		 * @param {Object} e 事件参数
		 *   @param {Array<Element>} e.elements 相关字段元素
		 */
		this.trigger('beforesend', e);

		return e;
	},

	/**
	 * 触发验证错误的操作
	 * @method _error
	 * @protected
	 * @for Step
	 * @param {Array<Element>} elements 相关字段元素
	 * @param {Boolean} [isRemote] 是否远程验证
	 * @return {Object} 事件参数
	 */
	_error: function(elements, isRemote) {
		var e = this._makeEventArg({
			elements: elements,
			isRemote: !!isRemote,
			message: this._message || this._options.message
		});

		if (this._options.eventMode == 1 && this._vOptions.onError) {
			this._vOptions.onError.call(window, e);
		}
		/**
		 * 验证不通过时触发
		 * @event error
		 * @for Step
		 * @param {Object} e 事件参数
		 *   @param {Array<Element>} e.elements 相关字段元素
	 	 *   @param {String} e.message 错误信息
		 */
		this.trigger('error', e);

		return e;
	},

	/**
	 * 触发验证正确的操作
	 * @method _correct
	 * @protected
	 * @for Step
	 * @param {Array<Elements>} elements 相关字段元素
	 * @param {Boolean} [isRemote] 是否远程验证
	 * @return {Object} 事件参数
	 */
	_correct: function(elements, isRemote) {
		var e = this._makeEventArg({
			elements: elements,
			isRemote: !!isRemote
		});

		if (this._options.eventMode == 1 && this._vOptions.onCorrect) {
			this._vOptions.onCorrect.call(window, e);
		}
		/**
		 * 验证通过时触发
		 * @event correct
		 * @for Step
		 * @param {Object} e 事件参数
		 *   @param {Array<Element>} e.elements 相关字段元素
		 */
		this.trigger('correct', e);

		return e;
	}
}, {
	eventMode: 1
})

});