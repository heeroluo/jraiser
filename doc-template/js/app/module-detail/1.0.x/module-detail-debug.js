define(function(require, exports, module) { 'use strict';

var $ = require('dom/1.1.x/'),
	animation = require('animation/1.0.x/'),
	Tabs = require('tabs/1.2.x/');

var wrapper = $('#module-body'),
	tabs =  wrapper.find('.module-body__nav li');

// 排除回到顶部按钮
var backToTop = tabs.splice(-1, 1);

var tabs = new Tabs({
	$tabs: tabs,
	$panels: wrapper.find('.module-body__container__panel'),
	event: 'click',
	useHashStorage: true
});

// 回到顶部
$(backToTop).click(function(e) {
	e.preventDefault();

	animation.add({
		startValue: Math.max(document.body.scrollTop, document.documentElement.scrollTop),
		endValue: 0,
		duration: 200,
		step: function(value) {
			window.scrollTo(0, value);
		}
	});
});

});