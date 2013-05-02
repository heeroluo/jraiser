/*!
 * jRaiser 2 Javascript Library
 * slideshow-pager - v1.0.0 (2013-05-02T09:43:10+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 图片滑块组件分页条
 * @module slideshow/1.0.x/pager
 * @category Widget
 */

var base = require('base/1.0.x/'),
	$ = require('dom/1.0.x/'),
	widget = require('widget/1.0.x/');


/**
 * 图片滑块组件分页条
 * @class SlideShowPager
 * @extends widget/1.0.x/{WidgetBase}
 * @constructor
 * @exports
 * @param {Object} options 组件设置
 *   @param {NodeList} [options.wrapper] 组件容器
 *   @param {String} [options.selectWhen='click'] 触发内容显示的事件
 *   @param {String} [options.currentItemClass='slideshow-nav-current'] 当前项样式类
 *   @param {Object} [options.animation] 动画参数
 */
return widget.create(function(options) {

}, {
	_init: function(options) {
		var t = this,
			wrapper = t._wrapper = options.wrapper,
			items = t._wrapper.children();

		// 单项宽度
		t._itemSize = items.outerWidth(true);
		// 总数
		t._total = items.length;
		// 所有项的总宽度
		t._totalItemSize = t._itemSize * t._total;
		// 可以完整显示多少项
		t._itemNumberLimit = Math.floor(wrapper.parent().innerWidth() / t._itemSize);

		if (!t._itemNumberLimit) { return; }

		// 计算两侧分别放置多少项（较宽的一侧比较窄的一侧多两项，如果数量不足，则多一项）
		var temp = t._itemNumberLimit - 1;
		if (temp % 2) {
			t._widerSideNumber = Math.ceil(temp / 2);
			t._narrowerSideNumber = Math.floor(temp / 2);
			if (t._narrowerSideNumber > 1) {
				t._widerSideNumber += 1;
				t._narrowerSideNumber -= 1;
			}
		} else {
			t._widerSideNumber = t._narrowerSideNumber = parseInt(temp / 2);
			if (t._narrowerSideNumber > 2) {
				t._widerSideNumber += 2;
				t._narrowerSideNumber -= 2;
			} else if (t._narrowerSideNumber > 1) {
				t._widerSideNumber += 1;
				t._narrowerSideNumber -= 1;
			}
		}

		var leftItems = items.clone(), rightItems = items.clone();
		wrapper.css('width', 3 * t._totalItemSize).prepend(leftItems);
		wrapper.append(rightItems).css('left', -t._totalItemSize);

		t._itemCopies = [leftItems, items, rightItems];

		t._selectHandler = function(e) {
			if (e.type === 'click') { e.preventDefault(); }
			t.select($(this).index(), e);
		};

		t._items = t._wrapper.children().on(options.selectWhen, t._selectHandler);
	},

	_destroy: function(options) {
		var t = this;

		delete t._itemSize;
		delete t._total;
		delete t._totalItemSize;

		delete t._itemNumberLimit;
		delete t._widerSideNumber;
		delete t._narrowerSideNumber;

		delete t._itemCopies;
		t._items.off(options.selectWhen, t._selectHandler);
		delete t._selectHandler;
		delete t._items;
	},

	/**
	 * 选择某个项
	 * @method select
	 * @for SlideShowPager
	 * @param {Number} i 项序号
	 * @param {Object} e 事件对象
	 */
	select: function(i, e) {
		var t = this;
		t._triggerIndex = i;

		t.trigger('select', base.mix({
			newIndex: i % t._total,
			oldIndex: t._current
		}, e, { overwrite: false }));
	},

	/**
	 * 激活某一项
	 * @method activate
	 * @for SlideShowPager
	 * @param {Object} e 事件对象
	 */
	activate: function(e) {
		var t = this, index = e.newIndex;

		if (t._current == index) { return; }

		t._items.forEach(function(item, i) {
			if (i % t._total === index) {
				$(item).addClass(t._options.currentItemClass);
			} else {
				$(item).removeClass(t._options.currentItemClass);
			}
		});

		if (t._current != null) {
			t._scrollTo(t._triggerIndex, e.newIndex);
			delete t._triggerIndex;
		}

		t._current = index;
	},

	/**
	 * 往前滚动若干项
	 * @method next
	 * @for SlideShowPager
	 * @param {Number} number 滚动数量
	 */
	next: function(number) { this._scroll(number, 1); },

	/**
	 * 往回滚动若干项
	 * @method prev
	 * @for SlideShowPager
	 * @param {Number} number 滚动数量
	 */
	prev: function(number) { this._scroll(number, 0); },

	_scrollTo: function(index, refIndex) {
		var t = this,
			absLeft = Math.abs( parseInt( t._wrapper.css('left') ) ),
			startIndex = absLeft / t._itemSize,
			endIndex = startIndex + t._itemNumberLimit - 1,
			numberPerSide, isCurrentItemInView, i, temp;

		for (i = 0; i < 3; i++) {
			temp = t._current + t._total * i;
			if (temp >= startIndex && temp <= endIndex) {
				isCurrentItemInView = true;
				break;
			}
		}
		if (!isCurrentItemInView) { return; }

		if (index == null) {
			for (i = 0; i < 3; i++) {
				temp = refIndex + t._total * i;
				if (temp >= startIndex && temp <= endIndex) {
					index = temp;
					break;
				}
			}
			numberPerSide = parseInt( (t._itemNumberLimit - 1) / 2 );
		}

		if (startIndex == index) {
			index -=(numberPerSide != null ?
				t._itemNumberLimit - 1 - numberPerSide : t._widerSideNumber);
		} else if (endIndex == index) {
			index -= (numberPerSide || t._narrowerSideNumber);
		} else {
			index = null;
		}

		if (index != null) { t._doScrolling(-index * t._itemSize); }
	},

	_scroll: function(number, direction) {
		this._doScrolling(
			parseInt( this._wrapper.css('left') ) +
			this._itemSize * (direction ? -number : number)
		);
	},

	_doScrolling: function(newLeft) {
		var t = this;
		if (t._moving) { return; }

		var wrapper = t._wrapper, currentLeft = parseInt( wrapper.css('left') );
		if (newLeft > -t._totalItemSize) {
			wrapper.css('left', currentLeft - t._totalItemSize).prepend(t._itemCopies[2]);
			newLeft -= t._totalItemSize;
			t._itemCopies.unshift( t._itemCopies.pop() );
		} else if ( newLeft < -(t._totalItemSize * 2 - t._itemSize * t._itemNumberLimit) ) {
			wrapper.css('left', currentLeft + t._totalItemSize).append(t._itemCopies[0]);
			newLeft += t._totalItemSize;
			t._itemCopies.push( t._itemCopies.shift() );
		}

		t._moving = true;
		wrapper.animate({
			left: newLeft
		}, base.mix({
			callback: function() { delete t._moving; }
		}, t._options.animation, {
			overwrite: false
		}));
	}
}, {
	selectWhen: 'click',
	currentItemClass: 'slideshow-nav-current'
});

});