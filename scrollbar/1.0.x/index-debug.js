/*!
 * JRaiser 2 Javascript Library
 * scrollbar - v1.0.2 (2014-08-20T15:53:58+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 模拟滚动条组件
 * @module scrollbar/1.0.x/
 * @category Widget
 */

var base = require('base/1.0.x/'),
	$ = require('dom/1.0.x/'),
	widget = require('widget/1.0.x/'),
	Draggable = require('draggable/1.0.x/');


var TEMPLATE = '<div class="scrollbar">' +
	'<div class="scrollbar-track">' +
		'<div class="scrollbar-thumb"></div>' +
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
 * @extends widget/1.0.x/{WidgetBase}
 * @constructor
 * @exports
 * @param {Object} options 组件设置
 *   @param {NodeList} options.scrollOuter 滚动条容器，此容器包含滚动条及滚动主体
 *   @param {NodeList} options.scrollBody 滚动主体
 *   @param {String} [options.axis='y'] 滚动条轴向，x为横向或y纵向
 *   @param {Number} [options.minThumbSize=20] 拖动条最小尺寸
 *   @param {Number} [options.mouseWheelStep=100] 滚一下鼠标滑轮移动的距离，为0的时候鼠标滑轮无效
 *   @param {Boolean} [options.scrollPageWhenEnd=true] 滚到尽头的时候，是否允许页面滚动
 */
