/*!
 * JRaiser 2 Javascript Library
 * dom-offset - v1.1.1 (2015-07-10T17:42:37+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供节点位置接口
 * @module dom/1.1.x/dom-offset
 * @catgory Infrastructure
 * @ignore
 */


var domBase = require('./dom-base'),
	domStyle = require('./dom-style'),
	Sizzle = require('./sizzle');


// 获取节点相对于document的位置
function getOffset(node) {
	if ( !domBase.isHTMLElement(node) ) { return { }; }

	var doc = node.ownerDocument, docElt = doc.documentElement;
	// 检查节点是否在文档中
	if ( !doc || ( node !== docElt && !Sizzle.contains(docElt, node) ) ) { return { }; }

	var box = node.getBoundingClientRect(), win = domBase.getWindow(doc);
	return {
		top: box.top + (win.pageYOffset || docElt.scrollTop) - (docElt.clientTop || 0),
		left: box.left + (win.pageXOffset || docElt.scrollLeft) - (docElt.clientLeft || 0)
	};
}

// 获取offset parent
function getOffsetParent(node) {
	if ( !domBase.isHTMLElement(node) ) { return; }

	var docElt = document.documentElement, offsetParent = node.offsetParent || docElt;
	while ( offsetParent &&
		offsetParent.nodeName !== 'HTML' &&
		domStyle.getStyle(offsetParent, 'position') === 'static'
	) {
		offsetParent = offsetParent.offsetParent;
	}
	return offsetParent || docElt;
}

// 获取节点相对于offset parent的位置
function getPosition(node) {
	if ( !domBase.isHTMLElement(node) ) { return { }; }

	var offset, parentOffset = { top: 0, left: 0 };

	if (domStyle.getStyle(node, 'position') === 'fixed') {
		offset = node.getBoundingClientRect();
	} else {
		var offsetParent = getOffsetParent(node);

		offset = getOffset(node);

		if (offsetParent.nodeName !== 'HTML') { parentOffset = getOffset(offsetParent); }

		parentOffset.top += parseFloat( domStyle.getStyle(offsetParent, 'borderTopWidth') ) || 0;
		parentOffset.left += parseFloat( domStyle.getStyle(offsetParent, 'borderLeftWidth') ) || 0;
	}

	return {
		top: offset.top - parentOffset.top - (parseFloat( domStyle.getStyle(node, 'marginTop') ) || 0),
		left: offset.left - parentOffset.left - (parseFloat( domStyle.getStyle( node, 'marginLeft') ) || 0)
	};
}


var scrollMap = {
	'scrollTop': 'pageYOffset',
	'scrollLeft': 'pageXOffset'
};

function fixScrollDirection(direction) {
	// 首字母大写，其余小写
	return 'scroll' + direction.toLowerCase().replace(/^[a-z]/, function(match) {
		return match.toUpperCase();
	});
}

/**
 * 获取指定节点内已滚动的距离
 * @method getScroll
 * @param {Element|Window} node 节点
 * @param {String} direction 方向，top或left
 * @return {Number} 已滚动的距离
 */
function getScroll(node, direction) {
	var win = domBase.getWindow(node);
	direction = fixScrollDirection(direction);

	return win && win === node ?
		(scrollMap[direction] in win ?
			win[ scrollMap[direction] ] : win.document.documentElement[direction]) :
		node[direction];
}

/**
 * 设置节点内滚动距离
 * @method setScroll
 * @param {Element|Window} node 节点
 * @param {String} direction 方向，top或left
 * @param {Number|String} val 滚动距离
 */
function setScroll(node, direction, val) {
	var win = domBase.getWindow(node);

	if ( domStyle.rRelNumber.test(val) ) {
		// 计算相对数值
		val = (getScroll(node, direction) || 0) + parseFloat(RegExp.$1 + RegExp.$2, 10);
	}

	if (win === node) {
		switch ( direction.toLowerCase() ) {
			case 'top':
				window.scrollTo( getScroll(node, 'left'), val );
				break;

			case 'left':
				window.scrollTo( val, getScroll(node, 'top') );
				break;
		}
	} else {
		node[fixScrollDirection(direction)] = val;
	}
}


return {
	// See line 88
	getScroll: getScroll,

	// See line 105
	setScroll: setScroll,

	shortcuts: {
		/**
		 * 获取当前第一个节点的offset parent
		 * @method offsetParent
		 * @for NodeList
		 * @return {Element} offset parent
		 */
		offsetParent: function() {
			var offsetParent = getOffsetParent(this[0]);
			return new this.constructor(offsetParent ? [offsetParent] : null);
		},

		/**
		 * 获取当前第一个节点相对于document的位置
		 * @method offset
		 * @for NodeList
		 * @return {Object} 位置（top、left）
		 */
		offset: function() { return getOffset(this[0]); },

		/**
		 * 获取当前第一个节点相对于offset parent的位置
		 * @method position
		 * @for NodeList
		 * @return {Object} 位置（top、left）
		 */
		position: function() { return getPosition(this[0]); },

		/**
		 * 获取当前第一个节点内的垂直滚动距离
		 * @method scrollTop
		 * @for NodeList
		 * @return {Number} 垂直滚动距离
		 */
		/**
		 * 设置当前所有节点内的垂直滚动距离
		 * @method scrollTop
		 * @for NodeList
		 * @param {Number} val 垂直滚动距离
		 * @return {NodeList} 当前节点集合
		 */
		scrollTop: function(val) {
			return domBase.access(this, 'top', val, true, {
				get: getScroll,
				set: setScroll
			});
		},

		/**
		 * 获取当前第一个节点内的横向滚动距离
		 * @method scrollLeft
		 * @for NodeList
		 * @return {Number} 横向滚动距离
		 */
		/**
		 * 设置当前所有节点内的横向滚动距离
		 * @method scrollLeft
		 * @for NodeList
		 * @param {Number} val 横向滚动距离
		 * @return {NodeList} 当前节点集合
		 */
		scrollLeft: function(val) {
			return domBase.access(this, 'left', val, true, {
				get: getScroll,
				set: setScroll
			});
		}
	}
};

});