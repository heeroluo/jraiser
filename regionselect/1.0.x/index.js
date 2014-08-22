/*!
 * JRaiser 2 Javascript Library
 * regionselect - v1.0.0 (2014-08-22T14:43:40+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("regionselect/1.0.x/",["dom/1.0.x/","ajax/1.1.x/","widget/1.0.x/","selectmenu/1.0.x/","tmpl/2.0.x/","scrollbar/1.0.x/","draggable/1.0.x/","uadetector/1.0.x/",null],function(e){"use strict";var n=e("base/1.0.x/"),t=(e("dom/1.0.x/"),e("ajax/1.1.x/")),c=e("widget/1.0.x/"),r=e("selectmenu/1.0.x/"),o=function(){var n,c=0,r=[];return function(o){2>c?(r.push(o),c||(t.jsonp(e.resolve("regionselect/data/1.x/provinces-and-cities").replace("-debug.js",".js"),{nocache:!1,callbackName:"jsonp_region_provincesAndCities",onsuccess:function(e){n=e,r.forEach(function(n){n.call(window,e)}),r=null,c=2}}),c=1)):o.call(window,n)}}(),i=function(){var n={},c={},r={};return function(o,i){var u=n[o]||0;if(2>u){var a=r[o]=r[o]||[];a.push(i),u||(t.jsonp(e.resolve("regionselect/data/1.x/counties-of-"+o).replace("-debug.js",".js"),{nocache:!1,callbackName:"jsonp_region_countiesOf"+o,onsuccess:function(e){c[o]=e,a.forEach(function(n){n.call(window,e)}),delete r[o],n[o]=2}}),n[o]=1)}else i.call(window,c[o])}}();return c.create(function(){},{_init:function(e){var t=this;o(function(c){t._provinceSelect=new r(n.extend(e.province,{optionItems:c.map(function(e){return{text:e.name,value:e.code}}),events:{change:function(e){delete t._currentProvince,delete t._currentCity,delete t._currentCounty;for(var n=0;n<c.length;n++)if(c[n].code==e.newValue){t._currentProvince=c[n];break}t._options.city&&t._renderCities(t._currentProvince&&t._currentProvince.cities?t._currentProvince.cities:null),t._triggerChange()}}}))})},_destroy:function(){var e=this;e._provinceSelect&&e._provinceSelect.destroy(),e._citySelect&&e._citySelect.destroy(),e._countySelect&&e._countySelect.destroy(),delete e._currentProvince,delete e._currentCity},_triggerChange:function(){var e=function(e){var n;return e&&(n={name:e.name,code:e.code},e.end&&(n.end=e.end)),n};this.trigger("change",{currentProvince:e(this._currentProvince),currentCity:e(this._currentCity),currentCounty:e(this._currentCounty)})},_renderCities:function(e){var t=this;t._citySelect&&t._citySelect.destroy(),e&&(t._citySelect=new r(n.extend(t._options.city,{optionItems:e.map(function(e){return{text:e.name,value:e.code}}),events:{change:function(e){delete t._currentCity,delete t._currentCounty;for(var n=t._currentProvince.cities,c=0;c<n.length;c++)if(n[c].code==e.newValue){t._currentCity=n[c];break}t._options.county&&(t._currentCity.end?t._renderCounties():t._renderCounties(t._currentProvince.code,t._currentCity.code)),t._triggerChange()}}}))),t._countySelect&&t._countySelect.destroy()},_renderCounties:function(e,t){var c=this;c._countySelect&&c._countySelect.destroy(),e&&t&&i(e,function(e){if(c._currentCity&&c._currentCity.code==t){var o=e[t];c._countySelect=new r(n.extend(c._options.county,{optionItems:o.map(function(e){return{text:e.name,value:e.code}}),events:{change:function(e){delete c._currentCounty;for(var n=0;n<o.length;n++)if(o[n].code==e.newValue){c._currentCounty=o[n];break}c._triggerChange()}}}))}})}})});