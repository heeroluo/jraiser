/*!
 * JRaiser 2 Javascript Library
 * dom-event-proxy - v1.0.0 (2015-07-10T15:41:02+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 记录widget中的事件监听
 * @module widget/1.1.x/dom-event-proxy
 * @category Infrastructure
 * @ignore
 */

var base = require('base/1.1.x/'), $ = require('dom/1.1.x/');


function splitToArray(str) {
	if (typeof str === 'string') { str = str.trim().split(/\s+/); }
	if (str.length) { return str; }
}


/**
 * DOM事件监听代理记录器
 * @class DOMEventProxy
 * @constructor
 */
return base.createClass(function() {
	this._init();
}, {
	_init: function() {
		// 记录元素，例如：
		// [element1, element2, ...]
		this._elementRecords = [ ];

		// 记录各元素对应（位置相对应）的事件处理函数，例如：
		// [
		// 		{
		// 			'mouseenter': ['pause'],
		// 			'mouseleave': ['play']
		// 		},
		// 		{
		// 			'mouseenter': ['pause'],
		// 			'mouseleave': ['play']
		// 		},
		// 		...
		// ]
		this._eventRecords = [ ];

		// 记录id及其对应的事件监听处理对象，例如（counter为被引用次数）：
		// {
		// 		'pause': {
		// 			id: 'pause',
		// 			counter: 2,
		// 			fn: function() { ... }
		// 		},
		// 		'play': {
		// 			id: 'play',
		// 			counter: 2,
		// 			fn: function() { ... }
		// 		},
		// 		...
		// }
		this._handlerRecords = { };
	},

	// 创建事件监听处理对象
	_createHandler: function(obj) {
		var handlerRecords = this._handlerRecords;

		switch (typeof obj) {
			case 'string':
				// 返回已有对象
				if (handlerRecords[obj]) {
					return handlerRecords[obj];
				} else {
					throw new Error('handler "' + obj + '" does not exist');
				}
				break;

			case 'function':
				obj = { fn: obj };
				break;

			default:
				obj = {
					id: obj.id,
					fn: obj.fn
				};
		}

		obj.id = obj.id || base.randomStr(); // 没有指定id，随机生成一个
		// 检查id是否重复
		if (handlerRecords[obj.id]) {
			throw new Error('handler "' + obj + '" already exists');
		}

		obj.counter = 0; // 记录此处理对象被引用的次数
		handlerRecords[obj.id] = obj;

		return obj;
	},

	/**
	 * 注册事件监听
	 * @method on
	 * @for DOMEventProxy
	 * @param {NodeList|Array} elements HTML元素
	 * @param {String|Array} types 事件类型
	 * @param {Function|Object|String} handler 事件监听函数。
	 *   为object时，该对象须有id和fn两个属性，分别为处理函数的id及监听函数；
	 *   为string时，该字符串表示已创建的处理函数的id
	 * @param {Object} options 其他选项
	 * @return {Object} 当前对象
	 */
	on: function(elements, types, handler, options) {
		var elementRecords = this._elementRecords,
			eventRecords = this._eventRecords,
			handlerObj = this._createHandler(handler);

		types = splitToArray(types);

		elements.forEach(function(element) {
			var i = elementRecords.indexOf(element), myRecords;
			if (i === -1) {
				// 不在数组中，添加记录
				i = elementRecords.push(element) - 1;
				eventRecords[i] = { };
			}
			myRecords = eventRecords[i];

			element = $(element);

			types.forEach(function(type) {
				// 记录事件类型和事件处理对象
				myRecords[type] = myRecords[type] || { };
				if (!myRecords[type][handlerObj.id]) {
					myRecords[type][handlerObj.id] = true;
					// 增加引用次数
					handlerObj.counter++;

					element.on(type, handlerObj.fn, options);
				}
			});
		});

		return this;
	},

	/**
	 * 注销事件监听
	 * @method off
	 * @for DOMEventProxy
	 * @param {NodeList|Array} elements HTML元素
	 * @param {String|Array} types 事件类型
	 * @param {String} handerId 监听函数id
	 */
	off: function(elements, types, handerId) {
		var elementRecords = this._elementRecords,
			eventRecords = this._eventRecords,
			handlerRecords = this._handlerRecords;

		if (arguments.length) {
			if (types) { types = splitToArray(types); }

			elements.forEach(function(element) {
				var i = elementRecords.indexOf(element);
				if (i !== -1) {
					element = $(element);

					base.each(eventRecords[i], function(handlerIds, type) {
						// 不是指定的类型则不处理
						if (types && types.indexOf(type) === -1) { return; }

						base.each(handlerIds, function(value, handlerId) {
							var handlerObj = handlerRecords[handlerId];

							element.off(type, handlerObj.fn);

							// 删除记录
							delete handlerIds[handlerId];
							// 如果处理对象没有被引用了，就删除它
							if (--handlerObj.counter <= 0) { delete handlerRecords[handlerId]; }
						});

						// 事件类型对应的处理函数记录为空时，删除该事件类型
						if ( base.isEmptyObject(handlerIds) ) { delete eventRecords[i][type]; }
					});

					// 事件记录为空，移除元素及其事件记录
					if ( base.isEmptyObject(eventRecords[i]) ) {
						elementRecords.splice(i, 1);
						eventRecords.splice(i, 1);
					}
				}
			});
		} else {
			// 没有参数的时候，注销所有事件监听
			elementRecords.forEach(function(element, i) {
				element = $(element);
				base.each(eventRecords[i], function(handlerIds, type) {
					base.each(handlerIds, function(value, handlerId) {
						element.off(type, handlerRecords[handlerId].fn);
					});
				});
			});
			this._init();
		}
	}
});

});