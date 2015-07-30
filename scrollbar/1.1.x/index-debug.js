/*!
 * JRaiser 2 Javascript Library
 * scrollbar - v1.1.0 (2015-07-30T11:54:53+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 模拟滚动条组件
 * @module scrollbar/1.1.x/
 * @category Widget
 */

var base = require('base/1.1.x/'),
	$ = require('dom/1.1.x/'),
	widget = require('widget/1.1.x/'),
	Draggable = require('draggable/1.1.x/');


var TEMPLATE = '<div class="ui-scrollbar" style="position: absolute;">' +
	'<div class="ui-scrollbar__track" style="position: relative;">' +
		'<div class="ui-scrollbar__track__thumb"></div>' +
	'</div>' +
'</div>';


var mouseWheelEvent;
if ('onmousewheel' in document.body) {
	mouseWheelEvent = 'mousewheel';
} else {
	mouseWheelEvent = 'DOMMouseScroll';
}

var supportOverflowScrolling = 'webkitOverflowScrolling' in document.body.style;


/**
 * 模拟滚动条组件
 * @class Scrollbar
 * @extends widget/1.1.x/{WidgetBase}
 * @constructor
 * @exports
 * @param {Object} options 组件设置
 *   @param {NodeList} options.scrollBody 滚动主体
 *   @param {String} [options.axis='y'] 滚动条轴向，x为横向或y纵向
 *   @param {Number} [options.minThumbSize=20] 拖动条最小尺寸
 *   @param {Number} [options.mouseWheelStep=50] 滚一下鼠标滑轮移动的距离，为0的时候鼠标滑轮无效
 *   @param {Boolean} [options.scrollPageOnEnd=true] 滚到尽头的时候，是否允许页面滚动
 */
