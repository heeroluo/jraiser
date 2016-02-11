/*!
 * JRaiser 2 Javascript Library
 * paginator - v1.1.0 (2016-02-11T10:25:36+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 分页条组件
 * @module paginator/1.1.x/
 * @category Widget
 */

var widget = require('widget/1.1.x/'), Tmpl = require('tmpl/2.1.x/');


/**
 * 分页条组件类
 * @class Paginator
 * @extends widget/1.1.x/{WidgetBase}
 * @constructor
 * @exports
 * @param {Object} options 组件设置
 *   @param {NodeList} [options.wrapper] 分页条容器
 *   @param {Number} [options.currentPage=1] 当前页
 *   @param {Number} [options.totalPages] 总页数
 *   @param {Number} [options.howManyPageItems=7] 显示多少个页码项
 *   @param {String} [options.prevText='上一页'] 上一页文字
 *   @param {String} [options.nextText='下一页'] 下一页文字
 *   @param {String} [options.ellipsisText='...'] 省略符文字
 *   @param {String} [options.template] 分页条HTML模版（一般情况下不建议修改）
 */
return widget.create({
	_init: function(options) {
		var t = this, wrapper = options.wrapper;

		if (!wrapper) { return; }

		// 写入分页条HTML
		wrapper.empty().html( Tmpl.render(options.template, {
			currentPage: options.currentPage,
			totalPages: options.totalPages,
			pageItems: t._build(),
			nextText: options.nextText,
			prevText: options.prevText,
			ellipsisText: options.ellipsisText
		}) );

		wrapper.find('a').click(function(e) {
			e.preventDefault();
			/**
			 * 点击分页条中的链接时触发
			 * @event click
			 * @param {Object} e 事件参数
			 *   @param {Number} e.page 页码
			 * @for Paginator
			 */
			t._trigger('click', {
				page: parseInt( this.getAttribute('data-page') )
			});
		});
	},

	_destroy: function(options) {
		if (options.wrapper) { options.wrapper.empty();	}
	},

	_build: function() {
		var options = this._options, totalPages = options.totalPages;
		if (totalPages < 1) {
			throw new Error('the value of "totalPages" cannot be less then 1');
		}

		var howManyPageItems = options.howManyPageItems,
			howManyPageItemsPerSide = parseInt( (howManyPageItems - 1) / 2 ),
			currentPage = options.currentPage || 1,
			data = [ ];

		var start = currentPage - howManyPageItemsPerSide,
			end = currentPage + howManyPageItemsPerSide,
			startOverflow = start - 1,
			endOverflow = totalPages - end;

		// 把左侧剩余的页码额度移到右侧
		if (startOverflow < 0) {
			start = 1;
			end = Math.min(totalPages, end - startOverflow);
		}
		// 把右侧剩余的页码移到左侧
		if (endOverflow < 0) {
			end = totalPages;
			if (startOverflow > 0) { start = Math.max(1, start + endOverflow); }
		}

		// 处理 howManyPageItems 为双数，减一后除不尽的情况
		if (howManyPageItems % 2 === 0) {
			if (start > 1) {
				start--;
			} else if (end < totalPages) {
				end++;
			}
		}

		// 开始页码大于1，但第一页一定要显示，所以要减一个额度
		if (start > 1) { start++; }
		// 结束页码小于总页数，但最后一页一定要显示，所以要减一个额度
		if (end < totalPages) { end--; }

		// 补充第一页到开始页
		if (start - 1) {
			data.push({
				page: 1,
				current: false
			}, {
				page: '...'
			});
		}

		for (var i = start; i <= end; i++) {
			data.push({
				page: i,
				current: i == currentPage
			});
		}

		// 补充结束页到末页
		if (totalPages - end) {
			data.push({
				page: '...'
			}, {
				page: totalPages,
				current: false
			});
		}

		return data;
	}
}, {
	currentPage: 1,
	howManyPageItems: 7,
	prevText: '上一页',
	nextText: '下一页',
	ellipsisText: '...',
	template:
'<ol class="paginator">' +
'<% if (currentPage > 1) { %>' +
	'<li class="paginator__item paginator__item-prev"><a href="#" data-page="<%=(currentPage - 1)%>" class="paginator__item__inner"><%=prevText%></a></li>' +
'<% } else { %>' +
	'<li class="paginator__item paginator__item-prev paginator__item--disabled"><span class="paginator__item__inner"><%=prevText%></span></li>' +
'<% } %>' +
'<% pageItems.forEach(function(obj) { %>' +
	'<% if (obj.current) { %>' +
	'<li class="paginator__item paginator__item-number paginator__item--current"><span class="paginator__item__inner"><%=obj.page%></span></li>' +
	'<% } else if (obj.page === "...") { %>' +
	'<li class="paginator__item paginator__item-ellipsis"><span class="paginator__item__inner"><%=ellipsisText%></span></li>' +
	'<% } else { %>' +
	'<li class="paginator__item paginator__item-number"><a href="#" data-page="<%=obj.page%>" class="paginator__item__inner"><%=obj.page%></a></li>' +
	'<% } %>' +
'<% }); %>' +
'<% if (currentPage < totalPages) { %>' +
	'<li class="paginator__item paginator__item-next"><a href="#" data-page="<%=(currentPage + 1)%>" class="paginator__item__inner"><%=nextText%></a></li>' +
'<% } else { %>' +
	'<li class="paginator__item paginator__item-next paginator__item--disabled"><span class="paginator__item__inner"><%=nextText%></span></li>' +
'<% } %>' +
'</ol>'
});

});