return widget.create(function() {

}, {
	_init: function(options) {
		var axis = options.axis;
		if (axis) {
			axis = axis.toLowerCase();
		} else {
			throw new Error('please specify the axis of scrollbar');
		}

		var t = this;
		// 滚动方向
		t._axis = axis;
		// 滚动主体
		t._scrollBody = options.scrollBody;
		
		// iOS下用 -webkit-overflow-scrolling 实现
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
			t._onOverflowScroll = function() {
				t.trigger('scroll', {
					scrollBodyPosition: this[scrollAxis]
				});
			};
			t._scrollBody.parent().css(t._overflowStyle).on('scroll', t._onOverflowScroll);
			return;
		}

		// 添加滚动条的容器
		t._scrollOuter = options.scrollOuter;

		// 创建滚动条元素
		t._scrollbar = $(TEMPLATE).click(function(e) {
			if ( !t._scrollbarEnabled || $(e.target).hasClass('scrollbar-thumb') ) { return; }
			var pos;
			switch (t._axis) {
				case 'x':
					pos = ( e.offsetX - t._scrollThumb.width() / 2 ) /
						t._scrollbar.outerWidth() * t._scrollBody.outerWidth(true);
				break;

				case 'y':
					pos = ( e.offsetY - t._scrollThumb.height() / 2 ) /
						t._scrollbar.outerHeight() * t._scrollBody.outerHeight(true);
				break;
			}
			t.scrollTo(pos);
			e.stopPropagation();
		});
		switch (axis) {
			case 'x':
				t._scrollbar.addClass('scrollbar-horizontal');
				break;

			case 'y':
				t._scrollbar.addClass('scrollbar-vertical');
				break;
		}
		t._scrollThumb = t._scrollbar.find('.scrollbar-thumb');
		t._scrollOuter.append(t._scrollbar);

		if (options.mouseWheelStep) {
			t.onMouseWheel = function(e) {
				var origEvent = e.originalEvent, direction = 1;
				// 确定滚动方向：-1-上/左；1-下/右
				if (origEvent.wheelDelta) {
					if (origEvent.wheelDelta > 0) { direction = -1; }
				} else if (origEvent.detail) {
					if (origEvent.detail < 0) { direction = -1; }
				}

				var isEnd = options.scrollPageWhenEnd && ( !t._scrollbarEnabled || (
					options.scrollPageWhenEnd && t._scrollBodyPosition != null && (
						(direction === -1 && t._scrollBodyPosition <= 0) ||
						(direction === 1 && t._scrollBodyPosition >= t._scrollBodyLimit)
					)
				) );

				if (!isEnd) {
					t.scroll(direction * options.mouseWheelStep);
					// 防止执行整个页面的滚动
					e.preventDefault();
				}
			};

			t._scrollOuter.on(mouseWheelEvent, t.onMouseWheel);
		}

		t.refresh();
	},

	_destroy: function() {
		var t = this;
		delete t._axis;

		if (t.onMouseWheel) {
			t._scrollOuter.off(mouseWheelEvent, t.onMouseWheel);
			delete t.onMouseWheel;
		}
		delete t._scrollOuter;

		if (t._draggable) {
			t._draggable.destroy();
			delete t._draggable;
		}

		if (t._scrollbar) {
			t._scrollbar.remove();
			delete t._scrollbar;
		}

		var scrollBodyParent = t._scrollBody.parent();
		if (t._overflowStyle) {
			for (var s in t._overflowStyle) {
				t._overflowStyle[s] = '';
			}
			scrollBodyParent.css(t._overflowStyle);
		}
		if (t._onOverflowScroll) {
			scrollBodyParent.off('scroll', t._onOverflowScroll);
			delete t._onOverflowScroll;
		}

		delete t._bodySize;
		delete t._viewportSize;
		delete t._scrollbarEnabled;
		delete t._scrollThumbLimit;
		delete t._scrollBodyLimit;
		delete t._scrollBodyPosition;
		delete t._scrollThumb;
		delete t._scrollBody;
	},

	/**
	 * 刷新滚动条状态（一般在滚动内容变化后调用）
	 * @method refresh
	 * @for Scrollbar
	 * @return {Boolean} 滚动条是否处于启用状态
	 */
	refresh: function() {
		var t = this;

		// 获取滚动主体尺寸以及可视区域尺寸
		var bodySize, viewportSize;
		switch (t._axis) {
			case 'x':
				bodySize = t._scrollBody.outerWidth(true);
				viewportSize = t._scrollBody.parent().outerWidth();
			break;

			case 'y':
				bodySize = t._scrollBody.outerHeight(true);
				viewportSize = t._scrollBody.parent().outerHeight();
			break;
		}
		t._bodySize = bodySize;
		t._viewportSize = viewportSize;

		/**
		 * 刷新滚动条状态前触发
		 * @event afterrefresh
		 * @for Scrollbar
		 * @param {Object} e 事件参数
		 *   @param {Number} e.viewportSize 可视区域大小
		 *   @param {Number} e.bodySize 滚动主体大小
		 *   @param {NodeList} e.scrollbar 滚动条元素
		 */
		t.trigger('beforerefresh', {
			viewportSize: viewportSize,
			scrollBodySize: bodySize,
			scrollbar: t._scrollbar
		});

		// 滚动主体尺寸大于可视区域尺寸时才需要滚动条
		if (bodySize > viewportSize) {
			var ratio = viewportSize / bodySize, scrollbarSize, thumbSize;

			// 确定拖动条尺寸
			switch (t._axis) {
				case 'x':
					scrollbarSize = t._scrollbar.outerWidth();
					thumbSize = Math.max(ratio * scrollbarSize, t._options.minThumbSize);
					t._scrollThumb.width(thumbSize);
					t._scrollThumbLimit = scrollbarSize - thumbSize;
				break;

				case 'y':
					scrollbarSize = t._scrollbar.outerHeight();
					thumbSize = Math.max(ratio * scrollbarSize, t._options.minThumbSize);
					t._scrollThumb.height(thumbSize);
					t._scrollThumbLimit = scrollbarSize - thumbSize;
				break;
			}
			t._scrollBodyLimit = bodySize - viewportSize;

			// 鼠标拖动拖动条的功能
			t._draggable = t._draggable || new Draggable({
				wrapper: t._scrollThumb,
				boundary: t._scrollbar.find('.scrollbar-track'),
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
						t.scrollTo(t._scrollBodyLimit * pos / t._scrollThumbLimit);
					}
				}
			});

			t._scrollbar.removeClass('scrollbar-disabled');
			t._scrollbarEnabled = true;
			t.scroll(0);
		} else {
			// 不需要滚动条，也不需要拖动功能了
			if (t._draggable) {
				t._draggable.destroy();
				delete t._draggable;
			}

			t._scrollbar.addClass('scrollbar-disabled');
			t._scrollbarEnabled = false;
			// 无需滚动条的时候自动滚回最顶
			t.scrollTo(0);
		}

		/**
		 * 刷新滚动条状态后触发
		 * @event afterrefresh
		 * @for Scrollbar
		 * @param {Object} e 事件参数
		 *   @param {Number} e.viewportSize 可视区域大小
		 *   @param {Number} e.bodySize 滚动主体大小
		 *   @param {NodeList} e.scrollbar 滚动条元素
		 *   @param {Boolean} e.scrollbarEnabled 滚动条是否启用
		 */
		t.trigger('afterrefresh', {
			viewportSize: viewportSize,
			scrollBodySize: bodySize,
			scrollbar: t._scrollbar,
			scrollbarEnabled: t._scrollbarEnabled
		});

		return t._scrollbarEnabled;
	},

	/**
	 * 获取滚动可视区域尺寸
	 * @method viewportSize
	 * @for Scrollbar
	 * @return {Number} 滚动可视区域尺寸
	 */
	viewportSize: function() { return this._viewportSize; },

	/**
	 * 获取滚动主体高度
	 * @method bodySize
	 * @for Scrollbar
	 * @return {Number} 滚动主体高度
	 */
	bodySize: function() { return this._bodySize; },

	/**
	 * 滚动一段距离
	 * @method scroll
	 * @for Scrollbar
	 * @param {Number} length 滚动距离
	 */
	scroll: function(length) {
		var t = this, style;
		switch (t._axis) {
			case 'x':
				style = 'left';
				break;

			case 'y':
				style = 'top';
				break;
		}

		t.scrollTo(-(parseFloat( t._scrollBody.css(style) ) || 0) + length);
	},

	/**
	 * 滚动到某个位置
	 * @method scrollTo
	 * @for Scrollbar
	 * @param {Number} pos 位置
	 */
	scrollTo: function(pos) {
		var t = this;
		if (!t._scrollbarEnabled && pos > 0) { return; }

		// 限制pos不能超过最小值和最大值
		if (pos < 0) {
			pos = 0;
		} else if (pos > t._scrollBodyLimit) {
			pos = t._scrollBodyLimit;
		}

		var style;
		switch (t._axis) {
			case 'x':
				style = 'left';
				break;

			case 'y':
				style = 'top';
				break;
		}
		t._scrollBody.css(style, -pos);
		t._scrollBodyPosition = pos;

		// 重定位拖动条: (位置 /主体最大滚动距离) * 拖动条最大滚动距离
		var thumbPos = t._scrollBodyLimit ? pos / t._scrollBodyLimit * t._scrollThumbLimit : 0;
		t._scrollThumb.css(style, thumbPos);

		/**
		 * 滚动时触发
		 * @event scroll
		 * @for Scrollbar
		 * @param {Object} e 事件参数
		 *   @param {NodeList} e.scrollbar 滚动条元素
		 *   @param {Number} e.scrollBodyPosition 主体滚动位置
		 *   @param {Number} e.scrollThumbPosition 拖动条滚动位置
		 */
		t.trigger('scroll', {
			scrollbar: t._scrollbar,
			scrollBodyPosition: pos,
			scrollThumbPosition: thumbPos
		});
	},

	/**
	 * 获取滚动主体位置
	 * @method scrollBodyPosition
	 * @for Scrollbar
	 * @return {Number} 滚动主体位置
	 */
	scrollBodyPosition: function() { return this._scrollBodyPosition; }
}, {
	axis: 'y',
	minThumbSize: 20,
	mouseWheelStep: 100,
	scrollPageWhenEnd: false
});

});