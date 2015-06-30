/*!
 * JRaiser 2 Javascript Library
 * calendar - v1.1.0 (2015-06-29T15:31:08+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 月历组件
 * @module calendar/1.1.x/
 * @category Widget
 */

var base = require('base/1.1.x/'),
	$ = require('dom/1.1.x/'),
	Tmpl = require('tmpl/2.1.x/'),
	widget = require('widget/1.1.x/');


var tmpl = new Tmpl({
	table:
'<table class="ui-calendar"<%-tableAttrs%>>' +
'<% if (weekDayNames) { %>' +
	'<thead class="ui-calendar__head">' +
		'<tr>' +
	'<% weekDayNames.forEach(function(name) { %>' +
			'<th class="ui-calendar__head__grid"><%=name%></span></th>' +
	'<% }); %>' +
		'</tr>' +
	'</thead>' +
'<% } %>' +
	'<tbody class="ui-calendar__body">' +
'<% weeks.forEach(function(week) { %>' +
		'<tr>' +
	'<% week.forEach(function(dateObj) { %>' +
			'<td class="ui-calendar__body__date<% if (dateObj.tags) { %> <%=dateObj.tags.map(function(tag) { return "ui-calendar__body__date--" + tag; }).join(" ")%><% } %>"">' +
				'<%=dateObj.date%>' +
			'</td>' +
	'<% }); %>' +
		'</tr>' +
'<% }); %>' +
	'</tbody>' +
'</table>'
});

var re_relNumber = /^([+-])(\d+)$/;


/**
 * 月历组件类
 * @class Calendar
 * @constructor
 * @extends widget/1.1.x/{WidgetBase}
 * @exports
 * @param {Object} options 组件设置
 *   @param {NodeList} options.wrapper 月历所在容器
 *   @param {Number} [options.year] 年份。默认为当前年份
 *   @param {Number} [options.month] 月份。从1开始算，默认为当前月份
 *   @param {Array} [options.weekDayNames] 星期日到星期六对应文字
 *   @param {Function|Array<Function>} [options.customTags] 返回定制标签的函数(数组)
 *   @param {Object} [options.tableAttrs] 月历表格属性
 */
