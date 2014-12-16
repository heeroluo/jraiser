/*!
 * JRaiser 2 Javascript Library
 * dom-style - v1.1.0 (2014-12-08T11:19:20+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供节点样式操作接口
 * @module dom/1.1.x/dom-style
 * @catgory Infrastructure
 * @ignore
 */


var domBase = require('./dom-base');


// 匹配相对数字，如 +=10
var rRelNumber = /^([+-])=(\d+(?:\.\d+)?)$/;


var testNode = document.documentElement;

// 样式名修复
var cssProps = {
	'float': 'cssFloat' in testNode.style ? 'cssFloat' : 'styleFloat'
};

// 特殊样式访问
var cssHooks = { };
if ( !('opacity' in testNode.style) ) {
	var re_opacity = /opacity\s*=\s*([^)]*)/, re_alpha = /alpha\([^)]*\)/i;

	// 获取/设置透明度，Only For IE<9
	cssHooks.opacity = {
		get: function(node) {
			return re_opacity.test(node.currentStyle.filter || '') ?
				Number(RegExp.$1) / 100 + '' : '1';
		},
		set: function(node, value) {
			var filter = node.currentStyle.filter || '', style = node.style;
			value = parseFloat(value);

			style.zoom = 1;
			if ( (isNaN(value) || value >= 1) && filter.replace(re_alpha, '').trim() === '' ) {
				style.removeAttribute('filter');
			} else {
				var opacity = 'alpha(opacity=' + Math.min(1, value) * 100 + ')';
				style.filter = re_alpha.test(filter) ?
					filter.replace(re_alpha, opacity) : filter + ' ' + opacity;
			}
		}
	};
}

var cssPrefixes = ['O', 'Moz', 'ms', 'Webkit'];
// 返回带厂商前缀的样式名
function vendorPropName(name) {
	if (name in testNode.style) { return name; }

	var capName = name.charAt(0).toUpperCase() + name.slice(1), tryName;
	for (var i = cssPrefixes.length - 1; i >= 0; i--) {
		tryName = cssPrefixes[i] + capName;
		if (tryName in testNode.style) { return tryName; }
	}

	return name;
}

var rDash = /-([a-z])/g;
// 返回正确的样式名或特殊操作钩子
function fixStyleName(name) {
	// 转换成js样式属性名，例如 font-weight -> fontWeight
	var origName = name.replace(rDash, function(match, $1) { return $1.toUpperCase(); });

	name = cssProps[origName] || ( cssProps[origName] = vendorPropName(origName) );

	return cssHooks[name] || cssHooks[origName] || name;
}

// 不以px为单位的数值样式
var cssNumber = {
	columnCount: true,
	fillOpacity: true,
	flexGrow: true,
	flexShrink: true,
	fontWeight: true,
	lineHeight: true,
	opacity: true,
	order: true,
	orphans: true,
	widows: true,
	zIndex: true,
	zoom: true
};
// 修复样式值
function fixStyleValue(name, val) {
	// 数字默认加上px单位（如果该样式能以px为单位）
	return cssNumber[name] || '' === val || isNaN(val) ? val : val + 'px';
}

// 获取当前样式
var getCurrentStyle = 'getComputedStyle' in window ? function(node, name) {
	return node.ownerDocument.defaultView.getComputedStyle(node, null)[name] || '';
} : function(node, name) {
	return (node.currentStyle[name] || '').toLowerCase();
};

/**
 * 获取节点样式
 * @method getStyle
 * @param {Element} node 节点
 * @param {String} name 样式名
 * @return {String} 样式值
 */
function getStyle(node, name) {
	if ( !name || !domBase.isHTMLElement(node) ) { return; }

	name = fixStyleName(name);
	if (name.get) {
		return name.get(node);
	} else if (name in node.style) {
		return getCurrentStyle(node, name);
	}
}

/**
 * 设置节点样式
 * @method setStyle
 * @param {Element} node 节点
 * @param {String} name 样式名
 * @param {String|Number} val 样式值
 */
