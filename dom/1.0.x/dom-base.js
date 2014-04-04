/*!
 * JRaiser 2 Javascript Library
 * dom-base - v1.0.0 (2013-12-06T13:47:57+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("dom/1.0.x/dom-base",null,function(){"use strict";var n,e="_jRaiserNodeId_",t=0,u=/\s+/;return{isNode:function(e){return e.nodeType!==n},isXMLNode:function(n){var e=(n.ownerDocument||n).documentElement;return e?"HTML"!==e.nodeName:!1},isWindow:function(n){return null!=n&&n==n.window},getWindow:function(n){return this.isWindow(n)?n:9===n.nodeType?n.defaultView||n.parentWindow:!1},uniqueId:function(u,i){var r=u[e];return r===n&&i!==!1&&(r=u[e]=new Number(++t)),r?r.valueOf():r},removeUniqueId:function(n){try{delete n[e]}catch(t){n[e]=null}},splitBySpace:function(n){return"string"==typeof n&&(n=n.split(u)),null==n||0===n.length?null:n}}});