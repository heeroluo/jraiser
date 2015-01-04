/*!
 * JRaiser 2 Javascript Library
 * dom - v1.1.0 (2014-12-19T15:34:26+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供选择器查询接口以及包含大量DOM操作接口的节点集合类型
 * @module dom/1.0.x/
 * @category Infrastructure
 * @includeFor {NodeList} ./dom-attr-debug.js,
 *   ./dom-data-debug.js,
 *   ./dom-traversal-debug.js
 *   ./dom-insertion-debug.js,
 *   ./dom-style-debug.js,
 *   ./dom-offset-debug.js,
 *   ./dom-event-debug.js,
 *   ./dom-animation-debug.js
 */


var base = require('base/1.0.x/'),
	Sizzle = require('./sizzle'),
	domBase = require('./dom-base'),
	domAttr = require('./dom-attr'),
	domData = require('./dom-data'),
	domTraversal = require('./dom-traversal'),
	domIns = require('./dom-insertion'),
	domStyle = require('./dom-style'),
	domOffset = require('./dom-offset'),
	domReady = require('./dom-ready'),
	domEvent = require('./dom-event'),
	domAnimation = require('./dom-animation');


// 根据选择器以及上下文查找节点
function querySelector(selector, context) {
	if ( context != null && context.length && !domBase.isNode(context) && !domBase.isWindow(context) ) {
		// 有多个context，逐个执行selector匹配
		var i = -1, len = context.length, result = [ ];
		while (++i < len) { Sizzle(selector, context[i], result); }
		if (len > 1) { Sizzle.uniqueSort(result); }
		return result;
	} else {
		return Sizzle(selector, context);
	}
}

// 根据选择器以及上下文查找节点（对selector进行重载）
function query(selector, context) {
	var result;

	if ( typeof selector === 'string' ) {
		if (selector.charAt(0) === '<' && selector.charAt(selector.length - 1) === '>') {
			result = selector.length >= 3 ? domIns.htmlToNodes(selector, context) : [ ];
		} else {
			result = querySelector(selector, context);
		}
	} else if ( selector == null ) {
		result = [ ];
	} else if ( domBase.isNode(selector) || domBase.isWindow(selector) ) {
		result = [selector];
	} else {
		result = selector;
	}

	return result;
}


var arrProto = Array.prototype;

/**
 * 节点集合类
 * @class NodeList
 * @constructor
 * @param {Array<Element>|ArrayLike<Element>} nodes 节点数组或类数组
 */