function setStyle(node, name, val) {
	if ( !name || !domBase.isHTMLElement(node) ) { return; }

	// 计算相对值，例如 +=5
	if ( rRelNumber.test(val) ) {
		val = (parseFloat(getStyle(node, name), 10) || 0) + parseFloat(RegExp.$1 + RegExp.$2, 10);
	}

	name = fixStyleName(name);
	val = fixStyleValue(name, val);

	if (name.set) {
		name.set(node, val);
	} else if (name in node.style) {
		node.style[name] = val;
	}
}


// 检查是否包含以空格隔开的子字符串
function hasString(value, input) {
	var i = value.indexOf(input);
	return i != -1 &&
		(value.charCodeAt(i - 1) || 32) === 32 &&
		(value.charCodeAt(i + input.length) || 32) === 32;
}

// 是否包含样式类
function hasClass(node, className) {
	if (!className) { throw new Error('classname is not specified'); }
	return domBase.isHTMLElement(node) ? hasString(node.className, className) : false;
}

// 添加样式类
function addClass(node, classNames) {
	if (!domBase.isHTMLElement(node) || !classNames) { return; }

	var newClassName = node.className, i = -1, len = classNames.length;
	while (++i < len) {
		if ( !hasString(newClassName, classNames[i]) ) {
			newClassName += (' ' + classNames[i]);
		}
	}
	newClassName = newClassName.trim();
	if (newClassName !== node.className) { node.className = newClassName; }
}

// 移除样式类
function removeClass(node, classNames) {
	if ( !domBase.isHTMLElement(node) ) { return; }

	var origClassName = node.className;
	if (origClassName) {
		if (classNames) {
			var newClassName = ' ' + origClassName + ' ', i = -1, len = classNames.length;
			while (++i < len) {
				newClassName = newClassName.replace(' ' + classNames[i] + ' ', ' ');
			}
			newClassName = newClassName.trim();
			if (newClassName !== origClassName) { node.className = newClassName; }
		} else {
			node.className = '';
		}
	}
}

// 如果节点包含样式类，则移除；如果节点不包含样式类，则添加
function toggleClass(node, classNames) {
	if (!domBase.isHTMLElement(node) || !classNames) { return; }

	var newClassName = ' ' + node.className + ' ', i = -1, len = classNames.length, temp;
	while (++i < len) {
		temp = ' ' + classNames[i] + ' ';
		if (newClassName.indexOf(temp) === -1) {
			newClassName += (classNames[i] + ' ');
		} else {
			newClassName = newClassName.replace(temp, ' ');
		}
	}
	node.className = newClassName.trim();
}


/**
 * 获取节点尺寸
 * @method getSize
 * @param {Element|Window} node 节点
 * @param {String} which 宽度（width）或高度（height）
 * @param {Boolean} [includePadding=false] 是否包含padding
 * @param {Boolean} [includeBorder=false] 是否包含border
 * @param {Boolean} [includeMargin=false] 是否包含margin
 * @return {Number} 尺寸值
 */
