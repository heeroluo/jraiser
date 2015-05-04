/*!
 * JRaiser 2 Javascript Library
 * base - v1.1.0 (2015-05-04T11:44:03+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供最基础、最核心的接口
 * @module base/1.1.x/
 * @category Infrastructure
 */


/**
 * 把源对象自身的属性（Own Property）扩展到目标对象
 * @method extend
 * @param {Any} target 目标对象
 * @param {Any*} [source] 源对象。若有同名属性，则后者覆盖前者
 * @return {Any} 目标对象
 */
function extend(target) {
	if (target == null) { throw new Error('target cannot be null'); }

	var i = 0, len = arguments.length, key, src;
	while (++i < len) {
		src = arguments[i];
		if (src != null) {
			for (key in src) {
				if ( src.hasOwnProperty(key) ) { target[key] = src[key]; }
			}
		}
	}

	return target;
}


// 扩展过滤器
var extendFilters = {
	// 是否覆盖属性
	overwrite: function(ref) {
		return function(key, src, target) {
			return ref ? true : !(key in target);
		};
	},

	// 是否忽略null和undefined
	ignoreNull: function(ref) {
		return function(key, src) {
			return ref ? src[key] != null : true
		};
	},

	// 是否仅扩展对象自身的属性
	onlyOwnProperty: function(ref) {
		return function(key, src) {
			return ref ? src.hasOwnProperty(key) : true
		};
	},

	// 扩展白名单
	whiteList: function(list) {
		return function(key) {
			return list.indexOf(key) !== -1;
		};
	},

	// 扩展黑名单
	blackList: function(list) {
		return function(key) {
			return list.indexOf(key) === -1;
		};
	}
};

/**
 * 把源对象的属性扩展到目标对象。与extend相比，customExtend提供了更多选项，但不支持多个源对象
 * @method customExtend
 * @param {Any} target 目标对象
 * @param {Any} src 源对象
 * @param {Object*} [options] 选项
 *   @param {Boolean} [options.overwrite=true] 是否覆盖目标对象的同名属性
 *   @param {Array<String>} [options.whiteList] 扩展属性白名单
 *   @param {Array<String>} [options.blackList] 扩展属性黑名单
 *   @param {Boolean} [options.ignoreNull=false] 是否忽略源对象中值为null或undefined的属性
 *   @param {Boolean} [options.onlyOwnProperty=false] 是否仅扩展源对象自身的属性
 * @param {Function(key, src, target)*} [filter] 过滤函数。返回false时表示该属性不被扩展
 * @return {Any} 目标对象
 */
function customExtend(target, src) {
	if (target == null) { throw new Error('target cannot be null'); }
	if (src == null) { return target; }

	var filters = [ ], i, key, temp;
	// 第1个参数之后为选项或过滤函数
	for (i = 2; i < arguments.length; i++) {
		temp = arguments[i];
		switch (typeof temp) {
			case 'object':
				for (key in temp) {
					if ( extendFilters.hasOwnProperty(key) ) {
						filters.push( extendFilters[key](temp[key]) );
					}
				}
				break;

			case 'function':
				filters.push(temp);
				break;
		}
	}

	for (key in src) {
		temp = true;
		for (i = 0; i < filters.length; i++) {
			// 返回false表示属性不被扩展
			if (filters[i].call(window, key, src, target) === false) {
				temp = false;
				break;
			}
		}
		if (temp) { target[key] = src[key]; }
	}

	return target;
}


var undefined;
/**
 * 检查变量的值是否为undefined
 * @method isUndefined
 * @param {Any} value 待测变量
 * @return {Boolean} 待测变量是否为undefined
 */
function isUndefined(value) { return value === undefined; }

// 用于基本类型判断
var toString = Object.prototype.toString;

/**
 * 检查变量是否Function类型
 * @method isFunction
 * @param {Any} value 待测变量
 * @return {Boolean} 待测变量是否Function类型
 */
function isFunction(value) { return toString.call(value) === '[object Function]'; }

/**
 * 检查变量是否Date类型
 * @method isDate
 * @param {Any} value 待测变量
 * @return {Boolean} 待测变量是否Date类型
 */
function isDate(value) { return toString.call(value) === '[object Date]'; }

/**
 * 检查变量是否Object类型
 * @method isObject
 * @param {Any} value 待测变量
 * @return {Boolean} 待测变量是否Object类型
 */
function isObject(value) { return toString.call(value) === '[object Object]'; }

/**
 * 检查变量是否Array类型
 * @method isArray
 * @param {Any} value 待测变量
 * @return {Boolean} 待测变量是否Array类型
 */
