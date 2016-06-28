/*!
 * JRaiser 2 Javascript Library
 * calendar@1.2.0 (2016-06-21T15:15:46+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 月历组件
 * @module calendar@1.2.x, calendar/1.2.x/
 * @category UI
 */

var base = require('base@1.1.x'),
	$ = require('dom@1.1.x'),
	Tmpl = require('tmpl@2.1.x'),
	widget = require('widget@1.1.x');


var tmpl = new Tmpl({
	table:
'<table class="ui-calendar"<%-tableAttrs%>>' +
'<% if (weekDayTitles) { %>' +
	'<thead class="ui-calendar__head">' +
		'<tr>' +
	'<% weekDayTitles.forEach(function(title) { %>' +
			'<th class="ui-calendar__head__grid">' +
				'<span class="ui-calendar__head__grid__inner"><%=title%></span>' +
			'</th>' +
	'<% }); %>' +
		'</tr>' +
	'</thead>' +
'<% } %>' +
	'<tbody class="ui-calendar__body">' +
'<% weeks.forEach(function(week) { %>' +
		'<tr>' +
	'<% week.forEach(function(dateObj) { %>' +
			'<td class="ui-calendar__body__date<% if (dateObj.tags) { %> <%=dateObj.tags.map(function(tag) { return "ui-calendar__body__date--" + tag; }).join(" ")%><% } %>">' +
				'<span class="ui-calendar__body__date__inner"><%=dateObj.date%></span>' +
			'</td>' +
	'<% }); %>' +
		'</tr>' +
'<% }); %>' +
	'</tbody>' +
'</table>'
});

var re_relNumber = /^([+-])(\d+)$/,
	CLASSNAME_SELECTED = 'ui-calendar__body__date--selected';


// 克隆日期对象
function cloneDateObj(src) {
	var result = base.extend({ }, src);
	result.tags = result.tags.slice();
	return result;
}


/**
 * 月历组件类
 * @class Calendar
 * @constructor
 * @extends widget/1.1.x/{WidgetBase}
 * @exports
 * @param {Object} options 组件设置
 *   @param {NodeList} options.$appendTo 月历所在容器
 *   @param {Number} [options.year] 年份。默认为当前年份
 *   @param {Number} [options.month] 月份。从1开始算，默认为当前月份
 *   @param {Number} [options.date] 选中的日子，默认为当天。不需要选中则传0
 *   @param {Array} [options.weekDayTitles] 星期日到星期六对应文字
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

		this.render();

		if (options.date !== 0) {
			this._selectDate( options.date || now.getDate() );
		}
	},

	_destroy: function() { this._$table.remove(); },

	/**
	 * 构建月历数据模型
	 * @method _buildModel
	 * @protected
	 * @for Calendar
	 * @return {Object} 月历数据模型
	 */
	_buildModel: function() {
		var options = this._options,
			year = this.year(),
			month = this.month(),
			theMonth = new Date(year, month - 1, 1),
			weekDay = theMonth.getDay();

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
			dateObj.dayTitle = options.weekDayTitles[dateObj.day];

			dateObj.tags.push(dateObj.day > 0 && dateObj.day < 6 ? 'weekday' : 'weekend');

			if (dateObj.year !== year || dateObj.month !== month) {
				dateObj.tags.push('overflow');
			}

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
				options.customTags.forEach(function(fn) {
					var tag = fn( cloneDateObj(dateObj) );
					if (tag != null && tag !== '') {
						dateObj.tags.push(tag);
					}
				});
			}

			if (!theWeek || theWeek.length === 7) {
				theWeek = [ ];
				result.weeks.push(theWeek);
			}
			dateObj.rowIndex = result.weeks.length - 1;
			dateObj.colIndex = theWeek.push(dateObj) - 1;

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

		var model = t._model = t._buildModel({
			year: t._year,
			month: t._month,
			customTags: options.customTags
		});
		model.weekDayTitles = options.weekDayTitles;
		model.tableAttrs = '';
		if (options.tableAttrs) {
			base.each(options.tableAttrs, function(value, name) {
				model.tableAttrs += ' ' + name + '="' + value + '"';
			});
		}

		// 清空原有月历元素，创建新月历元素
		if (t._$table) { t._$table.remove(); }
		t._$table = $( tmpl.render('table', model) ).appendTo(options.$appendTo);

		// 点击日期事件
		t._$table.on('click', function(e) {
			e.preventDefault();

			var $self = $(this);
			t._selectDate(e, $self.parent().index(), $self.index(), $self);
		}, {
			delegator: '.ui-calendar__body__date'
		});

		/**
		 * 渲染月历时触发
		 * @event render
		 * @for Calendar
		 * @param {Object} e 事件对象
		 *   @param {Object} e.table 月历表格HTML元素
		 */
		t._trigger('render', { table: t._$table });
	},

	/**
	 * 选择某一天
	 * @method _selectDate
	 * @protected
	 * @for Calendar
	 * @param {Number|Object} source 为数字时，表示选择的日期；为对象时，表示点击事件的事件对象
	 * @param {Number} [rowIndex] 所选日期的行索引
	 * @param {Number} [colIndex] 所选日期的列索引
	 * @param {NodeList} [$td] 所选日期的单元格
	 */
	_selectDate: function(source, rowIndex, colIndex, $td) {
		var t = this, model = t._model;

		if (typeof source === 'number') {
			model.weeks.some(function(week, x) {
				return week.some(function(dateObj, y) {
					if (dateObj.date === source &&
						dateObj.month === model.month &&
						dateObj.year === model.year
					) {
						rowIndex = x;
						colIndex = y;
					}
				});
			});

			$td = t._$table.find('tbody tr').eq(rowIndex).find('td').eq(colIndex);
			source = null;
		}

		var dateObj;
		try {
			dateObj = model.weeks[rowIndex][colIndex];
		} catch (e) {

		}

		if (!dateObj) { return; }

		/**
		 * 选择月历中的某一天时触发
		 * @event dateselect
		 * @for Calendar
		 * @param {Object} e 事件对象
		 *   @param {Object} e.sourceEvent 源事件
		 *   @param {Object} e.selectedDate 被选择日期的数据对象
		 *   @param {Function} e.preventDefault 可调用此方法阻止选中
		 */
		var e = t._trigger('dateselect', {
			sourceEvent: source,
			selectedDate: cloneDateObj(dateObj)
		});

		if ( !e.isDefaultPrevented() ) {
			t._selectedDate = dateObj;
			t._$table.find('tbody td').removeClass(CLASSNAME_SELECTED);
			$td.addClass(CLASSNAME_SELECTED);
		}
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
	},

	/**
	 * 获取选中的日期
	 * @method selectedDate
	 * @for Calendar
	 * @return {Object} 获取选中的日期
	 */
	selectedDate: function() {
		return this._selectedDate ? cloneDateObj(this._selectedDate) : null;
	}
}, {
	weekDayTitles: '日一二三四五六'.split('')
});

});