function getSize(node, which, includePadding, includeBorder, includeMargin) {
	// 首字母大写
	which = which.toLowerCase().replace(/^[a-z]/, function(match) {
		return match.toUpperCase();
	});

	if ( domBase.isWindow(node) ) {
		// window对象，直接取浏览器可用范围
		return node.document.documentElement['client' + which];
	} else if ( node.nodeType === 9 ) {
		// document节点
		return node.documentElement['scroll' + which];
	} else if ( !node.ownerDocument || node.nodeType !== 1 || domBase.isXMLNode(node) ) {
		return 0;
	}

	// 获取节点尺寸（包含padding、border）
	// IE下，如果未设置宽高，clientWidth/clientHeight的值为0，所以要用offsetWidth/offsetHeight
	var size = node['offset' + which];
	// 如果全都是0，则可能处于隐藏状态
	if ( !(size + node.offsetWidth + node.offsetHeight) ) {
		// 任意一个父节点处于隐藏状态，size均为0
		var temp = node;
		do {
			if (getStyle(temp, 'display') === 'none') { return size; }
			temp = temp.parentNode;
		} while (temp);
	}

	// 获取边框样式，当边框样式为none时，无需纳入计算范围
	var borderStyle = getStyle(node, 'borderStyle');
	if (borderStyle === 'none') { borderStyle = ''; }

	// 计算额外部分
	(which === 'Width' ? ['Left', 'Right'] : ['Top', 'Bottom']).forEach(function(direction) {
		if (!includePadding) {
			size -= parseFloat( getStyle(node, 'padding' + direction) ) || 0;
		}
		if (!includeBorder && borderStyle) {
			size -= parseFloat( getStyle(node, 'border' + direction + 'Width') ) || 0;
		}
		if (includeMargin) {
			size += parseFloat( getStyle(node, 'margin' + direction) ) || 0;
		}
	});

	return size;
}


// 获取、记录元素的默认display值
var defaultDisplay = (function() {
	var cache = { };

	return {
		get: function(nodeName) {
			if (!cache[nodeName]) {
				var node = document.createElement(nodeName);
				document.body.appendChild(node);

				var val = getStyle(node, 'display');
				cache[nodeName] = val === 'none' ? 'block' : val;

				node.parentNode.removeChild(node);
				node = null;
			}

			return cache[nodeName];
		}
	};
})();


