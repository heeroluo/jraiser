/*!
 * JRaiser 2 Javascript Library
 * base - v1.0.1 (2014-05-04T09:49:45+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供最基础、最核心的接口
 * @module base/1.0.x/
 * @category Infrastructure
 */

require('es5-shim/2.3.x/');


/**
 * 把源对象的属性扩展到目标对象
 * @method extend
 * @param {Any} target 目标对象
 * @param {Any*} [source] 源对象。若有同名属性，则后者覆盖前者
 * @return {Any} 目标对象
 */
function extend(target) {
	if (target == null) { throw new Error('target cannot be null'); }

	var i = 0, len = arguments.length, p, src;
	while (++i < len) {
		src = arguments[i];
		if (src != null) {
			for (p in src) { target[p] = src[p]; }
		}
	}

	return target;
}


// 用于对比某变量的值是否undefined
var undefined;
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
 * Get First, Set All 访问器
 * @method access
 * @param {Any} elems 被访问元素集合
 * @param {String|Object} key 键名。如果为Object类型，则对每个属性和值递归调用此函数
 * @param {Any} [value] 值。如果为undefined，则为get first操作，否则为set all操作
 * @param {Boolean} [isExec=false] 当value为函数时，是否执行函数并以函数返回值作为最终值
 * @param {Object} fns get、set访问函数
 *   @param {Function(first,key)} fns.get get操作函数，上下文为被访问元素集合
 *   @param {Function(current,key,value)} fns.set set操作函数，上下文为被访问元素集合
 * @return {Any} get first操作返回第一个元素键名对应的值；set all操作返回被访问元素集合
 */
function access(elems, key, value, isExec, fns) {
	var len = elems.length, i, temp;

	if (key != null && typeof key === 'object') {
		for (var k in key) {
			access(elems, k, key[k], isExec, fns);
		}
		return elems;
	}

	if (value !== undefined) {
		isExec = isExec && isFunction(value);

		i = -1;
		while (++i < len) {
			fns.set.call(elems, elems[i], key, isExec ?
				value.call(elems[i], fns.get.call(elems, elems[i], key), i) : value);
		}

		return elems;
	}

	return len ? fns.get.call(elems, elems[0], key) : null;
}


return {
	/**
	 * 检查变量是否Array类型
	 * @method isArray
	 * @param {Any} value 待测变量
	 * @return {Boolean} 待测变量是否Array类型
	 */
	isArray: Array.isArray ||
		function(value) { return toString.call(value) === '[object Array]'; },

	// See line 44
	isFunction: isFunction,

	/**
	 * 检查变量是否Date类型
	 * @method isDate
	 * @param {Any} value 待测变量
	 * @return {Boolean} 待测变量是否Date类型
	 */
	isDate: function(value) { return toString.call(value) === '[object Date]'; },

	/**
	 * 检查变量是否Object类型
	 * @method isObject
	 * @param {Any} value 待测变量
	 * @return {Boolean} 待测变量是否Object类型
	 */
	isObject: function(value) { return toString.call(value) === '[object Object]'; },

	/**
	 * 检查对象是否空Object
	 * @method isEmptyObject
	 * @param {Object} obj 待测对象
	 * @return {Boolean} 待测对象是否空Object
	 */
	isEmptyObject: function(obj) {
		if (obj != null) {
			for (var i in obj) { return false; }
		}
		return true;
	},

	/**
	 * 检查变量是否为undefined
	 * @method isUndefined
	 * @param {Any} value 待测变量
	 * @return {Boolean} 待测变量是否为undefined
	 */
	isUndefined: function(value) { return value === undefined; },

	// See line 17
	extend: extend,

	/**
	 * 把源对象的属性扩展到目标对象。与extend相比，mix提供了更多参数
	 * @method mix
	 * @param {Any} target 目标对象
	 * @param {Any} [source] 源对象
	 * @param {Object} [opts] 参数
	 *   @param {Boolean} [opts.overwrite=true] 是否覆盖目标对象的同名属性
	 *   @param {Array<String>} [opts.whiteList] 扩展属性白名单
	 *   @param {Array<String>} [opts.blackList] 扩展属性黑名单
	 *   @param {Boolean} [opts.ignoreNull=false] 是否不扩展null值的属性
	 * @return {Any} 目标对象
	 */
	mix: function(target, source, opts) {
		if (target == null) { throw new Error('target cannot be null'); }

		if (source != null) {
			opts = opts || { };

			for (var i in source) {
				// 是否覆盖属性
				if (opts.overwrite === false && i in target) { continue; }
				// 是否忽略null值的属性
				if (opts.ignoreNull && source[i] == null) { continue; }
				// 白名单检测
				if (opts.whiteList && opts.whiteList.indexOf(i) === -1) { continue; }
				// 黑名单检测
				if (opts.blackList && opts.blackList.indexOf(i) !== -1) { continue; }

				target[i] = source[i];
			}
		}

		return target;
	},

	/**
	 * 对指定对象的每个元素执行指定函数
	 * @method each
	 * @param {Object|Array|ArrayLike} obj 目标对象
	 * @param {Function(value,key,obj)} callback 操作函数，上下文为当前元素。
	 *   当返回值为false时，遍历中断
	 * @return {Object|Array|ArrayLike} 遍历对象
	 */
	each: function(obj, callback) {
		if (obj != null) {
			var i, len = obj.length;
			if ( len === undefined || isFunction(obj) ) {
				for (i in obj) {
					if ( false === callback.call(obj[i], obj[i], i, obj) ) {
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
	},

	/**
	 * 把源数组中的元素复制到新数组中
	 * @method toArray
	 * @param {Array|ArrayLike} source 源数组
	 * @return {Array} 新数组
	 */
	toArray: function(source) {
		var result;
		try {
			result = Array.prototype.slice.call(source);
		} catch (e) {
			result = [ ];
			var i = source.length;
			while (i) {
				result[--i] = source[i];
			}
		}

		return result;
	},

	/**
	 * 创建类
	 * @method createClass
	 * @param {Function} constructor 构造函数
	 * @param {Object} [methods] 方法
	 * @param {Function} [Parent] 父类
	 * @param {Function(args)|Array} [parentArgs] 传递给父类的参数，默认与子类构造函数参数一致
	 * @return {Function} 类
	 */
	createClass: function(constructor, methods, Parent, parentArgs) {
		var $Class = Parent ? function() {
			Parent.apply(
				this,
				parentArgs ? 
					(typeof parentArgs === 'function' ?
						parentArgs.apply(this, arguments) : parentArgs)
				: arguments
			);
			constructor.apply(this, arguments);
		} : function() { constructor.apply(this, arguments); };

		if (Parent) {
			var $Parent = function() { };
			$Parent.prototype = Parent.prototype;
			$Class.prototype = new Parent();
			$Class.prototype.constructor = $Class;
		}
		if (methods) {
			for (var m in methods) { $Class.prototype[m] = methods[m]; }
		}
		return $Class;
	},

	// See line 53
	access: access,

	/**
	 * 释放全局变量
	 * @method releaseGlobalVar
	 * @param {String} name 变量名
	 */
	releaseGlobalVar: function(name) {
		try {
			delete window[name];
		} catch (e) {
			window[name] = null;
		}
	}
};

});