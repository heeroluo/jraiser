/*!
 * JRaiser 2 Javascript Library
 * calendar - v1.0.1 (2015-04-23T17:24:26+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 月历组件
 * @module calendar/1.0.x/
 * @category Widget
 */

var base = require('base/1.0.x/'),
	$ = require('dom/1.0.x/'),
	widget = require('widget/1.0.x/'),
	tmpl = require('tmpl/1.0.x/');


var re_relNumber = /^([+-])(\d+)$/,
	weekDayNames = ['sun', 'mon', 'tues', 'wed', 'thur', 'fri', 'sat'];

// 月历数据模型
var CalendarModel = base.createClass(function(year, month) {
	this.year(year);
	this.month(month);
}, {
	// 获取或设置年份
	year: function (val) {
		if (arguments.length) {
			val = val || new Date().getFullYear();
			this._year = re_relNumber.test(val) ? this._year + parseInt(val) : parseInt(val);
		} else {
			return this._year;
		}
	},
	// 获取或设置月份
	month: function(val) {
		if (arguments.length) {
			val = val || new Date().getMonth() + 1;
			var month = re_relNumber.test(val) ? this._month + parseInt(val) : parseInt(val),
				temp = new Date(this._year, month - 1);

			// 修正年月值
			this._month = temp.getMonth() + 1;
			this._year = temp.getFullYear();
		} else {
			return this._month;
		}
	},
	// 生成月份数据
	build: function(selectedDates) {
		if (selectedDates) {
			if ( !base.isArray(selectedDates) ) {
				selectedDates = [selectedDates];
			}
			selectedDates = selectedDates.map(function(date) {
				date = new Date(date);
				date.setHours(0, 0, 0, 0);
				return date.getTime();
			});
		}

		var thisMonth = new Date(this._year, this._month - 1, 1),
			weekDay = thisMonth.getDay();

		// 补全一周
		var startTime = new Date(
			this._year, this._month - 1, weekDay ? 1 - weekDay : -6).getTime();

		// 设为下个月的-1天，即当前月的最后一天
		thisMonth.setMonth(this._month);
		thisMonth.setDate(0);
		weekDay = thisMonth.getDay();

		// 补全一周
		var endTime = new Date(
			this._year, this._month - 1, thisMonth.getDate() + (weekDay === 6 ? 7 : 6 - weekDay)
		).getTime();

		// 保证一月有6周
		if (endTime - startTime < 41 * 24 * 60 * 60 * 1000) {
			endTime += 7 * 24 * 60 * 60 * 1000;
		}

		var data = {
			year : this._year,
			month : this._month,
			weeks : [ ]
		};

		var temp, dateObj, week,
			step = 24 * 60 * 60 * 1000, today = new Date();
		today.setHours(0, 0, 0, 0);
		today = today.getTime();
		while (startTime <= endTime) {
			temp = new Date(startTime);

			dateObj = {
				year: temp.getFullYear(),
				month: temp.getMonth() + 1,
				date: temp.getDate(),
				weekDay: temp.getDay(),
				timestamp: temp.getTime(),
				states: [ ]
			};

			dateObj.states.push('calendar-day-week-' + weekDayNames[dateObj.weekDay]);
			if (dateObj.weekDay > 0 && dateObj.weekDay < 6) {
				dateObj.states.push('calendar-day-weekday');
			} else {
				dateObj.states.push('calendar-day-weekend');
			}

			if (dateObj.year < this._year ||
				(dateObj.year === this._year && dateObj.month < this._month)
			) {
				// 上个月
				dateObj.states.push('calendar-day-last-month');
			} else if (dateObj.year > this._year ||
				(dateObj.year === this._year && dateObj.month > this._month)
			) {
				// 下个月
				dateObj.states.push('calendar-day-next-month');
			} else {
				// 当前月
				dateObj.states.push('calendar-day-current-month');
			}

			if (dateObj.timestamp > today) {
				dateObj.states.push('calendar-day-future');
			} else if (dateObj.timestamp < today) {
				dateObj.states.push('calendar-day-past');
			} else {
				dateObj.states.push('calendar-day-today');
			}

			if (selectedDates) {
				selectedDates.some(function(timestamp) {
					if (timestamp === dateObj.timestamp) {
						dateObj.states.push('calendar-day-selected');
						return true;
					}
				});
			}

			if (!week || week.length === 7) {
				week = [ ];
				data.weeks.push(week);
			}
			week.push(dateObj);

			startTime += step;
		}

		return data;
	}
});


