/*!
 * JRaiser 2 Javascript Library
 * draggable - v1.1.0 (2015-07-10T17:28:33+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 拖动功能组件
 * @module draggable/1.1.x/
 * @category Widget
 */

var uaDetector = require('uadetector/1.0.x/'),
	$ = require('dom/1.1.x/'),
	widget = require('widget/1.1.x/'),
	$window = $(window),
	$document = $(document);


var startWhen, endWhen, moveWhen;
// 检测设备类型
if ( uaDetector.isDevice('mobile') && uaDetector.hasFeature('touch') ) {
	// 触摸屏
	startWhen = 'touchstart';
	endWhen = 'touchend';
	moveWhen = 'touchmove';
} else {
	// 鼠标
	startWhen = 'mousedown';
	endWhen = 'mouseup';
	moveWhen = 'mousemove';
}


/**
 * 拖动功能组件类
 * @class Draggable
 * @constructor
 * @extends widget/1.1.x/{WidgetBase}
 * @exports
 * @param {Object} options 组件设置
 *   @param {NodeList} options.wrapper 被拖动元素
 *   @param {NodeList|Object|String} [options.boundary] 拖动边界。
 *     'parent'时为父节点；
 *     'window'时为窗口；
 *     为Object时要指定left、top、right、bottom
 */