return widget.create({
	_init: function(options) {
		var axis = String(options.axis).toLowerCase();
		if (axis !== 'x' && axis !== 'y') { throw new Error('Axis must be "x" or "y"'); }

		var t = this;
		t._axis = axis;
		t._scrollBody = options.scrollBody;
		t._scrollOuter = t._scrollBody.parent();

		// iOS下直接用 -webkit-overflow-scrolling
		if (supportOverflowScrolling) {
			t._overflowStyle = { webkitOverflowScrolling: 'touch' };
			var scrollAxis;
			switch (t._axis) {
				case 'x':
					t._overflowStyle.overflowX = 'scroll';
					scrollAxis = 'scrollLeft';
					break;

				case 'y':
					t._overflowStyle.overflowY = 'scroll';
					scrollAxis = 'scrollTop';
					break;
			}
			t._scrollOuter.css(t._overflowStyle);
			t._onDOMEvent(t._scrollOuter, 'scroll', function(e) {
				t._scrollPosition = this[scrollAxis];
				t._trigger('scroll', {
					sourceEvent: e,
					scrollBody: scrollBody,
					scrollPosition: t._scrollPosition
				});
			});
		} else {
			t._scrollOuter.css('position', 'relative');
			t._scrollBody.css({
				left: 0,
				top: 0,
				position: 'absolute'
			});

			// 创建滚动条元素
			t._scrollbar = $(TEMPLATE);
			switch (axis) {
				case 'x':
					t._scrollbar.addClass('ui-scrollbar--horizontal');
					break;

				case 'y':
					t._scrollbar.addClass('ui-scrollbar--vertical');
					break;
			}
			t._scrollbar.appendTo(t._scrollOuter);

			// 拖动条元素
			t._scrollThumb = t._scrollbar.find('.ui-scrollbar__track__thumb');

			// 点击拖动条轨道时跳到对应位置
			t._onDOMEvent(t._scrollbar.find('.ui-scrollbar__track'), 'click', function(e) {
				// 点击拖动条时无需操作
				if ( $(e.target).hasClass('ui-scrollbar__track__thumb') ) { return; }

				var percentage;
				switch (t._axis) {
					case 'x':
						percentage = e.offsetX / $(this).innerWidth();
					break;

					case 'y':
						percentage = e.offsetY / $(this).innerHeight();
					break;
				}

				t.scrollTo(percentage * 100 + '%');
			});

			// 鼠标滚轮事件
			if (options.mouseWheelStep) {
				t._onDOMEvent(t._scrollOuter, mouseWheelEvent, function(e) {
					if (!t._scrollbarAvailable) { return; }

					var origEvent = e.originalEvent, direction = 1;
					// 确定滚动方向：-1-上/左；1-下/右
					if ( (origEvent.wheelDelta && origEvent.wheelDelta > 0) ||
						(origEvent.detail && origEvent.detail < 0) )
					{
						direction = -1;
					}

					if ( !options.scrollPageOnEnd || (
						(direction === -1 && t._scrollPosition > 0) ||
						(direction === 1 && t._scrollPosition < t._scrollBodyLimit) ) )
					{
						t.scroll(direction * options.mouseWheelStep);
						// 防止执行整个页面的滚动
						e.preventDefault();
					}
				});
			}
		}

		t.refresh();
	},

	_destroy: function() {
		var t = this;
		t._scrollOuter.removeClass('ui-scrollbar-outer--unscrollable');
		if (t._overflowStyle) {
			base.each(t._overflowStyle, function(val, key) {
				t._scrollOuter.css(key, '');
			});
		}
		if (t._draggable) { t._draggable.destroy(); }
		if (t._scrollbar) { t._scrollbar.remove(); }
	},

	/**
	 * 刷新滚动条状态（一般在滚动内容变化后调用）
	 * @method refresh
	 * @for Scrollbar
	 */
	refresh: function() {
		var t = this;

		var scrollOuter = t._scrollOuter, scrollBody = t._scrollBody;

		// 获取滚动主体尺寸以及可视区域尺寸
		var bodySize, outerSize;
		switch (t._axis) {
			case 'x':
				bodySize = scrollBody.outerWidth(true);
				outerSize = scrollOuter.width();
			break;

			case 'y':
				bodySize = scrollBody.outerHeight(true);
				outerSize = scrollOuter.height();
			break;
		}
		t._bodySize = bodySize;

		// 滚动主体最大滚动距离
		t._scrollBodyLimit = Math.max(bodySize - outerSize, 0);
		// 滚动主体尺寸大于可视区域尺寸时才需要滚动条
		t._scrollbarAvailable = t._scrollBodyLimit > 0;


		/**
		 * 刷新滚动条状态前触发
		 * @event beforerefresh
		 * @for Scrollbar
		 * @param {Object} e 事件参数
		 *   @param {Number} e.bodySize 滚动主体尺寸
		 *   @param {NodeList} e.scrollBody 滚动主体元素
		 *   @param {NodeList} e.scrollbar 滚动条元素
		 */
		t._trigger('beforerefresh', {
			bodySize: bodySize,
			scrollBody: scrollBody,
			scrollbar: t._scrollbar
		});


		if (t._scrollbarAvailable) {
			scrollOuter.removeClass('ui-scrollbar-outer--unscrollable');
		} else {
			scrollOuter.addClass('ui-scrollbar-outer--unscrollable');
		}

		if (!supportOverflowScrolling) {
			var scrollPosition;
			if (t._scrollbarAvailable) {
				var ratio = outerSize / bodySize,
					thumbSize = t._options.minThumbSize || 1,
					scrollbarSize;

				// 计算拖动条尺寸
				switch (t._axis) {
					case 'x':
						scrollbarSize = scrollOuter.innerWidth();
						scrollPosition = scrollBody.position().left;
						thumbSize = Math.max(ratio * scrollbarSize, thumbSize);
						t._scrollbar.width(scrollbarSize);
						t._scrollThumb.width(thumbSize);
					break;

					case 'y':
						scrollbarSize = scrollOuter.innerHeight();
						scrollPosition = scrollBody.position().top;
						thumbSize = Math.max(ratio * scrollbarSize, thumbSize);
						t._scrollbar.height(scrollbarSize);
						t._scrollThumb.height(thumbSize);
					break;
				}

				// 拖动条最大拖动距离
				t._scrollThumbLimit = scrollbarSize - thumbSize;

				// 鼠标拖动拖动条的功能
				t._draggable = t._draggable || new Draggable({
					wrapper: t._scrollThumb,
					boundary: t._scrollbar.find('.ui-scrollbar__track'),
					events: {
						drag: function(e) {
							var pos;
							switch (t._axis) {
								case 'x':
									pos = e.position.left;
								break;

								case 'y':
									pos = e.position.top;
								break;
							}

							t.scrollTo(pos / t._scrollThumbLimit * 100 + '%', e.sourceEvent);
						}
					}
				});

				t._scrollbar.removeClass('ui-scrollbar--unavailable');
			} else {
				// 滚动条无效，也不需要拖动功能了
				if (t._draggable) {
					t._draggable.destroy();
					delete t._draggable;
				}

				t._scrollbar.addClass('ui-scrollbar--unavailable');
			}

			t.scrollTo(scrollPosition || 0);
		}


		/**
		 * 刷新滚动条状态后触发
		 * @event afterrefresh
		 * @for Scrollbar
		 * @param {Object} e 事件参数
		 *   @param {Number} e.bodySize 滚动主体尺寸
		 *   @param {NodeList} e.scrollBody 滚动主体元素
		 *   @param {NodeList} e.scrollbar 滚动条元素
		 *   @param {Boolean} e.scrollbarAvailable 滚动条是否启用
		 */
		t._trigger('afterrefresh', {
			bodySize: bodySize,
			scrollBody: scrollBody,
			scrollbar: t._scrollbar,
			scrollbarAvailable: t._scrollbarAvailable
		});
	},

	/**
	 * 获取滚动条是否处于可用状态
	 * @method available
	 * @for Scrollbar
	 * @return {Boolean} 滚动条是否处于可用状态
	 */
	available: function() { return this._scrollbarAvailable; },

	/**
	 * 获取滚动主体尺寸
	 * @method bodySize
	 * @for Scrollbar
	 * @return {Number} 滚动主体尺寸
	 */
	bodySize: function() { return this._bodySize; },

	/**
	 * 获取滚动位置
	 * @method scrollPosition
	 * @for Scrollbar
	 * @return {Number} 滚动位置
	 */
	scrollPosition: function() { return this._scrollPosition; },

	/**
	 * 滚动到某个位置
	 * @method scrollTo
	 * @for Scrollbar
	 * @param {Number|String} pos 位置。可以具体位置（数字）或百分比（字符串）
	 * @param {Object} [e] 事件参数
	 */
	scrollTo: function(pos, e) {
		var t = this;

		if (typeof pos === 'string' && pos.charAt(pos.length - 1) === '%') {
			pos = (parseFloat(pos) || 0) / 100 * t._scrollBodyLimit;
		} else {
			pos = Number(pos) || 0;
		}

		// 滚动条无效时只允许滚回最顶
		if (!t._scrollbarAvailable && pos !== 0) { return; }

		if (supportOverflowScrolling) {
			var scrollAxis;
			switch (t._axis) {
				case 'x':
					scrollAxis = 'scrollLeft';
				break;

				case 'y':
					scrollAxis = 'scrollTop';
				break;
			}
			t._scrollOuter.prop(scrollAxis, pos);

			return;
		}

		// 限制pos不能超过最小值和最大值
		if (pos < 0) {
			pos = 0;
		} else if (pos > t._scrollBodyLimit) {
			pos = t._scrollBodyLimit;
		}

		var styleName;
		switch (t._axis) {
			case 'x':
				styleName = 'left';
				break;

			case 'y':
				styleName = 'top';
				break;
		}

		t._scrollBody.css(styleName, -pos);
		t._scrollPosition = pos;

		// 重定位拖动条: (位置 /主体最大滚动距离) * 拖动条最大滚动距离
		var scrollProgress = t._scrollBodyLimit ? pos / t._scrollBodyLimit : 0;
		t._scrollThumb.css(styleName, scrollProgress * t._scrollThumbLimit);

		/**
		 * 滚动时触发
		 * @event scroll
		 * @for Scrollbar
		 * @param {Object} e 事件参数
		 *   @param {Object} [e.sourceEvent] 源事件对象
		 *   @param {NodeList} e.scrollbar 滚动条元素
		 *   @param {NodeList} e.scrollBody 滚动主体元素
		 *   @param {Number} e.scrollPosition 滚动位置
		 *   @param {Number} e.scrollProgress 滚动进度
		 */
		t._trigger('scroll', {
			sourceEvent: e,
			scrollbar: t._scrollbar,
			scrollBody: t._scrollBody,
			scrollPosition: pos,
			scrollProgress: scrollProgress
		});
	},

	/**
	 * 滚动一段距离
	 * @method scroll
	 * @for Scrollbar
	 * @param {Number} length 滚动距离
	 */
	scroll: function(length) { this.scrollTo(this._scrollPosition + length); }
}, {
	axis: 'y',
	minThumbSize: 20,
	mouseWheelStep: 50,
	scrollPageOnEnd: true
});

});