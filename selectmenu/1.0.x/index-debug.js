/*!
 * JRaiser 2 Javascript Library
 * selectmenu - v1.0.0 (2014-08-22T09:47:27+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 模拟选择框组件
 * @module selectmenu/1.0.x/
 * @category Widget
 */

var widget = require('widget/1.0.x/'),
	Tmpl = require('tmpl/2.0.x/'),
	$ = require('dom/1.0.x/'),
	Scrollbar = require('scrollbar/1.0.x/');


var tmpl = new Tmpl({
	SELECT_MENU:
'<div class="selectmenu">' +
	'<div class="selectmenu-button">' +
		'<span class="selectmenu-currenttext"><%=defaultText%></span>' +
		'<span class="selectmenu-triangle"></span>' +
	'</div>' +
	'<input<% if (name) { %> name="<%=name%>"<% } %> type="hidden"></input>' +
	'<div class="selectmenu-menu">' +
		'<div class="selectmenu-menu-inner">' +
			'<ul class="selectmenu-options"></ul>' +
		'</div>' +
	'</div>' +
'</div>',

	OPTION_ITEMS:
'<% data.forEach(function(d) { %>' +
'<li class="selectmenu-option" data-value="<%=(d.value == null ? d.text : d.value)%>"><%=d.text%></li>' +
'<% }); %>'
});


/**
 * 模拟选择框组件
 * @class SelectMenu
 * @extends widget/1.0.x/{WidgetBase}
 * @constructor
 * @exports
 * @param {Object} options 组件设置
 *   @param {NodeList} options.appendTo 选择框所在容器
 *   @param {Array<Object<text,value>>} [options.optionItems] 选项参数列表
 *   @param {String} [options.name] 表单字段名
 *   @param {String} [options.defaultText] 默认文字
 *   @param {String} [options.value] 初始值
 */
return widget.create(function() {

}, {
	_init: function(options) {
		var t = this,
			wrapper = t._wrapper = $( tmpl.render('SELECT_MENU', {
				name: options.name || '',
				defaultText: options.defaultText || ''
			}) );

		options.appendTo.append(wrapper);

		wrapper.click(function() { t._clickOnMe = true; });
		t._onDocumentClick = function() {
			// 不是在选择框内点击时，隐藏弹出层
			if (!t._clickOnMe) { t.hideMenu(); }
			t._clickOnMe = false;
		};
		$(document).click(t._onDocumentClick);

		// 代理每个option的点击
		t._optionList = wrapper.find('ul.selectmenu-options').on('click', function() {
			t.hideMenu();
			t.val( this.getAttribute('data-value') );
		}, {
			delegator: 'li'
		});

		wrapper.find('div.selectmenu-button').click(function() { t.toggleMenu(); });

		t._addOptionItems(options.optionItems);
		if (options.value != null) { t.val(options.value); }	
	},

	_destroy: function(options) {
		var t = this;

		if (t._scrollbar) {
			t._scrollbar.destroy();
			delete t._scrollbar;
		}

		delete t._clickOnMe;
		$(document).off('click', t._onDocumentClick);
		delete t._onDocumentClick;
		delete t._scrollTimer;

		t._wrapper.remove();
		delete t._wrapper;
		delete t._optionList;

		delete t._data;
	},

	/**
	 * 如果菜单已显示，则关闭；如果菜单已关闭，则显示
	 * @method toggleMenu
	 * @for SelectMenu
	 */
	toggleMenu: function() {
		if ( this._wrapper.hasClass('selectmenu-open') ) {
			this.hideMenu();
		} else {
			this.showMenu();
		}
	},

	/**
	 * 显示菜单
	 * @method showMenu
	 * @for SelectMenu
	 */
	showMenu: function() {
		var t = this;
		if (!t._data.length) { return }

		var selectMenu = t._wrapper.addClass('selectmenu-open')
			.find('div.selectmenu-menu').css('height', '').show();

		var listHeight = t._optionList.outerHeight(true);

		// 当列表高度太小的时候，重设高度
		if ( listHeight <= selectMenu.height() ) { selectMenu.css('height', listHeight); }

		// 刷新滚动条
		if (!t._scrollbar) {
			t._scrollbar = new Scrollbar({
				scrollOuter: selectMenu,
				scrollBody: t._optionList,
				mouseWheelStep: 35,
				events: {
					scroll: function() {
						t._clickOnMe = true;
						if (t._scrollTimer) { clearTimeout(t._scrollTimer); }
						// 一定时间后吧clickOnMe设为false，否则滚轮滚动后在其他地方必须点两下才能关闭菜单
						t._scrollTimer = setTimeout(function() { t._clickOnMe = false; }, 120);
					}
				}
			});
		} else {
			t._scrollbar.refresh();
		}
	},

	/**
	 * 隐藏菜单
	 * @method hideMenu
	 * @for SelectMenu
	 */
	hideMenu: function() {
		this._wrapper.removeClass('selectmenu-open').find('div.selectmenu-menu').hide();
	},

	// 增加列表项
	_addOptionItems: function(items) {
		var t = this;
		t._data = t._data || [ ];
		if (items && items.length) {
			t._data = t._data.concat(items);
			t._optionList.empty().html( tmpl.render('OPTION_ITEMS', { data: t._data }) );
		}
		if (t._data.length) {
			t._wrapper.removeClass('selectmenu-nooptions');
		} else {
			t._wrapper.addClass('selectmenu-nooptions');
		}
	},

	/**
	 * 设置值
	 * @method val
	 * @for SelectMenu
	 * @param {String} newValue 新值
	 */
	/**
	 * 获取当前值
	 * @method val
	 * @for SelectMenu
	 * @return {String} 当前值
	 */
	val: function(newValue) {
		var t = this, oldValue = t._value;

		if (!arguments.length) { return oldValue; }

		newValue = String(newValue);

		// 值一样，无需再设置
		if (newValue === oldValue) { return; }

		// 查找值在列表中的位置
		var data = t._data;
		for (var i = data.length - 1; i >= 0; i--) {
			if (String(data[i].value) === newValue) { break; }
		}

		var text;
		if (i === -1) {
			// 值不在列表中，清空
			text = t._options.defaultText;
			newValue = '';
		} else {
			text = data[i].text;
		}

		// 设置当前值的文字
		t._wrapper.find('span.selectmenu-currenttext').text(text);
		// 处理选中状态
		t._optionList.children()
			.eq(i).addClass('selectmenu-option-selected')
			.siblings().removeClass('selectmenu-option-selected');

		t._value = newValue;
		t._wrapper.find('input').val(newValue);

		/**
		 * 选择框的值改变时触发
		 * @event change
		 * @for SelectMenu
		 * @param {Object} e 事件参数
		 *   @param {Number} e.newValue 新值
		 *   @param {Number} e.oldValue 旧值
		 */
		t.trigger('change', {
			newValue: newValue,
			oldValue: oldValue
		});
	}
});

});