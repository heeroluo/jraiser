/*!
 * JRaiser 2 Javascript Library
 * dom-insertion - v1.1.0 (2014-11-24T10:04:32+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供创建、插入节点的相关接口
 * @module dom/1.1.x/dom-insertion
 * @catgory Infrastructure
 * @ignore
 */


var base = require('base/1.0.x/'),
	Sizzle = require('./sizzle'),
	domBase = require('./dom-base'),
	domData = require('./dom-data'),
	domTraversal = require('./dom-traversal');


/**
 * 根据HTML创建节点
 * @method htmlToNodes
 * @param {String} html HTML代码
 * @param {Document} [ownerDocument] 所属文档对象，默认为当前文档对象
 * @return {Array<Element>} 节点数组
 */
function htmlToNodes(html, ownerDocument) {
	ownerDocument = ownerDocument || document;
	var div = ownerDocument.createElement('div'), frag = ownerDocument.createDocumentFragment();

	div.innerHTML = html;
	while (div.firstChild) { frag.appendChild(div.firstChild); }
	div = null;

	return base.toArray(frag.childNodes);
}

// 创建包含指定节点的文档片段
function buildFragment(nodes, ownerDocument) {
	var len = nodes.length;
	if (len) {
		var frag = (ownerDocument || document).createDocumentFragment(), i = -1;
		while (++i < len) {
			if ( domBase.isNode(nodes[i]) ) { frag.appendChild(nodes[i]); }
		}
		return frag;
	}
}

// 如果有多个节点，返回包含这几个节点的文档片段
// 如果只有一个节点，则返回此节点
// 如果没有节点，返回null
function parseNodes(target, ownerDocument) {	
	if ( !target || domBase.isNode(target) ) { return target; }

	if (typeof target === 'string') { target = htmlToNodes(target); }
	if (target.length === 1) {
		if ( domBase.isNode(target[0]) ) { return target[0]; }
	} else {
		return buildFragment(target, ownerDocument);
	}
}


// 克隆节点
function cloneNode(node, withData, deepWithData) {
	var node2 = node.cloneNode(true);

	if (withData) {
		if (deepWithData) {
			var all = domTraversal.selfAndDescendants(node);
			if (all) {
				var all2 = domTraversal.selfAndDescendants(node2);
				// 遍历当前节点及其所有后代节点，克隆数据
				for (var i = all.length - 1; i >= 0; i--) {
					// 移除复制过来的节点id
					domData.removeUniqueId(all2[i]);
					// 克隆当前节点及其后代节点的数据
					domData.cloneAll(all2[i], all[i]);
				}
			}
		} else {
			// 移除复制过来的节点id
			domData.removeUniqueId(node2);
			// 只克隆当前节点数据
			domData.cloneAll(node2, node);
		}
	}

	return node2;
}

// 把目标节点插入为父节点的最后一个子节点
function appendChild(target, parent) { return parent.appendChild(target); }

// 把目标节点插入为参考节点的第一个子节点
function prependChild(target, parent) {
	var firstChild = parent.firstChild;
	if (firstChild) {
		parent.insertBefore(target, firstChild);
	} else {
		parent.appendChild(target);
	}
	return target;
}

// 在参考节点之前插入目标节点
function insertBefore(target, ref) { return ref.parentNode.insertBefore(target, ref); }

// 在参考节点之后插入目标节点
function insertAfter(target, ref) {
	var nextSibling = ref.nextSibling;
	if (nextSibling) {
		ref.parentNode.insertBefore(target, nextSibling);
	} else {
		ref.parentNode.appendChild(target);
	}
	return target;
}

// 把参考节点替换成目标节点
function replaceWith(target, ref) {
	domData.clearAll(ref);
	return ref.parentNode.replaceChild(target, ref);
}


// 统一插入节点操作流程
function insert(target, ref, fn, condition) {
	var i = -1, len = ref.length;
	if (len) {
		target = parseNodes(target);
		if (target) {
			while (++i < len) {
				if (!condition || condition.call(this, ref[i]) !== false) {
					fn.call(
						this,
						i === len - 1 ? target : cloneNode(target, true, true), ref[i]
					);
				}
			}
		}
	}

	return ref;
}

// 统一插入当前节点操作流程
function insertTo(target, ref, fn, condition) {
	var result = [ ];

	if (typeof ref === 'string') {
		ref = Sizzle(ref);
	} else if ( ref == null || domBase.isWindow(ref) ) {
		return result;
	} else if ( domBase.isNode(ref) ) {
		ref = [ref];
	} else {
		ref = base.toArray(ref);
	}

	var len = ref.length;
	if (len) {
		target = buildFragment(target);
		if (target) {
			var myTarget, i = -1;
			while (++i < len) {
				if (!condition || condition.call(this, ref[i]) !== false) {
					myTarget = i === len - 1 ? target : cloneNode(target, true, true);
					base.merge(result, myTarget.childNodes);
					fn.call(this, myTarget, ref[i]);
				}
			}
		}
	}

	return Sizzle.uniqueSort(result);
}


// 是否有父节点
function hasParent(node) { return node.parentNode != null }
// 是否可以有子节点
function canHasChild(node) { return node.nodeType === 1 || node.nodeType === 11; }


