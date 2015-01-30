/*!
 * JRaiser 2 Javascript Library
 * dom-data - v1.1.0 (2015-01-30T14:37:23+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define(function(require, exports, module) { 'use strict';

/**
 * 本模块提供节点数据存取接口
 * @module dom/1.1.x/dom-data
 * @catgory Infrastructure
 * @ignore
 */


var base = require('base/1.0.x/'), domBase = require('./dom-base');


// 管理节点id
var uniqueId = (function () {
	// 对以下元素设置自定义特性会抛出无法捕获的异常
	var noData = {
		OBJECT: true,
		EMBED: true,
		APPLET: true
	};

	var expandoName = '_jraiser_nodeid_' + (+new Date) + '_',  // id属性名
		autoId = 0,  // 自增id
		specialObjData = { };  // 存放非HTML节点的数据

	// 获取自定义特性写入方式
	//   0 - 不能写入
	//   1 - 直接写入到节点
	//   2 - 写入到specialObjData
	function expandoType(node) {
		if ( domBase.isWindow(node) || !domBase.isNode(node) ) {
			// 非节点数据写入到specialObjData
			return 2;
		} else if ( node == null || (node.nodeType !== 1 && node.nodeType !== 9) ) {
			// 不对非元素节点写入
			return 0;
		} else if ( domBase.isXMLNode(node) || noData[node.nodeName] ) {
			// XML节点和特殊HTML节点的数据写入到specialObjData
			return 2;
		} else {
			return 1;
		}
	}

	// 删除id特性
	function deleteExpando(node) {
		if (node[expandoName]) {
			try {
				delete node[expandoName];
			} catch (e) {
				node[expandoName] = null;
			}
		}
	}

	return {
		// 获取节点id
		get: function(node, doNotSet) {
			var id;

			switch ( expandoType(node) ) {
				case 1:
					id = node[expandoName];
					if (!id && !doNotSet) {
						// 写入object类型的自定义特性不会出现在innerHTML中
						id = node[expandoName] = new Number(++autoId);
					}
					break;

				case 2:
					for (var i in specialObjData) {
						if (specialObjData[i] === node) {
							id = i;
							break;
						}
					}
					if (!id && !doNotSet) {
						id = ++autoId;
						specialObjData[id] = node;
					}
					break;
			}

			if (id) { return id.valueOf(); }
		},

		// 移除节点id
		remove: function(node) {
			switch ( expandoType(node) ) {
				case 1:
					deleteExpando(node);
					break;

				case 2:
					for (var i in specialObjData) {
						if (specialObjData[i] === node) {
							delete specialObjData[i];
							break;
						}
					}
					break;
			}
		}
	};
})();


// 管理数据空间
var dataSpaces = (function() {
	// 存放每个独立的数据空间
	var spaces = [ ];

	return {
		// 增加数据空间
		add: function(space) { return spaces.push(space) - 1; },
		// 清空某个节点在所有数据空间的数据
		clear: function(node) {
			for (var i = spaces.length - 1; i >= 0; i--) {
				spaces[i].clear(node);
			}
		},
		// 克隆节点数据
		clone: function(targetNode, sourceNode) {
			for (var i = spaces.length - 1; i >= 0; i--) {
				spaces[i].clone(targetNode, sourceNode);
			}
		}
	};
})();


