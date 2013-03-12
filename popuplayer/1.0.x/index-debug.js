/*!
 * jRaiser 2 Javascript Library
 * popuplayer - v1.0.0 (2013-01-13T19:24:51+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本部件提供弹出层效果
 * @module popuplayer/1.0.x/
 * @category Widget
 */

var base = require('base/1.0.x/'), widget = require('widget/1.0.x/');


/**
 * 弹出层UI部件
 * @class PopupLayer
 * @constructor
 * @extends widget/1.0.x/{WidgetBase}
 * @exports
 * @param {Object} options 部件设置
 *   @param {NodeList} options.wrapper 弹出层所在容器
 *   @param {Boolean} [options.visible=false] 初始状态下是否可见
 *   @param {String} [options.popupWhen='mouseenter'] 触发显示的动作
 *   @param {String} [options.closeWhen='mouseleave'] 触发隐藏的动作
 *   @param {Object} [options.popupStyle] 显示状态下添加的样式，默认为display:block
 *   @param {Object} [options.closedStyle] 隐藏状态下添加的样式，默认为display:none
 *   @param {String} [options.popupClass='ui-popuplayer-popup'] 显示状态下添加的样式类
 *   @param {Object} [options.animation] 动画参数，为空时无动画效果
 *   @param {Number} [options.closeDelay=50] 关闭延时
 */
return widget.create(function(options) {
	var t = this, wrapper = t._wrapper = options.wrapper;

	// 找出弹出触发元素以及弹出内容
	t._popupTrigger = wrapper.find('.ui-popup-trigger');
	t._popupContent = wrapper.find('.ui-popup-content');

	// 默认触发元素为外层容器
	if (!t._popupTrigger.length) { t._popupTrigger = wrapper; }
	// 默认弹出元素为外层容器
	if (!t._popupContent.length) { t._popupContent = wrapper; }
}, {
	_init: function(options) {
		var t = this;

		/*
		 * 弹出内容层
		 * @method popup
		 * @for PopupLayer
		 */
		t.popup = function() {
			t._cancelCloseTimer();
			if (t._visible !== true) { t._doAction(true); }
		};

		/*
		 * 关闭内容层
		 * @method close
		 * @for PopupLayer
		 */
		t.close = function() {
			t._cancelCloseTimer();
			var close = function() {
				if (t._visible !== false) { t._doAction(false); }
			};
			if (options.closeDelay) {
				t._closeTimer = setTimeout(close, options.closeDelay);
			} else {
				close();
			}
		};

		/*
		 * 如果内容层已弹出，则关闭；如果内容层已关闭，则弹出
		 * @method popup
		 * @for PopupLayer
		 */
		t.toggle = function() {
			if (t._visible === true) {
				t.close();
			} else {
				t.popup();
			}
		};

		if (t._popupTrigger && options.popupWhen) {
			if (options.popupWhen === options.closeWhen) {
				// 弹出动作和关闭动作一样，即toggle效果
				t._popupTrigger.on(options.popupWhen, t.toggle);
			} else {
				t._popupTrigger
					.on(options.popupWhen, t.popup)
					.on(options.closeWhen, t.close);
			}
		}

		t._popupStyle = base.extend({ }, options.popupStyle);
		t._closedStyle = base.extend({ }, options.closedStyle);

		// 初始化状态
		if (options.visible) {
			t.popup();
		} else {
			t.close();
		}
	},

	_destroy: function(options) {
		var t = this;

		if (t._popupTrigger) {
			t._popupTrigger.off(options.popupWhen, t.toggle)
				.off(options.popupWhen, t.popup)
				.off(options.closeWhen, t.close);
		}

		delete t.toggle;
		delete t.popup;
		delete t.close;
		delete t._popupStyle;
		delete t._closedStyle;
		delete t._visible;

		t._cancelCloseTimer();
	},

	/**
	 * 取消延时关闭
	 * @method _cancelCloseTimer
	 * @for PopupLayer
	 * @protected
	 */
	_cancelCloseTimer: function() {
		if (this._closeTimer) {
			clearTimeout(this._closeTimer);
			delete this._closeTimer;
		}
	},

	/**
	 * 计算弹出时的样式
	 * @method _computeStyle
	 * @param {String} styleName 样式名
	 * @for PopupLayer
	 * @protected
	 */
	_computeStyle: function(styleName) {
		var t = this,
			content = t._popupContent,
			style = t['_' + styleName],
			styleOpt = t._options[styleName];

		if (content.css('display') !== 'none' && content.css('visibility') === 'hidden') {
			// 自适应宽度计算
			var rawContent = content.get(0), temp;
			if (styleOpt.width === '' || styleOpt.height === '') {
				temp = {
					width: rawContent.style.width,
					height: rawContent.style.height,
					visibility: 'hidden'
				};

				content.css({
					width: styleOpt.width,
					height: styleOpt.height,
					visibility: 'visible'
				});

				['width', 'height'].forEach(function(which) {
					if (t._popupStyle[which] === '') {
						style[which] = content[which]();
					}
				});

				content.css(temp);
			}
		}
	},

	/**
	 * 执行动作
	 * @method _doAction
	 * @protected
	 * @for PopupLayer
	 * @param {Boolean} 是否弹出
	 */
	_doAction: function(isPopup) {
		/**
		 * 弹出前触发
		 * @event beforepopup
		 * @for PopupLayer
		 * @param {Object} e 事件对象
		 *   @param {Function} e.preventDefault() 如果调用了此方法，则层不会弹出
		 */
		/**
		 * 关闭前触发
		 * @event beforeclose
		 * @for PopupLayer
		 * @param {Object} e 事件对象
		 *   @param {Function} e.preventDefault() 如果调用了此方法，则层不会关闭
		 */
		var t = this, e = t.trigger(isPopup ? 'beforepopup' : 'beforeclose');

		if ( !e.isDefaultPrevented() ) {
			var animation = t._options.animation,
				styleName = isPopup ? 'popupStyle' : 'closedStyle',
				style = t['_' + styleName];

			t._computeStyle(styleName);

			if (animation) {
				t._popupContent.animate( style, base.mix({
					callback: t._actionDone.bind(t, isPopup)
				}, animation, { overwrite: false }) );
			} else {
				t._popupContent.css(style);
				t._actionDone(isPopup);
			}
		}
	},

	/**
	 * 完成动作后的回调
	 * @method _actionDone
	 * @protected
	 * @for PopupLayer
	 * @param {Boolean} 是否弹出
	 */
	_actionDone: function(isPopup) {
		var className = this._options.popupClass;
		if (className) {
			this._wrapper[isPopup ? 'addClass' : 'removeClass'](className);
		}
		this._visible = isPopup;

		/**
		 * 弹出后触发
		 * @event afterpopup
		 * @for PopupLayer
		 */
		/**
		 * 关闭后触发
		 * @event afterclose
		 * @for PopupLayer
		 */
		this.trigger(isPopup ? 'aftershow' : 'afterclose');
	}
}, {
	wrapper: null,
	visible: false,
	popupWhen: 'mouseenter',
	closeWhen: 'mouseleave',
	popupStyle: {
		width: '',
		height: '',
		visibility : 'visible'
	},
	closedStyle: {
		width: 0,
		height: 0,
		visibility : 'hidden'
	},
	popupClass: 'ui-popuplayer-popup',
	animation: null,
	closeDelay: 50
});

});