return {
	// See line 19
	rRelNumber: rRelNumber,

	// See line 110
	getStyle: getStyle,

	// See line 128
	setStyle: setStyle,

	// See line 218
	getSize: getSize,

	shortcuts: {
		/**
		 * 获取当前第一个节点的样式值
		 * @method css
		 * @for NodeList
		 * @param {String} name 样式名
		 * @return {String} 样式值
		 */
		/**
		 * 设置当前所有节点的样式值
		 * @method css
		 * @for NodeList
		 * @param {String} name 样式名
		 * @param {String|Number} val 样式值
		 * @return {NodeList} 当前节点集合
		 */
		/**
		 * 设置当前所有节点的样式值
		 * @method css
		 * @for NodeList
		 * @param {Object} cssProps 样式字典
		 * @return {NodeList} 当前节点集合
		 */
		css: function(name, val) {
			return domBase.access(this, name, val, true, {
				get: getStyle,
				set: setStyle
			});
		},

		/**
		 * 检查当前节点集合中是否至少有一个节点包含指定样式类
		 * @method hasClass
		 * @for NodeList
		 * @param {String} className 样式类
		 * @return {Boolean} 是否有节点包含指定CSS样式类
		 */
		hasClass: function(className) {
			return this.some(function(node) {
				return hasClass(node, className);
			});
		},

		/**
		 * 为当前所有节点添加样式类
		 * @method addClass
		 * @for NodeList
		 * @param {String|Array<String>} classNames 样式类。多个样式类用空格隔开，或者以数组传入
		 * @return {NodeList} 当前节点集合
		 */
		addClass: function(classNames) {
			classNames = domBase.splitBySpace(classNames);
			this.forEach(function(node) { addClass(node, classNames); });

			return this;
		},

		/**
		 * 为当前所有节点移除CSS样式类
		 * @method removeClass
		 * @for NodeList
		 * @param {String|Array<String>} classNames 样式类。 多个样式类用空格隔开，或者以数组传入；
		 *   如果为空，则移除所有样式类
		 * @return {NodeList} 当前节点集合
		 */
		removeClass: function(classNames) {
			classNames = domBase.splitBySpace(classNames);
			this.forEach(function(node) { removeClass(node, classNames); });

			return this;
		},

		/**
		 * 如果节点包含样式类，则移除；如果节点不包含样式类，则添加
		 * @method toggleClass
		 * @for NodeList
		 * @param {String|Array<String>} classNames 样式类。多个样式类用空格隔开，或者以数组传入
		 * @param {Boolean} [addOrRemove] 如果值为true，则强制添加样式类；
		 *   如果值为false，则强制移除样式类
		 * @return {NodeList} 当前节点集合
		 */
		toggleClass: function(classNames, addOrRemove) {
			switch (addOrRemove) {
				case true:
					return this.addClass(classNames);
				case false:
					return this.removeClass(classNames);
			}

			classNames = domBase.splitBySpace(classNames);
			this.forEach(function(node) { toggleClass(node, classNames); });

			return this;
		},

		/**
		 * 获取当前第一个节点的宽度
		 * @method width
		 * @for NodeList
		 * @return {Number} 节点宽度
		 */
		/**
		 * 设置当前所有节点的宽度
		 * @method width
		 * @for NodeList
		 * @param {Number|String} val 宽度值
		 * @return {NodeList} 当前节点集合
		 */
		width: function(val) {
			return val != null ? this.css('width', val) : getSize(this[0], 'Width');
		},

		/**
		 * 获取当前第一个节点的高度
		 * @method height
		 * @for NodeList
		 * @return {Number} 节点高度
		 */
		/**
		 * 设置当前所有节点的高度
		 * @method height
		 * @for NodeList
		 * @param {Number|String} val 高度值
		 * @return {NodeList} 当前节点集合
		 */
		height: function(val) {
			return val != null ? this.css('height', val) : getSize(this[0], 'Height');
		},

		/**
		 * 获取当前第一个节点的内部宽度（包含padding）
		 * @method innerWidth
		 * @for NodeList
		 * @return {Number} 内部宽度
		 */
		innerWidth: function() { return getSize(this[0], 'Width', true); },

		/**
		 * 获取当前第一个节点的内部高度（包含padding）
		 * @method innerHeight
		 * @for NodeList
		 * @return {Number} 内部高度
		 */
		innerHeight: function() { return getSize(this[0], 'Height', true); },

		/**
		 * 获取当前第一个节点的外部宽度（包含padding、border）
		 * @method outerWidth
		 * @for NodeList
		 * @param {Boolean} [includeMargin=false] 是否包含margin
		 * @return {Number} 外部宽度
		 */
		outerWidth: function(includeMargin) {
			return getSize(this[0], 'Width', true, true, includeMargin);
		},

		/**
		 * 获取当前第一个节点的外部高度（包含padding、border）
		 * @method outerHeight
		 * @for NodeList
		 * @param {Boolean} [includeMargin=false] 是否包含margin
		 * @return {Number} 外部高度
		 */
		outerHeight: function(includeMargin) {
			return getSize(this[0], 'Height', true, true, includeMargin);
		},

		/**
		 * 显示当前所有节点
		 * @method show
		 * @for NodeList
		 * @return {NodeList} 当前节点集合
		 */
		show: function() {
			this.forEach(function(node) {
				if (node.style.display === 'none') {
					node.style.display = '';
				}
				if (getStyle(node, 'display') === 'none') {
					node.style.display = defaultDisplay.get(node.nodeName);
				}
			});

			return this;
		},

		/**
		 * 隐藏当前所有节点
		 * @method hide
		 * @for NodeList
		 * @return {NodeList} 当前节点集合
		 */
		hide: function() { return this.css('display', 'none'); },

		/**
		 * 如果第一个节点是隐藏的，则显示所有节点，否则隐藏所有节点
		 * @method toggle
		 * @for NodeList
		 * @param  {Boolean} [showOrHide] 强制指定显示或隐藏。
		 *   如果此值为true，则显示所有节点；
		 *   如果此值为false，则隐藏所有节点
		 * @return {NodeList} 当前节点集合
		 */
		toggle: function(showOrHide) {
			if (typeof showOrHide !== 'boolean') {
				showOrHide = this.css('display') === 'none';
			}
			return this[showOrHide ? 'show' : 'hide']();
		}
	}
};

});