// 数据空间类
var DataSpace = base.createClass(function(options) {
	this._space = { };
	this._cloneable = options.cloneable !== false;
	this._onClone = options.onClone;
}, {
	// 寻找节点对应的数据空间
	_findData: function(node) { return this._space[uniqueId.get(node, true)]; },

	// 获取所有节点数据名
	keys: function(node) {
		var data = this._findData(node), keys = [ ];
		if (data) {
			for (var key in data) {
				if ( data.hasOwnProperty(key) ) { keys.push(key); }
			}
		}
		return keys;
	},

	// 获取节点某项数据
	get: function(node, key) {
		var data = this._findData(node);
		if ( data && data.hasOwnProperty(key) ) { return data[key]; }
	},

	// 设置节点某项数据
	set: function(node, key, value) {
		var id = uniqueId.get(node);
		if (id) {
			var space = this._space;
			if (!space[id]) { space[id] = { }; }
			space[id][key] = value;
		}
	},

	// 移除节点某项数据
	remove: function(node, key) {
		var data = this._findData(node);
		if (data) {
			delete data[key];
			// 没有数据时进行清理
			if ( base.isEmptyObject(data) ) { this.clear(node); }
		}
	},

	// 清空节点数据
	clear: function(node) {
		delete this._space[uniqueId.get(node, true)];
	},

	// 克隆节点数据
	clone: function(targetNode, sourceNode) {
		if (!this._cloneable) { return; }

		var sourceData = this._findData(sourceNode);
		if (sourceData) {
			var targetId = uniqueId.get(targetNode),
				targetData = this._space[targetId] = this._space[targetId] || { };

			for (var i in sourceData) {
				if ( sourceData.hasOwnProperty(i) ) { targetData[i] = sourceData[i]; }
			}

			if (this._onClone) { this._onClone(targetNode, sourceNode); }
		}
	}
});


/**
 * 创建数据空间
 * @method createDataSpace
 * @param {Object} options 空间配置
 *   @param {Boolean} [options.cloneable=true] 是否可克隆
 * @return {Object} 数据空间对象
 */
function createDataSpace(options) {
	var space = new DataSpace(options || { });
	dataSpaces.add(space);
	return space;
}


// 默认的用户数据空间
var userDataSpace = createDataSpace();

// 获取节点数据
function getData(node, key) { return userDataSpace.get(node, key); }

// 设置节点数据
function setData(node, key, value) { userDataSpace.set(node, key, value); }

// 移除节点数据
function removeData(node, keys) {
	if (keys == null) {
		userDataSpace.clear(node);
	} else {
		keys.forEach(function(k) {
			userDataSpace.remove(node, k);
		});
	}
}


return {
	// See line 208
	createDataSpace: createDataSpace,

	/**
	 * 清空指定节点在所有数据空间的数据
	 * @method clearAll
	 * @param {Element} node 指定节点
	 */
	clearAll: function(node) {
		dataSpaces.clear(node);
		uniqueId.remove(node);
	},

	/**
	 * 克隆节点在所有数据空间的数据
	 * @method cloneAll
	 * @param {Element} targetNode 目标节点
	 * @param {Element} sourceNode 源节点
	 */
	cloneAll: function(targetNode, sourceNode) {
		return dataSpaces.clone(targetNode, sourceNode);
	},

	/**
	 * 移除自定义节点id
	 * @method removeUniqueId
	 * @param {Element} node 节点
	 */
	removeUniqueId: function(node) { uniqueId.remove(node); },

	shortcuts: {
		/**
		 * 获取当前第一个节点的数据
		 * @method data
		 * @for NodeList
		 * @param {String} key 数据名
		 * @return {Any} 数据值
		 */
		/**
		 * 设置当前所有节点的数据
		 * @method data
		 * @for NodeList
		 * @param {String} key 数据名
		 * @param {Any} value 数据值
		 * @return {NodeList} 当前节点集合
		 */
		/**
		 * 设置当前所有节点的数据
		 * @method data
		 * @for NodeList
		 * @param {Object} data 数据字典
		 * @return {NodeList} 当前节点集合
		 */
		data: function(key, value) {
			return domBase.access(this, key, value, true, {
				get: getData,
				set: setData
			});
		},

		/**
		 * 移除当前所有节点的数据
		 * @method removeData
		 * @for NodeList
		 * @param {String|Array<String>} [keys] 数据名。如果为空，则移除所有自定义数据；
		 *   多个数据名用空格隔开，或者以数组传入
		 * @return {NodeList} 当前节点集合
		 */
		removeData: function(keys) {
			if (keys != null) { keys = domBase.splitBySpace(keys); }
			this.forEach(function(node) {
				removeData(node, keys);
			});
			return this;
		}
	}
};

});