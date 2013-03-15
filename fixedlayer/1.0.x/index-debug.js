/*!
 * jRaiser 2 Javascript Library
 * fixedlayer - v1.0.0 (2013-03-15T09:43:07+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本部件提供兼容ie6的fixed效果
 * @module fixedlayer/1.0.x/
 * @category Widget
 */

var base = require('base/1.0.x/'),
	_ = require('underscore/1.4.x/'),
	widget = require('widget/1.0.x/'),
	$ = require('dom/1.0.x/'),
	$window = $(window);


// 检查浏览器是否支持position:fixed
var supportFixed = true;
if (/MSIE\s(\d+)/.test(window.navigator.userAgent) && parseInt(RegExp.$1, 10) < 7) {
	supportFixed = false;
}


/**
 * 固定定位部件
 * @class FixedLayer
 * @extends widget/1.0.x/{WidgetBase}
 * @exports
 * @constructor
 * @param {Object} [options] 部件设置
 *   @param {NodeList} options.wrapper 目标容器
 *   @param {Object} [options.position] 容器位置
 *   @param {String} [options.effect='move'] 过渡效果，可以是'move'或者'none'
 *   @param {Number} [options.duration=400] 过渡效果动画间隔
 *   @param {Number} [options.redrawInterval=80] 重绘延时
 *   @param {Boolean} [options.useFixed=true] 是否在支持position:fixed的浏览器中使用此样式 
 */
var FixedLayer = widget.create(function(options) {
	// 从元素的style属性读取样式值
	var position = base.extend({ }, options.position), wrapper = options.wrapper.get(0);
	['top', 'bottom', 'left', 'right'].forEach(function(direction) {
		if (!position[direction]) {
			var val = wrapper.style[direction];
			if (val) {
				position[direction] = parseFloat(val);
			}
		}
	});

	options.position = position;
}, {
	_init: function(options) {
		var t = this, wrapper = options.wrapper, reCenter = /^center$/i;
		t._originalPosition = wrapper.css('position');

		if (supportFixed && options.useFixed) {
			wrapper.css('position', 'fixed');

			// 检查是否有居中对齐的需求
			var hasCenter;
			base.each(options.position, function(val, key) {
				if ( reCenter.test(val) ) {
					hasCenter = true;
				} else {
					wrapper.css(key, val);
				}
			});

			if (hasCenter) {
				// 若有居中对齐，则位置需要随浏览器大小而变化
				t.computePosition = t.computePosition || function() {
					var position = options.position, doc = document.documentElement, style = { };	

					if ( reCenter.test(position.top) || reCenter.test(position.bottom) ) {
						style.top = ( doc.clientHeight - wrapper.outerHeight(true) ) / 2;
					}
					if ( reCenter.test(position.left) || reCenter.test(position.right) ) {
						style.left = ( doc.clientWidth - wrapper.outerWidth(true) ) / 2;
					}

					return style;
				};
			}
		} else {
			wrapper.css('position', 'absolute');

			var offsetParent = wrapper.offsetParent(),
				substractPos = offsetParent.offset();
			if (offsetParent.prop('tagName') === 'BODY') {
				substractPos.top -= parseFloat( offsetParent.css('marginTop') );
				substractPos.left -= parseFloat( offsetParent.css('marginLeft') );
			}

			/**
			 * 计算当前屏下的坐标值
			 * @method computePosition
			 * @for FixedLayer
			 * @return {Object} 坐标值（top、left）
			 */
			t.computePosition = t.computePosition || function() {
				var doc = document.documentElement,
					body = document.body,
					position = options.position,
					top = doc.scrollTop || body.scrollTop || 0,
					left = doc.scrollLeft || body.scrollLeft || 0;

				if ( reCenter.test(position.top) || reCenter.test(position.bottom) ) {
					top += ( doc.clientHeight - wrapper.outerHeight(true) ) / 2;
				} else if (position.top != null) {
					top += position.top;
				} else if (position.bottom != null) {
					top += doc.clientHeight - position.bottom - wrapper.outerHeight(true);
				}

				if ( reCenter.test(position.left) || reCenter.test(position.right) ) {
					left += ( doc.clientWidth - wrapper.outerWidth(true) ) / 2;
				} else if (position.left != null) {
					left += position.left;
				} else if (position.right != null) {
					left += doc.clientWidth - position.right - wrapper.outerWidth(true);
				}

				var result = {
					top: top - substractPos.top,
					left: left - substractPos.left
				};

				var temp = wrapper.css('right');
				if (temp && temp !== 'auto') {
					wrapper.css({
						left: result.left,
						right: 'auto'
					});
				}
				temp = wrapper.css('bottom');
				if (temp && temp !== 'auto') {
					wrapper.css({
						top: result.top,
						bottom: 'auto'
					});
				}

				return result;
			};
		}

		if (t.computePosition) {
			/**
			 * 移动到当前屏下的对应位置
			 * @method moveToPosition
			 * @for FixedLayer
			 */
			switch (options.effect) {
				case 'move':
					t.moveToPosition = _.throttle(function() {
						wrapper.animate(t.computePosition(), {
							duration: options.duration,
							callback: function() {
								if (!t._inited) {
									delete t.computePosition;
								}
							}
						});
					}, options.redrawDelay);
					break;

				case 'none':
					t.moveToPosition = function() {
						wrapper.css( t.computePosition() );
					};
					break;

				default:
					throw new Error('effect(' + options.effect + ') is invalid');
			}

			t.moveToPosition();

			if (!supportFixed || !options.useFixed) {
				$window.on('scroll', t.moveToPosition);
			}
			$window.on('resize', t.moveToPosition);
		}
	},

	_destroy: function(options) {
		var t = this;

		options.wrapper.css('position', t._originalPosition);
		delete t._originalPosition;

		if (t.moveToPosition) {
			$window.off('scroll', t.moveToPosition);
			$window.off('resize', t.moveToPosition);
			if (options.effect === 'none') {
				// effect为'move'时，因为调用了throttle延时执行动画，
				// 如果删除了computePosition，throttle函数体执行时就会报错。
				// 因此需在动画结束后的回调里删除
				delete t.computePosition;
			}
			delete t.moveToPosition;
		}
	},

	/**
	 * 根据层当前位置重定位（移动了层位置的情况下调用）
	 */
	reposition: function() {
		var t = this, wrapper = t._options.wrapper, newPosition = { };

		['Top', 'Left'].forEach(function(direction, i) {
			var val = wrapper.css( direction.toLowerCase() );
			if (val) {
				newPosition[direction.toLowerCase()] =
					parseFloat(val) - $window['scroll' + direction]();
			}
		});

		t.options({
			position: newPosition
		});
	}
}, {
	effect: 'move',
	redrawDelay: 80,
	useFixed: true
});

/**
 * 当前浏览器是否原生支持position:fixed
 * @property nativeSupport
 * @static
 * @for FixedLayer
 * @type {Boolean}
 */
FixedLayer.nativeSupport = supportFixed;


return FixedLayer;

});