/*!
 * JRaiser 2 Javascript Library
 * tabs - v1.1.0 (2015-06-15T11:21:20+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 选项卡功能组件
 * @module tabs/1.1.x/
 * @category Widget
 */

var base = require('base/1.1.x/'),
	widget = require('widget/1.1.x/'),
	uaDetector = require('uadetector/1.0.x/'),
	location = window.location;


/**
 * 选项卡组件类
 * @class Tabs
 * @extends widget/1.1.x/{WidgetBase}
 * @constructor
 * @exports
 * @param {Object} options 组件设置
 *   @param {NodeList} [options.wrapper] 选项卡组件容器。
 *     如不指定，则tabs和panels参数必须为NodeList类型
 *   @param {NodeList|String} [options.tabs='.tabs__tabs__item'] 选项卡节点。
 *     可以是节点集合或者以wrapper为上下文的选择器
 *   @param {NodeList|String} [options.panels='.tabs__panels__item'] 内容面板节点。
 *     可以是节点集合或者以wrapper为上下文的选择器
 *   @param {Number} [options.active=0] 初始激活项
 *   @param {String} [options.event] 选项卡触发内容显示的事件，PC端默认为mouseover，移动端默认为click
 *   @param {Boolean} [options.isPreventDefault] 是否阻止event的默认动作。PC端默认为false，移动端默认为true
 *   @param {Boolean} [options.useHashStorage=false] 是否通过锚点记录当前选项卡
 *   @param {String} [options.activeTabClass='tabs__tabs__item--active'] 选项卡在激活状态下的CSS类
 *   @param {String} [options.activePanelClass='tabs__panels__item--active'] 内容面板在激活状态下的CSS类
 *   @param {Object} [options.activePanelStyle] 内容面板在激活状态下的样式，默认为display:block
 *   @param {Object} [options.inactivePanelStyle] 内容面板在非激活状态下的样式，默认为display:none
 *   @param {Function(current,total)} [options.next] 返回下一个序号的函数，默认为当前序号加一
 *   @param {Function(current,total)} [options.prev] 返回上一个序号的函数，默认为当前序号减一
 *   @param {Number} [options.playInterval=5000] 播放间隔
 */
