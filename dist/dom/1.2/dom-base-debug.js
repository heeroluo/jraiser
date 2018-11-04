define(function(require, exports, module) {
'use strict'; 

/**
 * 本模块提供dom模块的基础接口。
 * @module dom/1.2/dom-base
 * @catgory Infrastructure
 * @ignore
 */


/**
 * 检查指定对象是否DOM节点。
 * @method isNode
 * @param {Any} obj 指定对象。
 * @return {Boolean} 指定对象是否DOM节点。
 */
var isNode = exports.isNode = function(obj) {
	return obj != null && typeof obj.nodeType === 'number';
};

/**
 * 检查指定节点是否XML节点。
 * @method isXMLNode
 * @param {Element} node 指定节点。
 * @return {Boolean} 指定节点是否XML节点。
 */
var isXMLNode = exports.isXMLNode = function(node) {
	var docElt = (node.ownerDocument || node).documentElement;
	return docElt ? docElt.nodeName !== 'HTML' : false;
};

/**
 * 检查指定对象是否window对象。
 * @method isWindow
 * @param {Any} obj 指定对象。
 * @return {Boolean} 指定对象是否window对象。
 */
var isWindow = exports.isWindow = function(obj) {
	return obj != null && obj == obj.window;
};

/**
 * 检查指定对象是否HTML元素。
 * @method isHTMLElement
 * @param {Object} obj 指定对象。
 * @param {Boolean} [canBeDocument=false] 是否允许为document元素。
 * @return {Boolean} 指定对象是否HTML元素。
 */
exports.isHTMLElement = function(obj, canBeDocument) {
	return !isWindow(obj) && isNode(obj) && !isXMLNode(obj) &&
		(obj.nodeType === 1 || (canBeDocument && obj.nodeType === 9));
};


/**
 * 获取节点所在的window。
 * @method getWindow
 * @param {Element} node 节点。
 * @return {Object} 节点所在的window。如果不存在，则返回null。
 */
exports.getWindow = function(node) {
	return isWindow(node) ? node :
		(node.nodeType === 9 ? node.defaultView || node.parentWindow : null);
};


/**
 * 把指定字符串以一个或多个空格为分隔符分割为数组。
 * @method splitBySpace
 * @param {String|Array} val 指定字符串（如果传入数组，则不执行分割）。
 * @return {Array} 如果数组的长度为0，则返回null，否则返回数组。
 */
exports.splitBySpace = function(val) {
	if (typeof val === 'string') { val = val.split(/\s+/); }
	return val == null || val.length === 0 ? null : val;
};


/**
 * Get First, Set All 访问器。
 * @method access
 * @param {Array|ArrayLike} nodes 被访问节点集合。
 * @param {String|Object} key 键名。如果为Object类型，则对每个属性和值递归调用此函数。
 * @param {Any} [value] 值。如果为undefined，则为get first操作，否则为set all操作。
 * @param {Boolean} [isExec=false] 当value为函数时，是否执行函数并以函数返回值作为最终值。
 * @param {Object} fns 访问函数。
 *   @param {Function(first,key)} fns.get get操作函数，上下文为被访问节点集合。
 *   @param {Function(current,key,value)} fns.set set操作函数，上下文为被访问节点集合。
 * @return {Any} get first操作返回第一个节点键名对应的值；set all操作返回被访问节点集合。
 */
var access = exports.access = function(nodes, key, value, isExec, fns) {
	if (key != null && typeof key === 'object') {
		for (var k in key) {
			if (key.hasOwnProperty(k)) {
				access(nodes, k, key[k], isExec, fns);
			}
		}
		return nodes;
	}

	var len = nodes.length;

	if (value !== undefined) {
		isExec = isExec && typeof value === 'function';

		var i = -1;
		while (++i < len) {
			fns.set.call(
				nodes,
				nodes[i],
				key,
				isExec ?
					value.call(nodes[i], fns.get.call(nodes, nodes[i], key), i) :
					value
			);
		}

		return nodes;
	}

	return len ? fns.get.call(nodes, nodes[0], key) : null;
};

});