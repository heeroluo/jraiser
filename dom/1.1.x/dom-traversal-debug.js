/*!
 * JRaiser 2 Javascript Library
 * dom-traversal - v1.1.0 (2014-10-10T10:01:16+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供节点遍历、搜索接口
 * @module dom/1.1.x/dom-traversal
 * @catgory Infrastructure
 * @ignore
 */


var base = require('base/1.0.x/'),
	domBase = require('./dom-base'),
	Sizzle = require('./sizzle');


/**
 * 获取当前上下文及其所有后代节点
 * @method selfAndDescendants
 * @param {Element|Document|DocumentFragment} context 当前上下文
 * @return {Array} 当前上下文及其所有后代节点
 */
function selfAndDescendants(context) {
	if ( !context || !domBase.isNode(context) ) { return; }

	if (context.nodeType !== 1 && context.nodeType !== 9 && context.nodeType !== 11) { return [context]; }

	var result = [context], subResult;
	if (context.getElementsByTagName) {
		subResult = context.getElementsByTagName('*');
	} else if (context.querySelectorAll) {
		// 文档碎片不支持getElementsByTagName，但支持querySelectorAll(IE8+)
		subResult = context.querySelectorAll('*');
	}

	if (subResult) {
		base.merge(result, subResult);
	} else {
		subResult = context.childNodes;
		if (subResult) {
			var len = subResult.length, i = -1, subAll;
			while (++i < len) {
				subAll = selfAndDescendants(subResult[i]);
				if (subAll) { base.merge(result, subAll); }
			}
		}
	}

	return result;
}


// 过滤节点
function filterBySelector(nodes, NodeList, selector) {
	return new NodeList(selector ? Sizzle.matches(selector, nodes) : nodes);
}

// 排序、过滤节点
function sortAndFilter(nodes, position, NodeList, selector) {
	Sizzle.uniqueSort(nodes);
	if (position === 'parentNode' || position === 'previousSibling') { nodes.reverse(); }

	return filterBySelector(nodes, NodeList, selector);
}

// 按照相对位置查找节点，直到遇到符合特定规则的节点为止
function findNodesUntil(nodes, position, until, filter) {
	if (typeof until === 'string') {
		until = Sizzle(until);
	} else if ( domBase.isNode(until) ) {
		until = [until];
	}

	var result = [ ];
	nodes.forEach(function(node) {
		while (node = node[position]) {
			if (node.nodeType === 1 || node.nodeType === 9) {
				if (!until || until.indexOf(node) === -1) {
					result.push(node);
				} else {
					break;
				}
			}
		}
	});

	return sortAndFilter(result, position, nodes.constructor, filter);
}

// 按照相对位置查找节点，并通过特定选择器规则进行过滤
function findNodes(nodes, position, filter, onlyFirst) {
	var result = [ ];
	nodes.forEach(function(node) {
		while (node = node[position]) {
			if (node.nodeType === 1 || node.nodeType === 9) {
				result.push(node);
				if (onlyFirst) { break; }
			}
		}
	});

	return sortAndFilter(result, position, nodes.constructor, filter);
}


