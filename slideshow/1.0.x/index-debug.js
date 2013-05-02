/*!
 * jRaiser 2 Javascript Library
 * slideshow - v1.0.0 (2013-04-28T16:52:55+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 图片滑块组件
 * @module slideshow/1.0.x/
 * @category Widget
 */


var base = require('base/1.0.x/'),
	$ = require('dom/1.0.x/'),
	widget = require('widget/1.0.x/');


function genAnimateOptions(e) {
	var t = this;

	return base.mix(e ? {
		callback: function() {
			delete t._showing;
			/**
			 * 内容项显示完毕后触发
			 * @event completeshow
			 * @for SlideShow
			 */
			t.trigger('completeshow', e);
		}
	} : { }, t._options.animation, {
		overwrite: false
	});
}


var effects = {
	// 滑动效果
	slide: function(i, direction, e) {
		var t = this,
			panelItems = t._panelItems,
			panels = t._panels.clone().html(''),
			targetLeft;

		if (t._current == null) {
			panels.append( panelItems.last() );
			panels.append( panelItems.first() );
			panels.css('left', -t._panelSize);
		} else {
			if (direction) {	// 下一张方向
				panels
					.append( panelItems.eq(t._current) )
					.append( panelItems.eq(i) )
					.css('left', 0);
				targetLeft = -t._panelSize;
			} else {	// 上一张方向
				panels
					.append( panelItems.eq(i) )
					.append( panelItems.eq(t._current) )
					.css('left', -t._panelSize);
				targetLeft = 0;
			}
		}

		t._panels.replaceWith(panels);
		if (targetLeft != null) {
			t._showing = true;
			panels.animate({
				left: targetLeft
			}, genAnimateOptions.call(t, e));
		}
		t._panels = panels;
	},

	// 渐隐渐显
	fade: function(i, direction, e) {
		var t = this,
			panelItems = t._panelItems;

		if (t._current == null) {
			for (var i = panelItems.length - 1; i >= 0; i--) {
				$(panelItems[i]).css({
					opacity: i ? 0 : 1,
					left: 0,
					top: 0,
					position: 'absolute'
				});
			}
		} else {
			t._showing = true;
			panelItems.eq(t._current).animate({
				opacity: 0
			}, genAnimateOptions.call(t));
			panelItems.eq(i).animate({
				opacity: 1
			}, genAnimateOptions.call(t, e));
		}
	}
};


/**
 * 图片滑块组件
 * @class SlideShow
 * @extends widget/1.0.x/{WidgetBase}
 * @constructor
 * @exports
 * @param {Object} options 组件设置
 *   @param {NodeList} [options.wrapper] 组件容器。
 *     如不指定，则必须在navs和panels参数中直接指定节点
 *   @param {String|NodeList} [options.panels='.slideshow-panels ul'] 内容所在的容器，
 *     可以是节点集合或者以wrapper为上下文的选择器
 *   @param {String|NodeList} [options.navs='.slideshow-navs ul'] 导航所在的容器，
 *     可以是节点集合或者以wrapper为上下文的选择器
 *   @param {String|NodeList} [options.nextButton='.slideshow-next'] 下一张按钮，
 *     可以是节点集合或者以wrapper为上下文的选择器
 *   @param {String|NodeList} [options.prevButton='.slideshow-prev'] 上一张按钮，
 *     可以是节点集合或者以wrapper为上下文的选择器
 *   @param {String} [options.currentNavClass='slideshow-nav-current'] 当前缩略图样式类
 *   @param {String} [options.showWhen='click'] 导航触发内容显示的事件
 *   @param {String} [options.effect='slide'] 动画效果，可以为slide或fade
 *   @param {Object} [options.animation] 动画参数
 *   @param {Number} [options.playInterval=5000] 自动播放间隔
 */