var NodeList = base.createClass(function(nodes) {
	var i = -1, len;
	if (nodes) { len = parseInt(nodes.length); }
	if (isNaN(len) || len < 0) { len = 0; }

	while (++i < len) { this[i] = nodes[i]; }
	this.length = len;
}, {
	/**
	 * 返回指定索引的节点
	 * @method get
	 * @for NodeList
	 * @param {Number} [i=0] 索引。如果为负数，则从末尾倒数
	 * @return {Element} 指定节点
	 */
	get: function(i) {
		i = parseInt(i) || 0;
		return i < 0 ? this[this.length + i] : this[i];
	},

	/**
	 * 返回仅包含指定索引节点的NodeList对象
	 * @method eq
	 * @for NodeList
	 * @param {Number} [i=0] 索引。如果为负数，则从末尾倒数
	 * @return {NodeList} NodeList对象
	 */
	eq: function(i) {
		var node = this.get(i);
		return new this.constructor(node ? [node] : null);
	},

	/**
	 * 获取仅包含当前集合第一个节点的NodeList对象
	 * @method first
	 * @for NodeList
	 * @return {NodeList} NodeList对象
	 */
	first: function() { return this.eq(0); },

	/**
	 * 获取仅包含当前集合最后一个节点的NodeList对象
	 * @method last
	 * @for NodeList
	 * @return {NodeList} NodeList对象
	 */
	last: function() { return this.eq(-1); },

	/**
	 * 把当前集合转换为数组
	 * @method toArray
	 * @for NodeList
	 * @return {Array} 转换结果
	 */
	toArray: function() { return base.toArray(this); },

	/**
	 * 以当前集合为上下文，根据选择器匹配节点
	 * @method find
	 * @for NodeList
	 * @param {String} selector 选择器
	 * @return {NodeList} 由匹配到的节点组成的NodeList对象
	 */
	find: function(selector) {
		return new this.constructor( querySelector(selector, this) );
	},

	/**
	 * 从当前集合中过滤出符合指定规则的节点
	 * @method filter
	 * @for NodeList
	 * @param {String|Function} selector 选择器或过滤函数
	 * @return {NodeList} 由过滤出的节点组成的NodeList对象
	 */
	filter: function(selector) {
		return new this.constructor(
			typeof selector === 'function' ?
				arrProto.filter.apply(this, arguments) : Sizzle.matches(selector, this)
		);
	},

	/**
	 * 返回包含当前节点及匹配到的新节点的集合（无重复节点），参数同$函数
	 * @method add
	 * @for NodeList
	 * @return {NodeList} 包含当前节点和新节点的集合
	 */
	add: function(selector, context) {
		return new this.constructor(
			Sizzle.uniqueSort( base.merge( this.toArray(), query(selector, context) ) )
		);
	},

	/**
	 * 对当前集合进行唯一性筛选并排序
	 * @method uniqueSort
	 * @for NodeList
	 * @return {NodeList} 当前集合
	 */
	uniqueSort: function() {
		Sizzle.uniqueSort(this);
		return this;
	},

	/**
	 * 对当前集合中的每个节点执行指定函数
	 * @method each
	 * @for NodeList
	 * @param {Function} callback 操作函数。如果函数返回false，遍历中止
	 * @return {NodeList} 当前集合
	 */
	each: function(callback) {
		var i = -1, len = this.length;
		while (++i < len) {
			if ( false === callback.call(this[i], this[i], i, this) ) { break; }
		}
		return this;
	},

	// for internal use only
	sort: arrProto.sort,

	/**
	 * 返回由当前集合中指定区间的节点组成的新集合
	 * @method slice
	 * @for NodeList
	 * @param {Number} begin 开始位置
	 * @param {Number} [end] 结束位置（不包含）
	 * @return {NodeList} 新集合
	 */
	slice: function() {
		return new this.constructor( arrProto.slice.apply(this, arguments) );
	},

	/**
	 * 在当前集合中搜索节点
	 * @method indexOf
	 * @for NodeList
	 * @param {Element} node 要搜索的节点
	 * @param {Number} [fromIndex=0] 搜索的开始位置
	 * @return {Number} 节点索引
	 */
	indexOf: arrProto.indexOf,

	/**
	 * 对当前集合中的每个节点执行指定函数
	 * @method forEach
	 * @for NodeList
	 * @param {Function} callback 操作函数
	 * @param {Any} [thisArg] 操作函数中的this
	 */
	forEach: arrProto.forEach,

	/**
	 * 测试当前集合中的所有节点是否都符合指定规则
	 * @method every
	 * @for NodeList
	 * @param {Function} callback 规则函数
	 * @param {Any} [thisArg] 规则函数中的this
	 * @return {Boolean} 测试结果
	 */
	every: arrProto.every,

	/**
	 * 测试当前集合中是否有节点符合指定规则
	 * @method some
	 * @for NodeList
	 * @param {Function} callback 规则函数
	 * @param {Any} [thisArg] 规则函数中的this
	 * @return {Boolean} 测试结果
	 */
	some: arrProto.some,

	/**
	 * 通过映射关系创建一个数组
	 * @method map
	 * @for NodeList
	 * @param {Function} callback 映射函数
	 * @param {Any} [thisArg] 映射函数中的this
	 * @return {Array} 新数组
	 */
	map: arrProto.map,

	/**
	 * 移除当前集合的最后一个节点
	 * @method pop
	 * @for NodeList
	 * @return {Element} 被移出的节点
	 */
	pop: arrProto.pop,

	/**
	 * 移出当前集合的第一个节点
	 * @method shift
	 * @for NodeList
	 * @return {Element} 被移出的节点
	 */
	shift: arrProto.shift,

	/**
	 * 从当前集合中移出节点或插入节点
	 * @method splice
	 * @for NodeList
	 * @param {Number} index 操作位置
	 * @param {Number} [howMany] 移出数量。如果不指定，则移出开始位置之后的所有节点
	 * @param {Element*} [element] 向集合插入的新节点 
	 * @return {Array} 被移出的节点所组成的数组
	 */
	splice: arrProto.splice
});


function createExports(extensions, ParentNodeList) {
	var subPrototype = { };
	if (extensions) {
		if ( !base.isArray(extensions) ) { extensions = [extensions]; }
		base.extend.apply( base, [subPrototype].concat(extensions) );
	}

	// 为防止扩展方法相互覆盖冲突，创建独立的NodeList子类
	var SubNodeList = base.createClass(function() { }, subPrototype, ParentNodeList || NodeList);

	/**
	 * 根据选择器及上下文匹配节点
	 * @method $
	 * @exports
	 * @param {String} selector 选择器
	 * @param {Element|Array<Element>|ArrayLike<Element>} [context] 上下文
	 * @return {NodeList} 由匹配到的节点组成的NodeList对象
	 */
	/**
	 * 创建包含指定节点的NodeList对象
	 * @method $
	 * @exports
	 * @param {Element|Array<Element>|ArrayLike<Element>} nodes 指定节点
	 * @return {NodeList} 包含指定节点的NodeList对象
	 */
	/**
	 * 根据HTML代码创建NodeList对象
	 * @method $
	 * @exports
	 * @param {String} html HTML代码
	 * @param {Document} [ownerDocument] 节点所在文档，默认为当前页面的document
	 * @return {NodeList} 由HTML代码创建的NodeList对象
	 */
	/**
	 * 在DOMReady之后执行指定操作
	 * @method $
	 * @exports
	 * @param {Function} fn 操作函数
	 */
	var $ = function(selector, context) {
		return typeof selector === 'function' ?
			domReady(selector) : new SubNodeList( query(selector, context) );
	};

	return base.extend($, {
		NodeList: SubNodeList,

		/**
		 * 返回一套包含扩展NodeList类的模块接口
		 * @method plugin
		 * @param {Object|Array<Object>} extensions NodeList类的扩展方法
		 * @return {Function} 包含扩展NodeList类的模块接口
		 */
		plugin: function(extensions) {
			return createExports(extensions, this.NodeList);
		}
	});
}


return createExports( [
	domData,
	domTraversal,
	domAttr,
	domIns,
	domStyle,
	domOffset,
	domEvent,
	domAnimation
].map(function(module) { return module.shortcuts; }) );

});