/*!
 * JRaiser 2 Javascript Library
 * calendar - v1.1.0 (2015-06-16T18:01:32+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("calendar/1.1.x/",["dom/1.1.x/","tmpl/2.1.x/","widget/1.1.x/"],function(e,t,a){"use strict";var n=e("base/1.1.x/"),s=e("dom/1.1.x/"),r=e("tmpl/2.1.x/"),o=e("widget/1.1.x/"),i=new r({table:'<table class="ui-calendar"<%-tableAttrs%>><% if (weekDayNames) { %><thead class="ui-calendar__head"><tr><% weekDayNames.forEach(function(name) { %><th class="ui-calendar__head__grid"><%=name%></span></th><% }); %></tr></thead><% } %><tbody class="ui-calendar__body"><% weeks.forEach(function(week) { %><tr><% week.forEach(function(dateObj) { %><td class="ui-calendar__body__date<% if (dateObj.tags) { %> <%=dateObj.tags.map(function(tag) { return "ui-calendar__body__date--" + tag; }).join(" ")%><% } %>""><%=dateObj.date%></td><% }); %></tr><% }); %></tbody></table>'}),d=/^([+-])(\d+)$/;return o.create({_init:function(e){var t=new Date;this.year(e.year||t.getFullYear()),this.month(e.month||t.getMonth()+1),e.customTags&&!n.isArray(e.customTags)&&(e.customTags=[e.customTags])},_destroy:function(e){e.wrapper.empty()},_buildModel:function(){var e=this._options,t=this.year(),a=this.month(),s=new Date(t,a-1,1),r=s.getDay(),o=["sun","mon","tues","wed","thur","fri","sat"],i=new Date(t,a-1,1-r).getTime();s.setMonth(a),s.setDate(0),r=s.getDay();var d,u,h,m,c=new Date(t,a-1,s.getDate()+6-r).getTime(),g={year:t,month:a,weeks:[]},l=864e5,y=new Date;for(y.setHours(0,0,0,0),y=y.getTime();c>=i;)d=new Date(i),h={year:d.getFullYear(),month:d.getMonth()+1,date:d.getDate(),day:d.getDay(),timestamp:i,tags:[]},h.tags.push("week-"+o[h.day]),h.tags.push(h.day>0&&h.day<6?"weekday":"weekend"),m=h.year<t||h.year===t&&h.month<a?"last-month":h.year>t||h.year===t&&h.month>a?"next-month":"current-month",h.tags.push(m),m=h.timestamp>y?"future":h.timestamp<y?"past":"today",h.tags.push(m),e.customTags&&n.merge(h.tags,e.customTags.map(function(e){return e(new Date(i))})),u&&7!==u.length||(u=[],g.weeks.push(u)),u.push(h),i+=l;return g},render:function(){var e=this,t=e._options;e._offDOMEvent();var a=e._buildModel({year:e._year,month:e._month,customTags:t.customTags});a.weekDayNames=t.weekDayNames,a.tableAttrs="",t.tableAttrs&&n.each(t.tableAttrs,function(e,t){a.tableAttrs+=" "+t+'="'+e+'"'});var r=s(i.render("table",a));e._onDOMEvent(r.find(".ui-calendar__body__date"),"click",function(r){r.preventDefault();var o=s(this),i=o.index(),d=o.parent().index(),u=a.weeks[d][i];e._trigger("dateselect",{sourceEvent:r,selectedDate:n.extend({dayName:t.weekDayNames[u.day]},u)})}),t.wrapper.html("").append(r),e._trigger("render",{table:r})},year:function(e){return arguments.length?void(this._year=d.test(e)?this._year+parseInt(e):parseInt(e)):this._year},month:function(e){if(!arguments.length)return this._month;var t=d.test(e)?this._month+parseInt(e):parseInt(e),a=new Date(this._year,t-1);this._year=a.getFullYear(),this._month=a.getMonth()+1}},{weekDayNames:"日一二三四五六".split("")})});