/**
 * 月历组件类
 * @class Calendar
 * @constructor
 * @extends widget/1.0.x/{WidgetBase}
 * @exports
 * @param {Object} options 组件设置
 *   @param {NodeList} options.wrapper 月历所在容器
 *   @param {Array} [options.weekDayNames] 星期日到星期六对应文字
 *   @param {String} [options.template] 月历模版，不建议修改
 */
return widget.create(function(options) {

}, {
	_init: function(options) { },

	_destroy: function(options) {
		options.wrapper.empty();
		delete this._model;
	},

	/**
	 * 渲染月历
	 * @method render
	 * @for Calendar
	 * @param {Object} settings 月历设置
	 *   @param {Number} [settings.year] 年份，默认为当前年份
	 *   @param {Number} [settings.month] 月份，默认为当前月份
	 *   @param {Date|Array<Date>} [settings.selectedDates] 选中的日期
	 */
	render: function(settings) {
		var t  = this, options = t._options;

		// 创建数据模型
		if (t._model) {
			t._model.month(settings.month);
			t._model.year(settings.year);
		} else {
			t._model = new CalendarModel(settings.year, settings.month);
		}

		var data = t._model.build(settings.selectedDates);

		options.wrapper.empty().html(
			tmpl.render(options.template, {
				weekDayNames: options.weekDayNames,
				data: data
			})
		).find('td').click(function(e) {
			e.preventDefault();
			var date = new Date( parseInt( this.getAttribute('data-timestamp') ) );
			/**
			 * 选择月历中的某一天时触发
			 * @event dayselect
			 * @for Calendar
			 * @param {Object} e 事件对象
			 *   @param {Date} e.selectedDate 被选择那一天的日期对象
			 *   @param {Element} e.dayGrid 被点击的日期格子
			 */
			t.trigger('dayselect', {
				selectedDate: date,
				dayGrid: this
			});
		});

		/**
		 * 渲染月历时触发
		 * @event render
		 * @for Calendar
		 * @param {Object} e 事件对象
		 *   @param {Object} e.calendarData 月历数据
		 */
		t.trigger('render', {
			calendarData: data
		});
	},

	/**
	 * 渲染下个月的月历
	 * @method nextMonth
	 * @for Calendar
	 * @param {Date|Array<Date>} [selectedDates] 选中的日期
	 */
	nextMonth: function(selectedDates) {
		this.render({
			year: '+0',
			month: '+1',
			selectedDates: selectedDates
		});
	},

	/**
	 * 渲染上个月的月历
	 * @method prevMonth
	 * @for Calendar
	 * @param {Date|Array<Date>} [selectedDates] 选中的日期
	 */
	prevMonth: function(selectedDates) {
		this.render({
			year: '+0',
			month: '-1',
			selectedDates: selectedDates
		});
	},

	/**
	 * 渲染上一年的月历
	 * @method prevYear
	 * @for Calendar
	 * @param {Date|Array<Date>} [selectedDates] 选中的日期
	 */
	prevYear: function(selectedDates) {
		this.render({
			year: '-1',
			month: '+0',
			selectedDates: selectedDates
		});
	},

	/**
	 * 渲染下一年的月历
	 * @method nextYear
	 * @for Calendar
	 * @param {Date|Array<Date>} [selectedDates] 选中的日期
	 */
	nextYear: function(selectedDates) {
		this.render({
			year: '+1',
			month: '+0',
			selectedDates: selectedDates
		});
	}
}, {
	weekDayNames: '日一二三四五六'.split(''),
	template: '<table class="calendar">' +
'<% if (weekDayNames) { %>' +
	'<thead>' +
		'<tr>' +
	'<% for (var i = 0; i < 7; i++) { %>' +
			'<th><span class="calendar-grid"><%=weekDayNames[i]%></span></th>' +
	'<% } %>' +
		'</tr>' +
	'</thead>' +
'<% } %>' +
	'<tbody>' +
'<% for (var i = 0, j, weeks = data.weeks; i < weeks.length; i++) { %>' +
		'<tr>' +
	'<% for (j = 0; j < weeks[i].length; j++) { %>' +
			'<td class="calendar-day <%=weeks[i][j].states.join(" ")%>" data-timestamp="<%=weeks[i][j].timestamp%>">' +
				'<a href="#" class="calendar-grid"><%=weeks[i][j].date%></a>' +
			'</td>' +
	'<% } %>' +
		'</tr>' +
'<% } %>' +
	'</tbody>' +
'</table>'
});

});