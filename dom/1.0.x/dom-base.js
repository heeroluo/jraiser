/*!
 * jRaiser 2 Javascript Library
 * dom-base - v1.0.0 (2013-12-06T13:47:57+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("dom/1.0.x/dom-base",null,function(e,t,n){"use strict";var r="_jRaiserNodeId_",i=0,s,o=/\s+/;return{isNode:function(e){return e.nodeType!==s},isXMLNode:function(e){var t=(e.ownerDocument||e).documentElement;return t?t.nodeName!=="HTML":!1},isWindow:function(e){return e!=null&&e==e.window},getWindow:function(e){return this.isWindow(e)?e:e.nodeType===9?e.defaultView||e.parentWindow:!1},uniqueId:function(e,t){var n=e[r];return n===s&&t!==!1&&(n=e[r]=new Number(++i)),n?n.valueOf():n},removeUniqueId:function(e){try{delete e[r]}catch(t){e[r]=null}},splitBySpace:function(e){return typeof e=="string"&&(e=e.split(o)),e==null||e.length===0?null:e}}})