return widget.create(function(options) {

}, {
	_init: function(options) {
		var t = this, wrapper = t._wrapper = options.wrapper;

		// 找出内容和导航容器，并算出单项宽度
		['panel', 'nav'].forEach(function(key, i) {
			var subWrapper = options[key + 's'];
			if (!subWrapper) { return; }

			subWrapper = t['_' + key + 's'] = typeof subWrapper === 'string' ?
				wrapper.find(subWrapper) : subWrapper;

			var children = subWrapper.children();
			if (!i) { t._total = children.length; }

			t['_' + key + 'Items'] = children;
			t['_' + key + 'Size'] = children.outerWidth(true);
		});

		// 设置容器宽度足以容纳两个内容项（运动的过程实际上是两个内容项在相互替换）
		t._panels.css('width', 2 * t._panelSize);

		if (t._navs) {
			// 点击小图显示大图
			t._navHandler = function(e) {
				if (e.type === 'click') { e.preventDefault(); }
				t.show($(this).index(), null, e);
			};
			t._navItems.on(options.showWhen, t._navHandler);
		}

		// 上一张、下一张按钮
		['next', 'prev'].forEach(function(key) {
			var button = options[key + 'Button'];
			if (button) {
				button = t['_' + key + 'Button'] = typeof button === 'string' ?
					wrapper.find(button) : button;
				var fn = t['_' + key + 'Handler'] = function(e) {
					e.preventDefault();
					t[key](e);
				};
				button.click(fn);
			}
		});

		t.show(0);
		if (options.playInterval) { t.play(); }
	},

	/**
	 * 显示某个内容项
	 * @method show
	 * @for SlideShow
	 * @param {Number} i 内容项序号
	 * @param {Number} direction 内容项出现的方向：1为从右到左；0为从左到右
	 * @param {Object} e 事件对象
	 */
	show: function(i, direction, e) {
		var t = this;

		// 上次还没显示完，忽略本次显示操作
		if (t._showing) { return; }

		if (i < 0) {
			i = t._total - 1;
		} else if (i >= t._total) {
			i = 0;
		}

		if (t._current !== i) {
			if (direction == null) { direction = i > t._current ? 1 : 0; }

			// 生成事件属性
			var evtProps = {
				newIndex: i,
				newPanel: t._panelItems.eq(i),
				direction: direction
			};
			if (t._navItems) { evtProps.newNav = t._navItems.eq(i); }
			if (t._current != null) {
				evtProps.oldIndex = t._current;
				evtProps.oldPanel = t._panelItems.eq(t.current);
				if (t._navItems) { evtProps.oldNav = t._navItems.eq(t.current); }
			}
			if (e) {
				base.mix(evtProps, e, {
					overwrite: false
				});
			}
			/**
			 * 显示某张图前触发，可以阻止show动作
			 * @event beforeshow
			 * @for SlideShow
			 */
			if ( t.trigger('beforeshow', evtProps).isDefaultPrevented() ) {
				return;
			}

			effects[t._options.effect].call(t, i, direction, evtProps);

			if (t._navItems) {
				t._navItems.removeClass(t._options.currentNavClass)
					.eq(i).addClass(t._options.currentNavClass);
			}

			t._current = i;

			/**
			 * 显示某个内容项后触发
			 * @event aftershow
			 * @for SlideShow
			 */
			t.trigger('aftershow', evtProps);
		}
	},

	/**
	 * 显示下一张图
	 * @method next
	 * @for SlideShow
	 * @param {Object} e 事件对象
	 */
	next: function(e) { this.show(this._current + 1, 1, e); },

	/**
	 * 显示上一张图
	 * @method prev
	 * @for SlideShow
	 * @param {Object} e 事件对象
	 */
	prev: function(e) { this.show(this._current - 1, 0, e); },

	/**
	 * 开始播放
	 * @method play
	 * @for SlideShow
	 */
	play: function() {
		var t = this, interval = t._options.playInterval;
		if (interval && !t._autoPlayTimer) {
			t._autoPlayTimer = setInterval(function() {
				t.next();
			}, interval);

			if (!t._isPlayingOn) {
				t._playHandler = function() { t.play(); };
				t._pauseHandler = function() { t.pause(); };
				t._wrapper.mouseover(t._pauseHandler).mouseout(t._playHandler);
				t._isPlayingOn = true;
			}
		}
	},

	/**
	 * 暂停播放
	 * @method pause
	 * @for SlideShow
	 */
	pause: function() {
		if (this._autoPlayTimer) {
			clearInterval(this._autoPlayTimer);
			delete this._autoPlayTimer;
		}
	},

	/**
	 * 停止播放
	 * @method stop
	 * @for SlideShow
	 */
	stop: function() {
		var t = this;

		t.pause();
		if (t._isPlayingOn) {
			t._wrapper
				.off('mouseover', t._pauseHandler)
				.on('mouseout', t._playHandler);

			delete t._pauseHandler;
			delete t._playHandler;
			delete t._isPlayingOn;
		}
	},

	_destroy: function(options) {
		var t = this;

		t.stop();

		t._navItems.off(options.showWhen, t._navHandler);
		delete t._navHandler;

		if (t._nextButton) {
			t._nextButton.off('click', t._nextHandler)
			delete t._nextHandler;
			delete t._nextButton;
		}
		if (t._prevButton) {
			t._prevButton.off('click', t._prevHandler)
			delete t._prevHandler;
			delete t._prevButton;
		}

		delete t._panels;
		delete t._panelSize;
		delete t._panelItems;
		delete t._navs;
		delete t._navSize;
		delete t._panelItems;

		delete t._total;
		delete t._current;
		delete t._wrapper;
	}
}, {
	panels: '.slideshow-panels ul',
	navs: '.slideshow-navs ul',
	nextButton: '.slideshow-next',
	prevButton: '.slideshow-prev',
	currentNavClass: 'slideshow-nav-current',
	showWhen: 'click',
	effect: 'slide',
	animation: null,
	playInterval: 5000
})

});