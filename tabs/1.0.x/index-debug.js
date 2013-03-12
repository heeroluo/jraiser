/*!
 * jRaiser 2 Javascript Library
 * tabs - v1.0.0 (2013-01-09T18:15:31+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * tabs模块提供选项卡功能部件
 * @module tabs/1.0.x/
 * @category Widget
 */

var base = require('base/1.0.x/'), widget = require('widget/1.0.x/');


/**
 * 选项卡部件
 * @class Tabs
 * @extends widget/1.0.x/{WidgetBase}
 * @constructor
 * @exports
 * @param {Object} options 部件设置
 *   @param {NodeList} [options.wrapper] 选项卡元素容器。
 *     如不指定，则必须在tabs和panels参数中直接指定节点
 *   @param {NodeList|String} [options.tabs='.ui-tabs-nav > *'] 选项卡节点。
 *     可以是节点集合或者以wrapper为上下文的选择器
 *   @param {NodeList|String} [options.panels='.ui-tabs-panels > *'] 内容面板节点。
 *     可以是节点集合或者以wrapper为上下文的选择器
 *   @param {Number} [options.active=0] 初始化激活项
 *   @param {showWhen} [options.showWhen] 选项卡触发内容显示的事件，
 *     默认为mouseover（触摸屏下为click）
 *   @param {Boolean} [options.isPreventDefault=false] 是否阻止showWhen动作的默认事件
 *   @param {Boolean} [options.useHashStorage=false] 是否通过hash记录当前所在选项卡
 *   @param {String} [options.activeTabClass='ui-tabs-tab-active'] 选项卡在激活状态下的CSS类
 *   @param {String} [options.activePanelClass='ui-tabs-panel-active'] 内容在激活状态下的CSS类
 *   @param {Object} [options.activePanelStyle] 内容在激活状态下的样式，默认为display:block
 *   @param {Object} [options.inactivePanelStyle] 内容在非激活状态下的样式，默认为display:none
 *   @param {Function(current,total)} [options.next] 返回下一个序号的函数，默认为当前序号加一
 *   @param {Function(current,total)} [options.prev] 返回上一个序号的函数，默认为当前序号减一
 *   @param {Number} [options.playInterval=5000] 播放间隔
 */
return widget.create(function(options) {

}, {
	_init: function(options) {
		var t = this;

		// 获取选项卡
		t._tabs = typeof options.tabs === 'string' ?
			options.wrapper.find(options.tabs) : options.tabs;

		// 获取内容
		t._panels = typeof options.panels === 'string' ?
			options.wrapper.find(options.panels) : options.panels;

		// 记录总数
		t._total = t._panels.length;

		/**
		 * 显示某个选项卡对应的内容
		 * @method show
		 * @param {Number} n 选项卡序号
		 * @for Tabs
		 */
		t.show = function(e) {
			var n;
			switch (typeof e) {
				case 'number':
					n = parseInt(e);
					break;

				case 'string':
					t._panels.each(function(panel, i) {
						if (panel.id === e) {
							n = i;
							return false;
						}
					});
					if (n == null) { n = 0; }
					break;

				default:
					if (options.isPreventDefault) { e.preventDefault(); }
					n = t._tabs.indexOf(this);
			}

			var evtProps = { }, active = t._active;
			if (t._active != null) {
				evtProps.oldTab = t._tabs.get(active);
				evtProps.oldPanel = t._panels.get(active);
				evtProps.newTab = t._tabs.get(n);
				evtProps.newPanel = t._panels.get(n);
				evtProps.oldActive = t._active;
				evtProps.newActive = n;
			}
			base.mix(evtProps, e, {
				overwrite: false
			});

			/**
			 * 显示某个内容面板前触发，可以阻止show动作
			 * @event beforeshow
			 * @for Tabs
			 */
			if ( !t.trigger('beforeshow', evtProps).isDefaultPrevented() ) {
				t._tabs.removeClass(options.activeTabClass);
				t._tabs.eq(n).addClass(options.activeTabClass);
				t._panels
					.css(options.inactivePanelStyle)
					.removeClass(options.activePanelClass);
				var newPanelId = t._panels.eq(n)
					.css(options.activePanelStyle)
					.addClass(options.activePanelClass)
					.attr('id');

				t._active = n;

				if (options.useHashStorage && newPanelId !== location.hash.substr(1) && n) {
					location.hash = newPanelId;
				}

				/**
				 * 显示某个内容面板后触发，可以阻止show动作
				 * @event aftershow
				 * @for Tabs
				 */
				t.trigger('aftershow', evtProps);
			}
		};

		/**
		 * 显示下一个选项卡对应的内容
		 * @method next
		 * @for Tabs
		 */
		t.next = function() {
			if (options.next) {
				t.show( options.next.call(window, t._active, t._total) ) ;
			}
		};

		/**
		 * 显示上一个选项卡对应的内容
		 * @method prev
		 * @for Tabs
		 */
		t.prev = function() {
			if (options.prev) {
				t.show( options.prev.call(window, t._active, t._total) ) ;
			}
		};

		/**
		 * 开始播放
		 * @method play
		 * @for Tabs
		 */
		t.play = function() {
			if (options.playInterval && !t._autoPlayTimer) {
				t._autoPlayTimer = setInterval(function() {
					t.next();
				}, options.playInterval);

				if (!t._isPlayingOn) {
					t._tabs.mouseover(t.pause).mouseout(t.play);
					t._panels.mouseover(t.pause).mouseout(t.play);
					t._isPlayingOn = true;
				}
			}
		};

		/**
		 * 暂停播放
		 * @method pause
		 * @for Tabs
		 */
		t.pause = function() {
			if (t._autoPlayTimer) {
				clearInterval(t._autoPlayTimer);
				delete t._autoPlayTimer;
			}
		};

		/**
		 * 停止播放
		 * @method stop
		 * @for Tabs
		 */
		t.stop = function() {
			t.pause();
			
			if (t._isPlayingOn) {
				t._tabs.off('mouseover', t.pause).off('mouseout', t.play);
				t._panels.off('mouseover', t.pause).off('mouseout', t.play);

				delete t._isPlayingOn;
			}
		};

		// 选项卡触发内容显示事件
		if (options.showWhen) { t._tabs.on(options.showWhen, t.show); }

		// 显示初始项
		if (options.useHashStorage && location.hash) {
			t.show( location.hash.substr(1) );
		} else if (options.active != null) {
			t.show(options.active);
		}
	},

	_destroy: function(options) {
		var t = this;

		t.stop();

		if (options.showWhen) {
			t._tabs.off(options.showWhen, t.show);
		}

		delete t._total;
		delete t.next;
		delete t.prev;
		delete t.show;
		delete t.play;
		delete t.pause;
		delete t.stop;
		delete t._tabs;
		delete t._panels;
		delete t._active;
	}
}, {
	tabs: '.ui-tabs-nav > *',
	panels: '.ui-tabs-panels > *',
	active: 0,
	showWhen: 'ontouchstart' in document ? 'click' : 'mouseover',
	isPreventDefault: false,
	useHashStorage: false,
	activeTabClass: 'ui-tabs-tab-active',
	activePanelClass: 'ui-tabs-panel-active',
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