return widget.create({
	_init: function(options) {
		var t = this;

		// 获取选项卡
		t._tabs = typeof options.tabs === 'string' ?
			options.wrapper.find(options.tabs) : options.tabs;

		// 获取内容
		t._panels = typeof options.panels === 'string' ?
			options.wrapper.find(options.panels) : options.panels;

		// 记录总数
		t._total = Math.min(t._tabs.length, t._panels.length);

		// 选项卡触发内容显示的事件
		if (options.event) {
			t._onDOMEvent(t._tabs, options.event, function(e) {
				if (options.preventDefault) { e.preventDefault(); }
				t.activate(t._tabs.indexOf(this), e);
			});
		}

		// 显示初始项
		var hash = location.hash.substr(1);
		if (options.useHashStorage && hash) {
			t.activate(hash);
		} else if (options.active != null) {
			t.activate(options.active);
		}
	},

	_destroy: function() {
		this.stop();
	},

	/**
	 * 激活某个选项卡
	 * @method activate
	 * @for Tabs
	 * @param {Number|String} n 选项卡序号或内容面板id
	 */
	activate: function(n, _e) {
		// _e为事件对象，仅供内部使用

		var t = this, options = t._options;

		if (typeof n === 'string') {
			var hasPanel = t._panels.some(function(panel, i) {
				if (panel.id === n) {
					n = i;
					return true;
				}
			});
			if (!hasPanel) { n = 0; }
		}

		var active = t._active, evtProps = {
			newTab: t._tabs.get(n),
			newPanel: t._panels.get(n),
			newActive: n,
			sourceEvent: _e
		};
		if (active != null) {
			evtProps.oldTab = t._tabs.get(active);
			evtProps.oldPanel = t._panels.get(active);
			evtProps.oldActive = active;
		}

		/**
		 * 激活某个选项卡前触发
		 * @event beforeactivate
		 * @for Tabs
		 * @param {Object} e 事件对象
		 *   @param {Object} e.sourceEvent 源事件对象
		 *   @param {NodeList} e.newTab 即将被激活的选项卡
		 *   @param {NodeList} e.newTab 即将被激活的内容面板
		 *   @param {Number} e.newActive 即将被激活项的数字索引
		 *   @param {NodeList} [e.oldTab] 即将被反激活的选项卡
		 *   @param {NodeList} [e.oldPanel] 即将被反激活的内容面板
		 *   @param {Number} [e.oldActive] 即将被反激活项的数字索引
		 *   @param {Function} e.preventDefault 调用此方法可阻止activate动作
		 */
		if ( !t._trigger('beforeactivate', evtProps).isDefaultPrevented() ) {
			var tab, panel;
			for (var i = 0; i < t._total; i++) {
				tab = t._tabs.eq(i);
				panel = t._panels.eq(i);
				if (i === n) {
					tab.addClass(options.activeTabClass);
					panel.addClass(options.activePanelClass);
					panel.css(options.activePanelStyle);
				} else {
					tab.removeClass(options.activeTabClass);
					panel.removeClass(options.activePanelClass);
					panel.css(options.inactivePanelStyle);
				}
			}

			t._active = n;

			if (options.useHashStorage) {
				if (n === 0) {
					// 默认就是第一个，不需要记录
					location.hash = '';
				} else {
					var newPanelId = t._panels.eq(n).attr('id');
					if ( newPanelId && newPanelId !== location.hash.substr(1) ) {
						location.hash = newPanelId;
					}
				}
			}

			/**
			 * 激活某个选项卡后触发
			 * @event activate
			 * @for Tabs
			 * @param {Object} e 事件对象
			 *   @param {Object} e.sourceEvent 源事件对象
			 *   @param {NodeList} e.newTab 即将被激活的选项卡
			 *   @param {NodeList} e.newTab 即将被激活的内容面板
			 *   @param {Number} e.newActive 即将被激活项的数字索引
			 *   @param {NodeList} [e.oldTab] 即将被反激活的选项卡
			 *   @param {NodeList} [e.oldPanel] 即将被反激活的内容面板
			 *   @param {Number} [e.oldActive] 即将被反激活项的数字索引
			 */
			t._trigger('activate', evtProps);
		}
	},

	/**
	 * 激活下一个选项卡
	 * @method next
	 * @for Tabs
	 */
	next: function() {
		var t = this;
		if (t._options.next) {
			t.activate( t._options.next.call(window, t._active, t._total) ) ;
		}
	},

	/**
	 * 激活上一个选项卡
	 * @method prev
	 * @for Tabs
	 */
	prev: function() {
		var t = this;
		if (t._options.prev) {
			t.activate( t._options.prev.call(window, t._active, t._total) ) ;
		}
	},

	/**
	 * 开始播放（逐个激活）选项卡
	 * @method play
	 * @for Tabs
	 */
	play: function() {
		var t = this, interval = t._options.playInterval;

		if (interval && !t._playTimer) {
			t._playTimer = setInterval(function() {
				t.next();
			}, interval);

			if (!t._isPlayingOn) {
				var elements = t._tabs.add(t._panels);
				// 鼠标移入时暂停
				t._onDOMEvent(elements, 'mouseenter', {
					id: 'pause',
					fn: 'pause'
				});
				// 鼠标移开后继续
				t._onDOMEvent(elements, 'mouseleave', {
					id: 'play',
					fn: 'play'
				});

				t._isPlayingOn = true;
			}
		}
	},

	/**
	 * 暂停播放选项卡
	 * @method pause
	 * @for Tabs
	 */
	pause: function() {
		if (this._playTimer) {
			clearInterval(this._playTimer);
			delete this._playTimer;
		}
	},

	/**
	 * 停止播放选项卡
	 * @method stop
	 * @for Tabs
	 */
	stop: function() {
		var t = this;

		t.pause();

		if (t._isPlayingOn) {
			t._offDOMEvent(t._tabs, 'mouseenter', 'pause');
			t._offDOMEvent(t._panels, 'mouseenter', 'pause');
			t._offDOMEvent(t._tabs, 'mouseleave', 'play');
			t._offDOMEvent(t._panels, 'mouseleave', 'play');
			delete t._isPlayingOn;
		}
	}
}, {
	tabs: '.tabs__tabs__item',
	panels: '.tabs__panels__item',
	active: 0,
	event: uaDetector.isDevice('pc') ? 'mouseover' : 'click',
	preventDefault: !uaDetector.isDevice('pc'),
	useHashStorage: false,
	activeTabClass: 'tabs__tabs__item--active',
	activePanelClass: 'tabs__panels__item--active',
	activePanelStyle: { display: 'block' },
	inactivePanelStyle: { display: 'none' },
	next: function(current, total) {
		return current == null ? 0 : (current + 1) % total;
	},
	prev: function(current, total) {
		if (current == null) { return 0; }
		var val = current - 1;
		return val < 0 ? total - val : val;
	},
	playInterval: 5000
});

});