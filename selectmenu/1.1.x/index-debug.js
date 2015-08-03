/*!
 * JRaiser 2 Javascript Library
 * selectmenu - v1.1.0 (2015-08-03T18:06:14+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 模拟选择框组件
 * @module selectmenu/1.1.x/
 * @category Widget
 */

var widget = require('widget/1.1.x/'),
	Tmpl = require('tmpl/2.1.x/'),
	$ = require('dom/1.1.x/'),
	Scrollbar = require('scrollbar/1.1.x/');


var tmpl = new Tmpl({
	SELECTMENU:
'<div class="ui-selectmenu">' +
	'<div class="ui-selectmenu__button">' +
		'<span class="ui-selectmenu__button__text"><%=defaultText%></span>' +
		'<span class="ui-selectmenu__button__icon"></span>' +
	'</div>' +
	'<input<% if (name) { %> name="<%=name%>"<% } %> type="hidden" />' +
	'<div class="ui-selectmenu__layer" style="display: none;">' +
		'<div class="ui-selectmenu__layer__inner">' +
			'<ul class="ui-selectmenu__menu"></ul>' +
		'</div>' +
	'</div>' +
'</div>',

	MENU_ITEMS:
'<% data.forEach(function(d) { %>' +
'<li class="ui-selectmenu__menu__item" data-value="<%=(d.value == null ? d.text : d.value)%>"><%=d.text%></li>' +
'<% }); %>'
});


/**
 * 模拟选择框组件
 * @class SelectMenu
 * @extends widget/1.1.x/{WidgetBase}
 * @constructor
 * @exports
 * @param {Object} options 组件设置
 *   @param {NodeList} options.appendTo 选择框所在容器
 *   @param {Array<Object<text,value>>} [options.menuItems] 菜单列表
 *   @param {String} [options.name] 表单字段名
 *   @param {String} [options.defaultText] 默认文字
 *   @param {String} [options.value] 初始值
 */
