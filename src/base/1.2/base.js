/**
 * 本模块提供最基础、最核心的接口。
 * @module base@1.2
 * @category Infrastructure
 */


/**
 * 把源对象的属性（own property）扩展到目标对象。
 * @method extend
 * @param {Any} target 目标对象。
 * @param {Any*} [source] 源对象。若有同名属性，则后者覆盖前者。
 * @return {Any} 目标对象。
 */
var extend = exports.extend = Object.assign ?
	Object.assign :
	function(target) {
		if (target == null) { throw new Error('target cannot be null'); }

		var i = 0, len = arguments.length, key, src;
		while (++i < len) {
			src = arguments[i];
			if (src != null) {
				for (key in src) {
					if (src.hasOwnProperty(key)) { target[key] = src[key]; }
				}
			}
		}

		return target;
	};


// 辅助类型判断
var toString = Object.prototype.toString;

/**
 * 检查变量是否Function类型。
 * @method isFunction
 * @param {Any} value 待测变量。
 * @return {Boolean} 待测变量是否Function类型。
 */
var isFunction = exports.isFunction = function(value) {
	return toString.call(value) === '[object Function]';
};

/**
 * 检查变量是否Date类型。
 * @method isDate
 * @param {Any} value 待测变量。
 * @return {Boolean} 待测变量是否Date类型。
 */
exports.isDate = function(value) {
	return toString.call(value) === '[object Date]';
};

/**
 * 检查变量是否Object类型。
 * @method isObject
 * @param {Any} value 待测变量。
 * @return {Boolean} 待测变量是否Object类型。
 */
exports.isObject = function(value) {
	return toString.call(value) === '[object Object]';
};

/**
 * 检查对象是否空对象（无任何own property，或者为null、undefined）。
 * @method isEmptyObject
 * @param {Object} obj 待测对象。
 * @return {Boolean} 待测对象是否空对象。
 */
exports.isEmptyObject = function(obj) {
	if (obj != null) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) { return false; }
		}
	}
	return true;
};


/**
 * 对指定对象的每个元素执行指定函数。
 * @method each
 * @param {Object|Array|ArrayLike} obj 指定对象。
 * @param {Function(value,key,obj)} callback 操作函数，上下文为当前元素。
 *   当返回值为false时，遍历中断。
 * @return {Object|Array|ArrayLike} 遍历对象。
 */
exports.each = function(obj, callback) {
	if (obj != null) {
		var i, len = obj.length;
		if (len === undefined || isFunction(obj)) {
			for (i in obj) {
				if (obj.hasOwnProperty(i) &&
					false === callback.call(obj[i], obj[i], i)
				) {
					break;
				}
			}
		} else {
			i = -1;
			while (++i < len) {
				if (false === callback.call(obj[i], obj[i], i)) {
					break;
				}
			}
		}
	}

	return obj;
};

/**
 * 把类数组转换为数组。
 * @method toArray
 * @param {Array|ArrayLike} obj 类数组。
 * @return {Array} 数组。
 */
exports.toArray = function(obj) {
	var result;
	try {
		result = Array.prototype.slice.call(obj);
	} catch (e) {
		result = [];
		var i = obj.length;
		while (i) {
			result[--i] = obj[i];
		}
	}

	return result;
};

/**
 * 把源数组的元素合并到目标数组。
 * @method mergeArray
 * @param {Array|ArrayLike} target 目标数组。
 * @param {Array|ArrayLike} source 源数组。
 * @return {Array} 目标数组。
 */
exports.mergeArray = function(target, source) {
	var len = source.length, i = target.length, j = 0;
	while (j < len) {
		target[i++] = source[j++];
	}
	target.length = i;

	return target;
};


/**
 * 生成长度为16的随机字符串（不保证一定不重复，但基本上不会重复）。
 * @method randomStr
 * @param {String} [prefix] 前缀。
 * @return {String} 生成的字符串。
 */
exports.randomStr = function(prefix) {
	var result = '';
	do {
		result += Math.random()
			.toString(36)
			.substr(2);
	} while (result.length < 10);

	result = result.substr(0, 10) + ('00000' + Math.abs(new Date)).slice(-6);

	if (prefix) { result = prefix + result; }

	return result;
};


/**
 * 创建类。
 * @method createClass
 * @param {Function} constructor 构造函数。
 * @param {Object} [methods] 方法。
 * @param {Function} [Parent] 父类。
 * @param {Function(args)|Array} [parentArgs] 传递给父类的参数，默认与子类构造函数参数一致。
 * @return {Function} 类。
 */
exports.createClass = function(constructor, methods, Parent, parentArgs) {
	var $Class = Parent ?
		function() {
			Parent.apply(
				this,
				parentArgs ?
					(typeof parentArgs === 'function' ?
						parentArgs.apply(this, arguments) :
						parentArgs
					) :
					arguments
			);
			constructor.apply(this, arguments);
		} :
		function() { constructor.apply(this, arguments); };

	if (Parent) {
		var $Parent = function() { };
		$Parent.prototype = Parent.prototype;
		$Class.prototype = new $Parent();
		$Class.prototype.constructor = $Class;

		// 复制静态方法
		extend($Class, Parent);
	}

	if (methods) {
		for (var m in methods) {
			if (methods.hasOwnProperty(m)) {
				$Class.prototype[m] = methods[m];
			}
		}
	}

	return $Class;
};