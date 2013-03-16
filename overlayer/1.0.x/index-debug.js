/*!
 * jRaiser 2 Javascript Library
 * overlayer - v1.0.0 (2013-03-16T19:47:18+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 覆盖层组件
 * @module overlayer/1.0.x/
 * @category Widget
 */

var base = require('base/1.0.x/'),
	widget = require('widget/1.0.x/'),
	$ = require('dom/1.0.x/');


// 检查浏览器是否支持position:fixed
var supportFixed = !(/MSIE\s(\d+)/.test(window.navigator.userAgent) &&
	parseInt(RegExp.$1, 10) < 7);


/**
 * 覆盖层组件类
 * @class Overlayer
 * @extends widget/1.0.x/{WidgetBase}
 * @exports
 * @constructor
 * @param {Object} options 组件设置
 *   @param {NodeList} options.wrapper 覆盖目标
 *   @param {Number} [options.opacity=0.6] 覆盖层不透明度
 *   @param {String} [options.backgroundColor='black'] 覆盖层背景色
 *   @param {String} [options.zIndex='black'] 覆盖层z-index
 *   @param {String} [options.className='overlayer'] 覆盖层的样式类
 *   @param {Boolean} [options.visible=true] 初始状态下是否可见
 *   @param {Object|Boolean} [options.fade] 渐显渐隐动画参数，默认为按动画默认参数，
 *     false时为不使用动画
 */
return widget.create(function(options) {

}, {
	_init: function(options) {
		var t = this,
			wrapper = options.wrapper,
			useFixed = wrapper.prop('tagName') === 'BODY' && supportFixed;

		// 如果是body的覆盖层，可使用fixed定位，
		// 这样窗口大小变化的时候，不用重设宽高
		var overlayer = t._overlayer = $('<div></div>').css({
			top: 0,
			left: 0,
			position: useFixed ? 'fixed' : 'absolute',
			display: 'none'
		});
		if (useFixed) {
			overlayer.css({
				width: '100%',
				height: '100%'
			});
		}
		['backgroundColor', 'zIndex'].forEach(function(styleName) {
			overlayer.css(styleName, options[styleName]);
		});
		if (options.className) { overlayer.addClass(options.className); }

		/**
		 * 根据父层尺寸重设覆盖层尺寸
		 * @method adjustSize
		 * @for Overlayer
		 */
		if (useFixed) {
			// 使用fixed的情况下，无须调整大小
			t.adjustSize = function() { };
		} else {
			t.adjustSize = function() {
				if (t._visible === false) { return; }

				var width = wrapper.get(0).scrollWidth,
					height = wrapper.get(0).scrollHeight;

				if (t._layerWidth !== width) {
					overlayer.css('width', width);
					t._layerWidth = width;
				}
				if (t._layerHeight !== height) {
					overlayer.css('height', height);
					t._layerHeight = height;
				}
			};
		}

		if (wrapper.prop('tagName') !== 'BODY') {
			wrapper.css('position', 'relative');
		}

		t.adjustSize();
		if (!useFixed) { $(window).on('resize', t.adjustSize); }

		wrapper.append(overlayer);

		if (options.visible) { t.show(); }
	},

	_destroy: function() {
		var t = this;

		$(window).off('resize', t.adjustSize);
		delete t.adjustSize;

		t._overlayer.remove();
		delete t._overlayer;

		delete t._layerWidth;
		delete t._layerHeight;

		delete t._visible;
	},

	/**
	 * 显示覆盖层
	 * @method show
	 * @for Overlayer
	 */
	show: function() { this._doAction(true); },

	/**
	 * 隐藏覆盖层
	 * @method hide
	 * @for Overlayer
	 */
	hide: function() { this._doAction(false); },

	/**
	 * 如果覆盖层不可见，则显示；如果覆盖层可见，则隐藏
	 * @method toggle
	 * @for Overlayer
	 */
	toggle: function() {
		if (this._visible) {
			this.hide();
		} else {
			this.show();
		}
	},

	/**
	 * 执行动作
	 * @method _doAction
	 * @protected
	 * @for Overlayer
	 * @param {Boolean} visible 是否可见
	 */
	_doAction: function(visible) {
		/**
		 * 显示前触发
		 * @event beforeshow
		 * @for Overlayer
		 * @param {Object} e 事件对象
		 *   @param {Function} e.preventDefault() 如果调用了此方法，则层不会显示
		 */
		/**
		 * 隐藏前触发
		 * @event beforehide
		 * @for Overlayer
		 * @param {Object} e 事件对象
		 *   @param {Function} e.preventDefault() 如果调用了此方法，则层不会隐藏
		 */
		var t = this, e = t.trigger(visible ? 'beforeshow' : 'beforehide');

		if ( e.isDefaultPrevented() ) { return; }

		var overlayer = t._overlayer;
		if (overlayer) {
			if (visible) { t.adjustSize(); }

			var fade = t._options.fade;
			if (fade) {
				if (visible) {
					overlayer.css({
						opacity: 0,
						display: 'block'
					});
				}
				overlayer.animate({
					opacity: visible ? t._options.opacity : 0,
					display: visible ? 'block' : 'none'
				}, base.mix({
					callback: function() {
						t._actionDone(visible);
					}
				}, fade, {
					overwrite: false
				}));
			} else {
				overlayer[visible ? 'show' : 'hide']();
				t._actionDone(visible);
			}
		}
	},

	/**
	 * 完成动作
	 * @method _actionDone
	 * @protected
	 * @for Overlayer
	 * @param {Boolean} visible 是否可见
	 */
	_actionDone: function(visible) {
		this._visible = visible;

		/**
		 * 显示后触发
		 * @event aftershow
		 * @for Overlayer
		 */
		/**
		 * 隐藏后触发
		 * @event afterhide
		 * @for Overlayer
		 */
		this.trigger(visible ? 'aftershow' : 'afterhide');
	}
}, {
	opacity: 0.6,
	zIndex: 1000,
	backgroundColor: 'black',
	className: 'overlayer',
	visible: false,
	fade: { }
});

});