return widget.create({
	_init: function(options) {
		var t = this;
		
		var wrapper = t._wrapper = $( tmpl.render('SELECTMENU', {
			name: options.name,
			defaultText: options.defaultText || ''
		}) ).css('user-select', 'none');

		options.appendTo.append(wrapper);

		// 不是在选择框内点击时，隐藏弹出层
		var isClickOnMe;
		wrapper.click(function() { isClickOnMe = true; });
		t._onDOMEvent($(document), 'click', function() {
			if (!isClickOnMe) { t.hideLayer(); }
			isClickOnMe = false;
		});

		wrapper.find('.ui-selectmenu__button').click(function() { t.toggleLayer(); });

		// 代理每个选项的点击
		t._menuList = wrapper.find('.ui-selectmenu__menu').on('click', function(e) {
			t.hideLayer();
			t.val(this.getAttribute('data-value'), e);
		}, {
			delegator: '.ui-selectmenu__menu__item'
		});

		if (options.menuItems) { t.addMenuItems(options.menuItems); }

		if (options.value != null) { t.val(options.value); }
	},

	_destroy: function() {
		this._wrapper.remove();
	},

	/**
	 * 显示菜单弹层
	 * @method showLayer
	 * @for SelectMenu
	 */
	showLayer: function() {
		var t = this;

		if (t._layerVisible) { return; }

		t._wrapper.addClass('ui-selectmenu--expanded');
		t._layerVisible = true;

		if (!t._menuItems || !t._menuItems.length) { return; }

		t._wrapper.find('.ui-selectmenu__layer').css('display', 'block');

		t._refresh();
	},

	/**
	 * 隐藏菜单弹层
	 * @method hideLayer
	 * @for SelectMenu
	 */
	hideLayer: function() {
		if (!this._layerVisible) { return; }

		this._wrapper.removeClass('ui-selectmenu--expanded')
			.find('.ui-selectmenu__layer').css('display', 'none');

		this._layerVisible = false;
	},

	/**
	 * 如果菜单弹层已显示，则关闭；如果菜单弹层已关闭，则显示
	 * @method toggleLayer
	 * @for SelectMenu
	 */
	toggleLayer: function() {
		if (this._layerVisible) {
			this.hideLayer();
		} else {
			this.showLayer();
		}
	},

	/**
	 * 增加菜单项
	 * @method addMenuItems
	 * @for SelectMenu
	 * @param {Array<Object<text,value>>} menuItems 菜单项对象数组
	 */
	addMenuItems: function(items) {
		var t = this;
		t._menuItems = t._menuItems || [ ];
		if (items && items.length) {
			t._menuItems = t._menuItems.concat(items);
			t._refresh();
		}
		if (t._menuItems.length) {
			t._wrapper.removeClass('ui-selectmenu--empty');
		} else {
			t._wrapper.addClass('ui-selectmenu--empty');
		}
	},

	/**
	 * 刷新菜单
	 * @method refresh
	 * @protected
	 * @for SelectMenu
	 */
	_refresh: function() {
		var t = this, menuItems = t._menuItems, value = t._value;

		// 查找值在列表中的位置
		for (var i = menuItems.length - 1; i >= 0; i--) {
			if (String(menuItems[i].value) === value) { break; }
		}

		var text;
		if (i === -1) {
			// 值不在列表中，清空
			text = t._options.defaultText;
			value = '';
		} else {
			text = menuItems[i].text;
		}

		// 设置当前值的文字
		t._wrapper.find('.ui-selectmenu__button__text').text(text);

		// 菜单可见的时候才进行弹出层内容渲染
		if (t._layerVisible) {
			if (!t._menuList.rendered) {
				t._menuList.html( tmpl.render('MENU_ITEMS', { data: menuItems }) );

				var menuLayer = t._wrapper.find('.ui-selectmenu__layer').css('height', ''),
					actualHeight = t._menuList.outerHeight(true);

				// 当列表高度小于外部高度时，重设为列表高度
				if ( actualHeight <= menuLayer.height() ) {
					// 考虑box-sizing为border-box的情况，要加上padding和border
					if (menuLayer.css('box-sizing') === 'border-box') {
						actualHeight += menuLayer.outerHeight() - menuLayer.height();
					}

					menuLayer.css('height', actualHeight);
				}

				t._menuList.rendered = true;
			}

			// 处理选中状态
			t._menuList.children()
				.eq(i).addClass('ui-selectmenu__menu__item--selected')
				.siblings().removeClass('ui-selectmenu__menu__item--selected');

			// 刷新滚动条
			if (t._scrollbar) {
				t._scrollbar.refresh();
			} else {
				t._scrollbar = new Scrollbar({
					scrollBody: t._menuList,
					mouseWheelStep: 35,
					scrollPageOnEnd: false
				});
			}
		}

		t._value = value;
		t._wrapper.find('input').val(value);
	},

	/**
	 * 设置值
	 * @method val
	 * @for SelectMenu
	 * @param {String} newValue 新值
	 * @param {Object} [e] 事件对象
	 */
	/**
	 * 获取当前值
	 * @method val
	 * @for SelectMenu
	 * @return {String} 当前值
	 */
	val: function(newValue, e) {
		var t = this, oldValue = t._value;

		if (!arguments.length) { return oldValue; }

		newValue = String(newValue);

		// 值一样，无需再设置
		if (newValue === oldValue) { return; }

		t._value = newValue;
		t._refresh();

		/**
		 * 选择框的值改变时触发
		 * @event change
		 * @for SelectMenu
		 * @param {Object} e 事件参数
		 *   @param {Object} e.sourceEvent 源事件对象
		 *   @param {Number} e.newValue 新值
		 *   @param {Number} e.oldValue 旧值
		 */
		t._trigger('change', {
			sourceEvent: e,
			newValue: t._value,
			oldValue: oldValue
		});
	}
});

});