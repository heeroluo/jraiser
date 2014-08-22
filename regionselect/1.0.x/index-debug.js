/*!
 * JRaiser 2 Javascript Library
 * regionselect - v1.0.0 (2014-08-22T14:43:40+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 地区联动选择组件
 * @module regionselect/1.0.x/
 * @category Widget
 */

var base = require('base/1.0.x/'),
	$ = require('dom/1.0.x/'),
	ajax = require('ajax/1.1.x/'),
	widget = require('widget/1.0.x/'),
	SelectMenu = require('selectmenu/1.0.x/');


// 管理省市数据加载
var loadProvincesAndCities = (function() {
	var state = 0, data, callbacks = [ ];

	return function(callback) {
		if (state < 2) {
			callbacks.push(callback);
			if (!state) {
				ajax.jsonp(
					require.resolve('regionselect/data/1.x/provinces-and-cities')
						.replace('-debug.js', '.js'),
					{
						nocache: false,
						callbackName: 'jsonp_region_provincesAndCities',
						onsuccess: function(res) {
							data = res;
							callbacks.forEach(function(callback) {
								callback.call(window, res);
							});
							callbacks = null;
							state = 2;
						}
					}
				);
				state = 1;
			}
		} else {
			callback.call(window, data);
		}
	};
})();

// 管理区县数据加载
var loadCounty = (function() {
	var allStates = { }, allData = { }, allCallbacks = { };

	return function(provinceCode, callback) {
		var state = allStates[provinceCode] || 0;
		if (state < 2) {
			var callbacks = allCallbacks[provinceCode] = allCallbacks[provinceCode] || [ ];
			callbacks.push(callback);
			if (!state) {
				ajax.jsonp(
					require.resolve('regionselect/data/1.x/counties-of-' + provinceCode)
						.replace('-debug.js', '.js'),
					{
						nocache: false,
						callbackName: 'jsonp_region_countiesOf' + provinceCode,
						onsuccess: function(res) {
							allData[provinceCode] = res;
							callbacks.forEach(function(callback) {
								callback.call(window, res);
							});
							delete allCallbacks[provinceCode];
							allStates[provinceCode] = 2;
						}
					}
				);
				allStates[provinceCode] = 1;
			}
		} else {
			callback.call(window, allData[provinceCode]);
		}
	};
})();


/**
 * 地区选择组件
 * @class RegionSelect
 * @extends widget/1.0.x/{WidgetBase}
 * @constructor
 * @exports
 * @param {Object} options 组件设置
 *   @param {Object} options.province 省份选择框设置，参数同selectmenu/1.0.x/
 *   @param {Object} [options.city] 城市选择框设置，如果不指定，则不选择城市
 *   @param {Object} [options.county] 区县选择框设置，如果不指定，则不选择区县
 */
return widget.create(function() {

}, {
	_init: function(options) {
		var t = this;
		loadProvincesAndCities(function(data) {
			t._provinceSelect = new SelectMenu( base.extend(options.province, {
				optionItems: data.map(function(d) {
					return {
						text: d.name,
						value: d.code
					};
				}),
				events: {
					change: function(e) {
						// 省份改变了，先移除当前省市区记录
						delete t._currentProvince;
						delete t._currentCity;
						delete t._currentCounty;
						// 寻找更改后的省份
						for (var i = 0; i < data.length; i++) {
							if (data[i].code == e.newValue) {
								t._currentProvince = data[i];
								break;
							}
						}
						// 生成城市选择框
						if (t._options.city) {
							t._renderCities(
								t._currentProvince && t._currentProvince.cities ?
									t._currentProvince.cities : null
							);
						}

						t._triggerChange();
					}
				}
			}) );
		});
	},

	_destroy: function() {
		var t = this;

		if (t._provinceSelect) { t._provinceSelect.destroy(); }
		if (t._citySelect) { t._citySelect.destroy(); }
		if (t._countySelect) { t._countySelect.destroy(); }

		delete t._currentProvince;
		delete t._currentCity;
	},

	// 触发change事件
	_triggerChange: function() {
		var createRegionObj = function(obj) {
			var result;
			if (obj) {
				result = {
					name: obj.name,
					code: obj.code
				};
				if (obj.end) { result.end = obj.end; }
			}
			return result;
		};

		/**
		 * 省市区其中任意一个值改变时触发
		 * @event change
		 * @for SelectMenu
		 * @param {Object} e 事件参数
		 *   @param {Object} e.currentProvince 当前省份信息
		 *   @param {Object} e.currentCity 当前城市信息
		 *   @param {Object} e.currentCounty 当前区县信息
		 */
		this.trigger('change', {
			currentProvince: createRegionObj(this._currentProvince),
			currentCity: createRegionObj(this._currentCity),
			currentCounty: createRegionObj(this._currentCounty)
		});
	},

	// 渲染城市选择框
	_renderCities: function(data) {
		var t = this;
		// 先把旧的移除
		if (t._citySelect) { t._citySelect.destroy(); }

		if (data) {
			t._citySelect = new SelectMenu( base.extend(t._options.city, {
				optionItems: data.map(function(d) {
					return {
						text: d.name,
						value: d.code
					};
				}),
				events: {
					change: function(e) {
						// 城市变了，移除当前市区记录
						delete t._currentCity;
						delete t._currentCounty;
						// 寻找更改后的城市
						var cities = t._currentProvince.cities;
						for (var i = 0; i < cities.length; i++) {
							if (cities[i].code == e.newValue) {
								t._currentCity = cities[i];
								break;
							}
						}
						// 生成区县选择框
						if (t._options.county) {
							if (t._currentCity.end) {
								t._renderCounties();
							} else {
								t._renderCounties(t._currentProvince.code, t._currentCity.code);
							}
						}

						t._triggerChange();
					}
				}
			}) );
		}

		// 城市选择框重新渲染，意味着之前的区县选择框已经无效了，将其移除
		if (t._countySelect) { t._countySelect.destroy(); }
	},

	// 渲染区县选择框
	_renderCounties: function(provinceCode, cityCode) {
		var t = this;
		// 先把旧的移除
		if (t._countySelect) { t._countySelect.destroy(); }
		if (!provinceCode || !cityCode) { return; }

		loadCounty(provinceCode, function(data) {
			// 加载区县数据的过程中，更改了城市，渲染停止
			if (!t._currentCity || t._currentCity.code != cityCode) { return; }

			var counties = data[cityCode];
			t._countySelect = new SelectMenu( base.extend(t._options.county, {
				optionItems: counties.map(function(c) {
					return {
						text: c.name,
						value: c.code
					};
				}),
				events: {
					change: function(e) {
						delete t._currentCounty;
						for (var i = 0; i < counties.length; i++) {
							if (counties[i].code == e.newValue) {
								t._currentCounty = counties[i];
								break;
							}
						}

						t._triggerChange();
					}
				}
			}) );
		});
	}
});

});