return widget.create({
	_init: function(options) {
		var now = new Date();
		this.year( options.year || now.getFullYear() );
		this.month( options.month || now.getMonth() + 1 );

		if ( options.customTags && !base.isArray(options.customTags) ) {
			options.customTags = [options.customTags];
		}
	},

	_destroy: function(options) {
		options.wrapper.empty();
	},

	/**
	 * 构建月历数据模型
	 * @method build
	 * @protected
	 * @for Calendar
	 * @return {Object} 月历数据模型
	 */
	_buildModel: function() {
		var options = this._options,
			year = this.year(),
			month = this.month(),
			theMonth = new Date(year, month - 1, 1),
			weekDay = theMonth.getDay(),
			weekDayNames = ['sun', 'mon', 'tues', 'wed', 'thur', 'fri', 'sat'];

		// 月历开始时间为本月第一周的周一
		var startTime = new Date(year, month - 1, 1 - weekDay).getTime();

		// 设为下个月的-1天，即当前月的最后一天
		theMonth.setMonth(month);
		theMonth.setDate(0);
		weekDay = theMonth.getDay();

		// 月历结束时间为本月最后一周的周六
		var endTime = new Date(year, month - 1, theMonth.getDate() + 6 - weekDay).getTime();

		// 存放最终结果
		var result = {
			year: year,
			month: month,
			weeks: [ ]
		};

		var step = 24 * 60 * 60 * 1000,
			theDate,
			theWeek,
			dateObj,
			tag;

		// 用于比较过去、当天、将来
		var today = new Date();
		today.setHours(0, 0, 0, 0);
		today = today.getTime();

		while (startTime <= endTime) {
			theDate = new Date(startTime);

			dateObj = {
				year: theDate.getFullYear(),
				month: theDate.getMonth() + 1,
				date: theDate.getDate(),
				day: theDate.getDay(),
				timestamp: startTime,
				tags: [ ]
			};

			dateObj.tags.push('week-' + weekDayNames[dateObj.day]);
			dateObj.tags.push(dateObj.day > 0 && dateObj.day < 6 ? 'weekday' : 'weekend');

			if (dateObj.year < year ||
				(dateObj.year === year && dateObj.month < month)
			) {
				// 上个月
				tag = 'last-month';
			} else if (dateObj.year > year ||
				(dateObj.year === year && dateObj.month > month)
			) {
				// 下个月
				tag = 'next-month';
			} else {
				// 当前月
				tag = 'current-month';
			}
			dateObj.tags.push(tag);

			if (dateObj.timestamp > today) {
				// 将来
				tag = 'future';
			} else if (dateObj.timestamp < today) {
				// 过去
				tag = 'past';
			} else {
				// 当天
				tag = 'today';
			}
			dateObj.tags.push(tag);

			// 处理定制标签
			if (options.customTags) {
				base.merge( dateObj.tags, options.customTags.map(function(fn) {
					return fn( new Date(startTime) );
				}) );
			}

			if (!theWeek || theWeek.length === 7) {
				theWeek = [ ];
				result.weeks.push(theWeek);
			}
			theWeek.push(dateObj);

			startTime += step;
		}

		return result;
	},

	/**
	 * 渲染月历
	 * @method render
	 * @for Calendar
	 */
	render: function() {
		var t = this, options = t._options;

		// 要重新渲染月历，原有的月历要清除，解绑所有DOM事件
		t._offDOMEvent();

		var model = t._buildModel({
			year: t._year,
			month: t._month,
			customTags: options.customTags
		});
		model.weekDayNames = options.weekDayNames;
		model.tableAttrs = '';
		if (options.tableAttrs) {
			base.each(options.tableAttrs, function(value, name) {
				model.tableAttrs += ' ' + name + '="' + value + '"';
			});
		}

		var table = $( tmpl.render('table', model) );
		
		t._onDOMEvent(table.find('.ui-calendar__body__date'), 'click', function(e) {
			e.preventDefault();

			var self = $(this),
				dateIndex = self.index(),
				weekIndex = self.parent().index(),
				dateObj = model.weeks[weekIndex][dateIndex];

			/**
			 * 选择月历中的某一天时触发
			 * @event dayselect
			 * @for Calendar
			 * @param {Object} e 事件对象
			 *   @param {Object} e.sourceEvent 源事件
			 *   @param {Object} e.selectedDate 被选择日期的数据对象
			 */
			t._trigger('dateselect', {
				sourceEvent: e,
				selectedDate: base.extend({
					dayName: options.weekDayNames[dateObj.day]
				}, dateObj)
			});
		});

		// 清空原有月历，添加新月历
		options.wrapper.html('').append(table);

		/**
		 * 渲染月历时触发
		 * @event render
		 * @for Calendar
		 * @param {Object} e 事件对象
		 *   @param {Object} e.table 月历表格HTML元素
		 */
		t._trigger('render', {
			table: table
		});
	},

	/**
	 * 设置年份
	 * @method year
	 * @for Calendar
	 * @param {Number|String} val 年份值，可以为“+1”、“-1”之类的相对值
	 */
	/**
	 * 获取年份
	 * @method year
	 * @for Calendar
	 * @return {Number} val 年份值
	 */
	year: function (val) {
		if (arguments.length) {
			this._year = re_relNumber.test(val) ? this._year + parseInt(val) : parseInt(val);
		} else {
			return this._year;
		}
	},

	/**
	 * 设置月份
	 * @method month
	 * @for Calendar
	 * @param {Number|String} val 月份值，可以为“+1”、“-1”之类的相对值
	 */
	/**
	 * 获取年份
	 * @method month
	 * @for Calendar
	 * @return {Number} val 月份值
	 */
	month: function(val) {
		if (arguments.length) {
			var month = re_relNumber.test(val) ? this._month + parseInt(val) : parseInt(val);

			// 修正年月值
			var date = new Date(this._year, month - 1);
			this._year = date.getFullYear();
			this._month = date.getMonth() + 1;
		} else {
			return this._month;
		}
	}
}, {
	weekDayNames: '日一二三四五六'.split('')
});

});