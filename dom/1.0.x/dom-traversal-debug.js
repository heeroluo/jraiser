/*!
 * jRaiser 2 Javascript Library
 * dom-traversal - v1.0.0 (2013-01-31T10:20:37+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供节点遍历接口
 * @module dom/1.0.x/dom-traversal
 * @catgory Infrastructure
 * @ignore
 */

var Sizzle = require('sizzle/1.9.x/');


// 根据选择器过滤节点
function filterBySelector(nodes, selector) {
	return selector ? Sizzle.matches(selector, nodes) : nodes;
}

// 按照相对位置查找节点，直到遇到符合selector的节点为止
function nodesUntil(nodes, position, selector, filter) {
	var stopNodes = Sizzle(selector), ret = [ ];

	nodes.forEach(function(node) {
		while (node = node[position]) {
			if (node.nodeType === 1) {
				if (stopNodes.indexOf(node) === -1) {
					ret.push(node);
				} else {
					break;
				}
			}
		}
	});

	Sizzle.uniqueSort(ret);
	if (position === 'parentNode') {
		ret.reverse();
	}

	return new nodes.constructor( filterBySelector(ret, filter) );
}

// 按照相对位置查找匹配指定选择器的节点
function nodesAll(nodes, position, selector, onlyFirst) {
	var ret = [ ];

	nodes.forEach(function(node) {
		while (node = node[position]) {
			if (node.nodeType === 1) {
				ret.push(node);
				if (onlyFirst) { break; }
			}
		}
	});

	return new nodes.constructor( filterBySelector(ret, selector) );
}


return {
	shortcuts: {
		/**
		 * 获取当前所有节点的子节点
		 * @method children
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		children: function(selector) {
			var ret = [ ];

			this.forEach(function(node) {
				var child = node.firstChild;
				while (child) {
					if (child.nodeType === 1) {
						ret.push(child);
					}
					child = child.nextSibling;
				}
			});

			if (ret.length > 1) {
				Sizzle.uniqueSort(ret);
			}

			return new this.constructor( filterBySelector(ret, selector) );
		},

		/**
		 * 获取当前所有节点的后一个同级节点
		 * @method next
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		next: function(selector) {
			return nodesAll(this, 'nextSibling', selector, true);
		},

		/**
		 * 获取当前所有节点后面的所有同级节点
		 * @method nextAll
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		nextAll: function(selector) {
			return nodesAll(this, 'nextSibling', selector);
		},
		
		/**
		 * 获取当前所有节点的前一个同级节点
		 * @method prev
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		prev: function(selector) {
			return nodesAll(this, 'previousSibling', selector, true);
		},

		/**
		 * 获取当前所有节点前面的所有同级节点
		 * @method prevAll
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		prevAll: function(selector) {
			return nodesAll(this, 'previousSibling', selector);
		},

		/**
		 * 获取当前所有节点的父节点
		 * @method parent
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		parent: function(selector) {
			return nodesAll(this, 'parentNode', selector, true);
		},

		/**
		 * 获取当前所有节点的所有祖先节点
		 * @method parents
		 * @for NodeList
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		parents: function(selector) {
			return nodesAll(this, 'parentNode', selector);
		},

		/**
		 * 获取当前所有节点的相邻节点
		 * @param {String} [selector] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		siblings: function(selector) {
			var nodes = this, start = 0;

			return this.parent().children(selector).filter(function(node) {
				for (var i = start; i < nodes.length; i++) {
					if (nodes[i] === node) {
						start++;
						return false;
					}
				}

				return true;
			});
		},

		/**
		 * 获取当前节点之后的同级节点，直到遇到匹配指定选择器规则的节点为止
		 * @method nextUntil
		 * @for NodeList
		 * @param {String} selector 截止选择器
		 * @param {String} [filter] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		nextUntil: function(selector, filter) {
			return nodesUntil(this, 'nextSibling', selector, filter);
		},

		/**
		 * 获取当前节点之前的同级节点，直到遇到匹配指定选择器规则的节点为止
		 * @method prevUntil
		 * @for NodeList
		 * @param {String} selector 截止选择器
		 * @param {String} [filter] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		prevUntil: function(selector, filter) {
			return nodesUntil(this, 'previousSibling', selector, filter);
		},

		/**
		 * 获取当前节点的祖先节点，直到遇到匹配指定选择器规则的节点为止
		 * @method parentsUntil
		 * @for NodeList
		 * @param {String} selector 截止选择器
		 * @param {String} [filter] 过滤结果集的选择器
		 * @return {NodeList} 结果集
		 */
		parentsUntil: function(selector, filter) {
			return nodesUntil(this, 'parentNode', selector, filter);
		}
	}
};

});