return {
	// See line 21
	selfAndDescendants: selfAndDescendants,

	shortcuts: {
		/**
		 * 获取当前集合第一个节点在同级节点中的位置
		 * @method index
		 * @for NodeList
		 * @return {Number} 节点位置
		 */
		/**
		 * 获取当前集合第一个节点在指定选择器匹配的节点集合中的位置
		 * @method index
		 * @for NodeList
		 * @param {String} selector 选择器
		 * @return {Number} 节点位置
		 */
		/**
		 * 获取指定节点在当前集合中的位置
		 * @method index
		 * @for NodeList
		 * @param {NodeList|Element|Array} node 指定节点
		 * @return {Number} 节点位置
		 */
		index: function(selector) {
			var first = this.get(0),
				result = -1,
				isValidNode = domBase.isNode(first) && !!first.parentNode;

			if (first) {
				if (selector == null) {
					if (isValidNode) {
						// 计算在同级节点中的位置
						var sibling = first;
						result = 0;
						while (sibling = sibling.previousSibling) {
							// 不计算文本节点等特殊节点
							if (sibling.nodeType === 1) { result++; }
						}
					}
				} else if (typeof selector === 'string') {
					if (isValidNode) {
						// 当前集合第一个节点在指定选择器匹配出的节点集合中的位置
						result = Sizzle(selector).indexOf(first);
					}
				} else {
					// 指定节点在当前集合中的位置
					result = this.indexOf(domBase.isNode(selector) ? selector : selector[0]);
				}
			}

			return result;
		},

		/**
		 * 获取当前所有节点的子节点
		 * @method children
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		children: function(selector) {
			var result = [ ];

			this.forEach(function(node) {
				var child = node.firstChild;
				while (child) {
					if (child.nodeType === 1) { result.push(child); }
					child = child.nextSibling;
				}
			});

			if (this.length > 1) { Sizzle.uniqueSort(result); }

			return filterBySelector(result, this.constructor, selector);
		},

		/**
		 * 获取当前所有节点的后一个同级节点
		 * @method next
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		next: function(selector) { return findNodes(this, 'nextSibling', selector, true); },

		/**
		 * 获取当前所有节点后面的所有同级节点
		 * @method nextAll
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		nextAll: function(selector) { return findNodes(this, 'nextSibling', selector); },

		/**
		 * 获取当前所有节点的前一个同级节点
		 * @method prev
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		prev: function(selector) { return findNodes(this, 'previousSibling', selector, true); },

		/**
		 * 获取当前所有节点前面的所有同级节点
		 * @method prevAll
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		prevAll: function(selector) { return findNodes(this, 'previousSibling', selector); },

		/**
		 * 获取当前所有节点的父节点
		 * @method parent
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		parent: function(selector) { return findNodes(this, 'parentNode', selector, true); },

		/**
		 * 获取当前所有节点的所有祖先节点
		 * @method parents
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		parents: function(selector) { return findNodes(this, 'parentNode', selector); },

		/**
		 * 获取当前所有节点的所有同级节点
		 * @method siblings
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		siblings: function(selector) {
			var result = [ ];

			this.forEach(function(node) {
				var sibling = node;
				while (sibling = sibling.previousSibling) {
					if (sibling.nodeType === 1) { result.push(sibling); }
				}
				sibling = node;
				while (sibling = sibling.nextSibling) {
					if (sibling.nodeType === 1) { result.push(sibling); }
				}
			});

			Sizzle.uniqueSort(result);

			return filterBySelector(result, this.constructor, selector);
		},

		/**
		 * 获取当前节点之后的同级节点，直到遇到符合指定选择器规则的节点为止
		 * @method nextUntil
		 * @for NodeList
		 * @param {String|Element|Array<Element>} until 截止规则或节点
		 * @param {String} [filter] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		nextUntil: function(until, filter) {
			return findNodesUntil(this, 'nextSibling', until, filter);
		},

		/**
		 * 获取当前节点之前的同级节点，直到遇到符合指定选择器规则的节点为止
		 * @method prevUntil
		 * @for NodeList
		 * @param {String|Element|Array<Element>} until 截止规则或节点
		 * @param {String} [filter] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		prevUntil: function(until, filter) {
			return findNodesUntil(this, 'previousSibling', until, filter);
		},

		/**
		 * 获取当前节点的祖先节点，直到遇到符合指定选择器规则的节点为止
		 * @method parentsUntil
		 * @for NodeList
		 * @param {String|Element|Array<Element>} until 截止规则或节点
		 * @param {String} [filter] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		parentsUntil: function(until, filter) {
			return findNodesUntil(this, 'parentNode', until, filter);
		}
	}
};

});