return {
	// See line 23
	htmlToNodes: htmlToNodes,

	shortcuts: {
		/**
		 * 在当前所有节点的最后一个子节点后插入目标节点（或其副本）
		 * @method append
		 * @for NodeList
		 * @param {String|Element|ArrayLike<Element>|DocumentFragment} target 目标节点
		 * @return {NodeList} 当前节点集合
		 */
		append: function(target) { return insert(target, this, appendChild, canHasChild); },

		/**
		 * 在目标节点的最后一个子节点后插入当前所有节点（或其副本）
		 * @method appendTo
		 * @for NodeList
		 * @param {String|Element|ArrayLike<Element>|DocumentFragment} target 目标节点
		 * @return {NodeList} 由被插入的节点组成的节点集合
		 */
		appendTo: function(target) {
			return new this.constructor( insertTo(this, target, appendChild, canHasChild) );
		},

		/**
		 * 在当前所有节点的第一个子节点前插入目标节点（或其副本）
		 * @method prepend
		 * @for NodeList
		 * @param {String|Element|ArrayLike<Element>|DocumentFragment} target 目标节点
		 * @return {NodeList} 当前节点集合
		 */
		prepend: function(target) { return insert(target, this, prependChild, canHasChild); },

		/**
		 * 在目标节点的第一个子节点前插入当前所有节点（或其副本）
		 * @method prependTo
		 * @for NodeList
		 * @param {String|Element|ArrayLike<Element>|DocumentFragment} target 目标节点
		 * @return {NodeList} 由被插入的节点组成的节点集合
		 */
		prependTo: function(target) {
			return new this.constructor( insertTo(this, target, prependChild, canHasChild) );
		},

		/**
		 * 在当前所有节点之前插入目标节点（或其副本）
		 * @method before
		 * @for NodeList
		 * @param {String|Element|ArrayLike<Element>|DocumentFragment} target 目标节点
		 * @return {NodeList} 当前节点集合
		 */
		before: function(target) { return insert(target, this, insertBefore, hasParent); },

		/**
		 * 把当前节点插入到目标节点之前
		 * @method insertBefore
		 * @for NodeList
		 * @param {String|Element|ArrayLike<Element>|DocumentFragment} target 目标节点
		 * @return {NodeList} 由被插入的节点组成的节点集合
		 */
		insertBefore: function(target) {
			return new this.constructor( insertTo(this, target, insertBefore, hasParent) );
		},

		/**
		 * 在当前所有节点之后插入目标节点（或其副本）
		 * @method after
		 * @for NodeList
		 * @param {String|Element|ArrayLike<Element>|DocumentFragment} target 目标节点
		 * @return {NodeList} 当前节点集合
		 */
		after: function(target) { return insert(target, this, insertAfter, hasParent); },

		/**
		 * 把当前节点（或其副本）插入到目标节点之后
		 * @method insertAfter
		 * @for NodeList
		 * @param {String|Element|ArrayLike<Element>|DocumentFragment} target 目标节点
		 * @return {NodeList} 由被插入的节点组成的节点集合
		 */
		insertAfter: function(target) {
			return new this.constructor( insertTo(this, target, insertAfter, hasParent) );
		},

		/**
		 * 把当前节点替换为目标节点（或其副本）
		 * @method replaceWith
		 * @for NodeList
		 * @param {String|Element|ArrayLike<Element>|DocumentFragment} target 目标节点
		 * @return {NodeList} 当前节点集合
		 */
		replaceWith: function(target) { return insert(target, this, replaceWith, hasParent); },

		/**
		 * 把目标节点替换为当前节点（或其副本）
		 * @method replaceAll
		 * @for NodeList
		 * @param {String|Element|ArrayLike<Element>|DocumentFragment} target 目标节点
		 * @return {NodeList} 由替换后的节点组成的节点集合
		 */
		replaceAll: function(target) {
			return new this.constructor( insertTo(this, target, replaceWith, hasParent) );
		},

		/**
		 * 把当前所有节点从其所属文档中移除（保留数据）
		 * @method detach
		 * @for NodeList
		 * @return {NodeList} 当前节点集合
		 */
		detach: function() {
			this.forEach(function(node) { node.parentNode.removeChild(node); });
			return this;
		},

		/**
		 * 把当前所有节点从其所属文档中移除（清除数据）
		 * @method remove
		 * @for NodeList
		 * @return {NodeList} 当前节点集合
		 */
		remove: function() {
			this.forEach(function(node) {
				var nodes = domTraversal.selfAndDescendants(node);
				if (nodes) {
					for (var i = nodes.length - 1; i >= 0; i--) {
						domData.clearAll(nodes[i]);
					}
					nodes = null;
				}
				if (node.parentNode) { node.parentNode.removeChild(node); }
			});

			return this;
		},

		/**
		 * 移除当前所有节点下的所有后代节点
		 * @method empty
		 * @for NodeList
		 * @return {NodeList} 当前节点集合
		 */
		empty: function() {
			this.forEach(function(node) {
				var nodes = domTraversal.selfAndDescendants(node);
				if (nodes) {
					// 仅清除后代节点的数据，不清除当前节点的数据
					for (var i = nodes.length - 1; i >= 1; i--) {
						domData.clearAll(nodes[i]);
					}
				}
				nodes = null;

				while (node.firstChild) { node.removeChild(node.firstChild); }

				// from jQuery:
				//   If this is a select, ensure that it displays empty (#12336)
				//   Support: IE<9
				if (node.options && node.nodeName ===  'SELECT') { node.options.length = 0; }
			});

			return this;
		},

		/**
		 * 返回由当前所有节点的副本所组成的节点集合
		 * @for NodeList
		 * @param {Boolean} [withData=false] 是否克隆节点数据
		 * @param {Boolean} [deepWithData=false] 是否克隆后代节点数据
		 * @return {NodeList} 由当前所有节点的副本所组成的节点集合
		 */
		clone: function(withData, deepWithData) {
			var copy = [ ];
			this.forEach(function(node, i) {
				copy[i] = cloneNode(node, withData, deepWithData);
			});

			return new this.constructor(copy);
		}
	}
};

});