return widget.create({
	_init: function(options) {
		var t = this;

		t._wrapper = options.wrapper;
		t._dragTrigger = t._wrapper.find('.draggable__trigger');

		// 没有指定触发位置时，由整个wrapper进行触发
		if (!t._dragTrigger.length) { t._dragTrigger = t._wrapper; }

		t._onDOMEvent(t._dragTrigger, startWhen, '_start');
	},

	/*
	 * 开始拖动
	 * @method _start
	 * @protected
	 * @for Draggable
	 * @param {Object} e 事件对象
	 */
	_start: function(e) {
		var t = this, wrapper = t._wrapper;

		// t._startPos存在表示已经开始拖动
		if (t._startPos) { return; }
		// 限制为鼠标左键点击才触发
		if (/^mouse/.test(e.type) && e.which !== 1) { return; }

		/**
		 * 拖动开始前触发
		 * @event dragstart
		 * @for Draggable
		 * @param {Object} e 事件对象
		 *   @param {NodeList} e.wrapper 被拖动元素
		 *   @param {Object} e.sourceEvent 源事件对象
		 *   @param {Function} e.preventDefault() 如果调用了此方法，则拖动不会开始
		 */
		var doNotStart = t._trigger('dragstart', {
			wrapper: wrapper,
			sourceEvent: e
		}).isDefaultPrevented();

		if (doNotStart) { return; }

		var wrapperPos = wrapper.position(), cssPosition = wrapper.css('position');
		// 修正节点的position样式值（绝对定位或固定定位才能拖动）
		if (cssPosition !== 'fixed' && cssPosition !== 'absolute') {
			cssPosition = 'absolute';
			wrapper.css('position', cssPosition);
		}
		t._isFixedPosition = cssPosition === 'fixed';

		wrapper.css(wrapperPos);

		// 计算方式：
		// newWrapperLeft
		//   = newPageX - oldPageX + wrapperLeft
		//   = newPageX - (oldPageX - wrapperLeft)
		t._startPos = {
			left: e.pageX - wrapperPos.left,
			top: e.pageY - wrapperPos.top
		};

		t._oldPos = wrapperPos;

		// 计算本次拖动的边界值
		var boundary = t._options.boundary;
		if (boundary) {
			if (boundary === 'window') {	// 窗口范围
				var doc = document.documentElement;
				t._boundary = t._isFixedPosition ? {
					right: doc.clientWidth,
					bottom: doc.clientHeight
				} : {
					right: Math.max(document.body.scrollWidth, doc.scrollWidth, doc.clientWidth),
					bottom: Math.max(document.body.scrollHeight, doc.scrollHeight, doc.clientHeight)
				};
				t._boundary.left = t._boundary.top = 0;
			} else if (boundary === 'parent' && !t._isFixedPosition) {
				// 父节点范围（不支持fixed）
				var offsetParent = t._wrapper.offsetParent();
				if (offsetParent.length) {
					t._boundary = {
						left: offsetParent.offset().left,
						right: offsetParent.offset().left + offsetParent.innerWidth(),
						top: offsetParent.offset().top,
						bottom: offsetParent.offset().top + offsetParent.innerHeight()
					};
				}
			} else if (typeof boundary.offset === 'function' && !t._isFixedPosition) {
				// 指定某个元素（不支持fixed）
				t._boundary = boundary.offset();
				t._boundary.right = t._boundary.left + boundary.innerWidth();
				t._boundary.bottom = t._boundary.top + boundary.innerHeight();
			} else {
				t._boundary = boundary;
			}

			t._wrapperSize = {
				width: wrapper.outerWidth(),
				height: wrapper.outerHeight()
			};
		}

		wrapper.each(function(node) {
			if (node.setCapture) { node.setCapture(); }
		});

		t._onDOMEvent($document, moveWhen, {
			fn: '_drag',
			id: 'drag'
		});
		t._onDOMEvent($window, 'blur', {
			fn: 'end',
			id: 'end'
		});
		if (endWhen) {
			t._onDOMEvent($document, endWhen, {
				id: 'end'
			});
		}

		// 禁止文本选择
		$('body').css('user-select', 'none');
	},

	/**
	 * 拖动过程
	 * @method _drag
	 * @protected
	 * @param {Object} e 事件对象
	 */
	_drag: function(e) {
		var t = this;

		if (!t._startPos) { return; }

		var newPos = {
			left: e.pageX - t._startPos.left,
			top: e.pageY - t._startPos.top
		};

		var boundary = t._boundary;
		if (boundary) {
			// 计算是否超出边界
			var size = t._wrapperSize, newOffset, parentOffset;
			
			if (t._isFixedPosition) {
				newOffset = {
					left: newPos.left,
					top: newPos.top
				};
			} else {
				newOffset = t._wrapper.offset();
				newOffset.left += (newPos.left - t._oldPos.left);
				newOffset.top += (newPos.top - t._oldPos.top);
				parentOffset = t._wrapper.offsetParent().offset();
			}
			newOffset.right = newOffset.left + size.width;
			newOffset.bottom = newOffset.top + size.height;
			parentOffset = parentOffset || { top: 0, left: 0 };

			if (boundary.right != null && newOffset.right > boundary.right) {
				newPos.left = boundary.right - size.width - parentOffset.left;
			}
			if (boundary.left != null && newOffset.left < boundary.left) {
				newPos.left = boundary.left - parentOffset.left;
			}
			if (boundary.bottom != null && newOffset.bottom > boundary.bottom) {
				newPos.top = boundary.bottom - size.height - parentOffset.top;
			}
			if (boundary.top != null && newOffset.top < boundary.top) {
				newPos.top = boundary.top - parentOffset.top;
			}
		}

		t._wrapper.css(newPos);
		t._oldPos = newPos;

		/**
		 * 拖动到新位置后触发
		 * @event drag
		 * @for Draggable
		 * @param {Object} e 事件对象
		 *   @param {Object} e.sourceEvent 源事件对象
		 *   @param {NodeList} e.wrapper 被拖动元素
		 *   @param {Object} e.position 新位置（top、left）
		 */
		t._trigger('drag', {
			sourceEvent: e,
			wrapper: t._wrapper,
			position: newPos
		});
	},

	/**
	 * 结束拖动
	 * @method end
	 * @param {Object} e 事件对象。仅供内部调用时使用
	 */
	end: function(e) {
		var t = this;

		if (!t._startPos) { return; }

		t._wrapper.each(function(node) {
			if (node.releaseCapture) {
				node.releaseCapture();
			}
		});

		t._offDOMEvent($document, moveWhen, 'drag');
		if (endWhen) {
			t._offDOMEvent($document, endWhen, 'end');
		}
		t._offDOMEvent($window, 'blur', 'end');

		// 取消禁用文字选择
		$('body').css('user-select', '');

		delete t._startPos;
		delete t._oldPos;
		delete t._wrapperSize;
		delete t._boundary;
		delete t._isFixedPosition;

		/**
		 * 拖动结束后触发
		 * @event dragend
		 * @for Draggable
		 * @param {Object} e 事件对象
		 *   @param {Object} e.souceEvent 源事件对象
		 *   @param {NodeList} e.wrapper 被拖动元素
		 */
		t._trigger('dragend', {
			sourceEvent: e,
			wrapper: t._wrapper
		});
	},

	_destroy: function() {
		// 停止正在进行的拖动
		this.end();
	}
});

});