var isArray = Array.isArray ||
	function(value) { return toString.call(value) === '[object Array]'; };

/**
 * 检查对象是否空Object
 * @method isEmptyObject
 * @param {Object} obj 待测对象
 * @return {Boolean} 待测对象是否空Object
 */
function isEmptyObject(obj) {
	if (obj != null) {
		for (var key in obj) {
			if ( obj.hasOwnProperty(key) ) { return false; }
		}
	}
	return true;
}


/**
 * 对指定对象的每个元素执行指定函数
 * @method each
 * @param {Object|Array|ArrayLike} obj 目标对象
 * @param {Function(value,key,obj)} callback 操作函数，上下文为当前元素。
 *   当返回值为false时，遍历中断
 * @return {Object|Array|ArrayLike} 遍历对象
 */
function each(obj, callback) {
	if (obj != null) {
		var i, len = obj.length;
		if ( len === undefined || isFunction(obj) ) {
			for (i in obj) {
				if ( obj.hasOwnProperty(i) && false === callback.call(obj[i], obj[i], i, obj) ) {
					break;
				}
			}
		} else {
			i = -1;
			while (++i < len) {
				if ( false === callback.call(obj[i], obj[i], i, obj) ) {
					break;
				}
			}
		}
	}

	return obj;
}


/**
 * 把对象转换为数组
 * @method toArray
 * @param {Array|ArrayLike} obj 对象
 * @return {Array} 数组
 */
function toArray(obj) {
	var result;
	try {
		result = Array.prototype.slice.call(obj);
	} catch (e) {
		result = [ ];
		var i = obj.length;
		while (i) {
			result[--i] = obj[i];
		}
	}

	return result;
}

/**
 * 把数组二的元素合并到数组一
 * @method merge
 * @param {Array} first 数组一
 * @param {Array} second 数组二
 * @return {Array} 合并后的数组一
 */
function merge(first, second) {
	var len = second.length, j = 0, i = first.length;
	while (j < len) {
		first[i++] = second[j++];
	}
	first.length = i;

	return first;
}


/**
 * 返回一个新函数，使目标函数只执行一次
 * @method once
 * @param {Function} fn 目标函数
 * @return {Function} 新函数
 */
function once(fn) {
	var returnValue;
	return function() {
		if (fn) {
			returnValue = fn.apply(this, arguments);
			fn = null;
		}
		return returnValue;
	};
}


/**
 * 生成长度为16的随机字符串（不保证一定不重复，但基本上不会重复）
 * @method randomStr
 * @param {String} [prefix] 前缀
 * @return {String} 生成的字符串
 */
function randomStr(prefix) {
	var result = '';
	do {
		result += Math.random().toString(36).substr(2);
	} while (result.length < 10);

	result = result.substr(0, 10) + ( '00000' + Math.abs(new Date) ).slice(-6);

	if (prefix) { result = prefix + result; }

	return result;
}


/**
 * 移除全局变量
 * @method deleteGlobalVar
 * @param {String} name 变量名
 */
function deleteGlobalVar(name) {
	try {
		delete window[name];
	} catch (e) {
		window[name] = null;
	}
}


/**
 * 创建类
 * @method createClass
 * @param {Function} constructor 构造函数
 * @param {Object} [methods] 方法
 * @param {Function} [Parent] 父类
 * @param {Function(args)|Array} [parentArgs] 传递给父类的参数，默认与子类构造函数参数一致
 * @return {Function} 类
 */
function createClass(constructor, methods, Parent, parentArgs) {
	var $Class = Parent ? function() {
		Parent.apply(
			this,
			parentArgs ?
				(typeof parentArgs === 'function' ? parentArgs.apply(this, arguments) : parentArgs) :
				arguments
		);
		constructor.apply(this, arguments);
	} : function() { constructor.apply(this, arguments); };

	if (Parent) {
		var $Parent = function() { };
		$Parent.prototype = Parent.prototype;
		$Class.prototype = new $Parent();
		$Class.prototype.constructor = $Class;
	}

	if (methods) {
		for (var m in methods) {
			if ( methods.hasOwnProperty(m) ) {
				$Class.prototype[m] = methods[m];
			}
		}
	}

	return $Class;
}


return {
	extend: extend,
	customExtend: customExtend,
	isUndefined: isUndefined,
	isFunction: isFunction,
	isDate: isDate,
	isObject: isObject,
	isArray: isArray,
	isEmptyObject: isEmptyObject,
	each: each,
	toArray: toArray,
	merge: merge,
	once: once,
	randomStr: randomStr,
	deleteGlobalVar: deleteGlobalVar,
	createClass: createClass
};

});