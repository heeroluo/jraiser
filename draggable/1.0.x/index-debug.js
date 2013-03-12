/*!
 * jRaiser 2 Javascript Library
 * draggable - v1.0.0 (2013-01-10T10:21:12+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供拖动功能部件
 * @module draggable/1.0.x/
 * @category Widget
 */

var base = require('base/1.0.x/'),
	widget = require('widget/1.0.x/'),
	$ = require('dom/1.0.x/'),
	$window = $(window),
	$document = $(document);


var startWhen, endWhen, moveWhen;
// 检测设备类型
if ('ontouchstart' in document) {
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
 * 拖动功能部件
 * @class Draggable
 * @constructor
 * @extends widget/1.0.x/{WidgetBase}
 * @exports
 * @param {Object} options 部件设置
 *   @param {NodeList} options.wrapper 拖动元素
 *   @param {NodeList|Object|String} [options.boundary] 拖动边界，
 *     'parent'时为父节点，'window'时为窗口
 */
return widget.create(function(options) {
	var t = this;

	t._wrapper = options.wrapper;
	t._dragTrigger = t._wrapper.find('.ui-draggable-trigger');

	// 没有指定触发节点时，由wrapper进行触发
	if (!t._dragTrigger.length) { t._dragTrigger = t._wrapper; }
}, {
	_init: function(options) {
		var t = this;

		/*
		 * 拖动过程
		 * @method drag
		 * @for Draggable
		 * @param {EventArg} e 事件对象
		 */
		t.drag = function(e) {
			var startPos = t._startPos;

			if (!startPos || e.pageX == null || e.pageY == null) { return; }

			var newPos = {
				left: e.pageX - startPos.left -
					(t._wrapperPosition === 'fixed' ? $window.scrollLeft() : 0),
				top: e.pageY - startPos.top -
					(t._wrapperPosition === 'fixed' ? $window.scrollTop() : 0)
			};

			var boundary = t._boundary;
			if (boundary) {
				// 计算是否超出边界
				var size = t._wrapperSize,
					newOffset = t._wrapper.offset(),
					parentOffset = t._wrapper.offsetParent().offset() || { top: 0, left: 0 };

				newOffset.left += (newPos.left - t._oldPos.left);
				newOffset.top += (newPos.top - t._oldPos.top);
				newOffset.right = newOffset.left + size.width;
				newOffset.bottom = newOffset.top + size.height;

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
			 *   @param {Object} e.position 新位置（top、left）
			 */
			t.trigger('drag', base.mix({
				position: newPos
			}, e, {
				overwrite: false
			}));
		};

		/*
		 * 终止拖动
		 * @method end
		 * @for Draggable
		 * @param {EventArg} e 事件对象
		 */
		t.end = function(e) {
			if (!t._startPos || e.pageX == null || e.pageY == null) { return; }

			t._wrapper.each(function(node) {
				if (node.releaseCapture) {
					node.releaseCapture();
				} else if (window.releaseEvents) {
					window.releaseEvents(
						window.Event[moveWhen.toUpperCase()] | window.Event[endWhen.toUpperCase()]
					);
				}
			});

			$document.off(moveWhen, t.drag);
			if (endWhen) { $document.off(endWhen, t.end); }
			$window.off('blur', t.end);

			delete t._startPos;
			delete t._oldPos;
			delete t._wrapperSize;
			delete t._boundary;
			delete t._wrapperPosition;

			/**
			 * 拖动结束后触发
			 * @event dragend
			 * @for Draggable
			 */
			t.trigger('dragend', e);
		};

		/*
		 * 开始拖动
		 * @method start
		 * @for Draggable
		 * @param {EventArg} e 事件对象
		 */
		t.start = function(e) {
			/**
			 * 拖动开始前触发
			 * @event dragstart
			 * @for Draggable
			 * @param {Object} e 事件对象
			 *   @param {Function} e.preventDefault() 如果调用了此方法，则拖动不会开始
			 */
			if ( t._startPos || e.pageX == null || e.pageY == null ||
					t.trigger('dragstart', e).isDefaultPrevented() ) { return; }

			// 防止选择文字、拖动页面（触摸屏）
			e.preventDefault();

			var wrapper = t._wrapper, wrapperPos = wrapper.position();

			// 修正节点的position值
			var cssPosition = wrapper.css('position');
			if (cssPosition !== 'fixed' && cssPosition !== 'absolute') {
				cssPosition = 'absolute';
				wrapper.css('position', cssPosition);
			}
			t._wrapperPosition = cssPosition;

			// 计算方式：newWrapperLeft = newPageX - oldPageX + wrapperLeft
			//                          = newPageX - (oldPageX - wrapperLeft)
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
					t._boundary = {
						left: 0,
						top: 0,
						right: Math.max(doc.scrollWidth, doc.clientWidth),
						bottom: Math.max(doc.scrollHeight, doc.clientHeight)
					};
				} else if (boundary === 'parent') {		// 父节点范围
					var offsetParent = t._wrapper.offsetParent();
					if (offsetParent.length) {
						t._boundary = {
							left: offsetParent.offset().left,
							right: offsetParent.offset().left + offsetParent.innerWidth(),
							top: offsetParent.offset().top,
							bottom: offsetParent.offset().top + offsetParent.innerHeight()
						};
					}
				} else if (typeof boundary.offset === 'function') {	// 指定某个元素
					t._boundary = boundary.offset();
					t._boundary.right = t._boundary.left + boundary.innerWidth();
					t._boundary.bottom = t._boundary.top + boundary.innerHeight();
				} else {
					t._boundary = boundary;
				}

				t._wrapperSize = {
					width: t._wrapper.outerWidth(),
					height: t._wrapper.outerHeight()
				};
			}

			wrapper.each(function(node) {
				if (node.setCapture) {
					node.setCapture();
				} else if (window.captureEvents) {
					window.captureEvents(
						window.Event[moveWhen.toUpperCase()] | window.Event[endWhen.toUpperCase()]
					);
				}
			});

			$document.on(moveWhen, t.drag);
			if (endWhen) { $document.on(endWhen, t.end); }
			$window.on('blur', t.end);
		};

		t._dragTrigger.on(startWhen, t.start);
	},

	_destroy: function(options) {
		var t = this;

		// 停止正在进行的拖动
		if (t._startPos) { t.end(); }

		t._dragTrigger.off(startWhen, t.start);

		delete t.drag;
		delete t.end;
		delete t.start;
	}
});

});