/*!
 * JRaiser 2 Javascript Library
 * dom-insertion - v1.1.0 (2014-11-24T10:04:32+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("dom/1.1.x/dom-insertion",["base/1.0.x/","dom/1.1.x/sizzle","dom/1.1.x/dom-base","dom/1.1.x/dom-data","dom/1.1.x/dom-traversal"],function(n){"use strict";function e(n,e){e=e||document;var t=e.createElement("div"),r=e.createDocumentFragment();for(t.innerHTML=n;t.firstChild;)r.appendChild(t.firstChild);return t=null,p.toArray(r.childNodes)}function t(n,e){var t=n.length;if(t){for(var r=(e||document).createDocumentFragment(),i=-1;++i<t;)m.isNode(n[i])&&r.appendChild(n[i]);return r}}function r(n,r){return!n||m.isNode(n)?n:("string"==typeof n&&(n=e(n)),1!==n.length?t(n,r):m.isNode(n[0])?n[0]:void 0)}function i(n,e,t){var r=n.cloneNode(!0);if(e)if(t){var i=C.selfAndDescendants(n);if(i)for(var o=C.selfAndDescendants(r),u=i.length-1;u>=0;u--)N.removeUniqueId(o[u]),N.cloneAll(o[u],i[u])}else N.removeUniqueId(r),N.cloneAll(r,n);return r}function o(n,e){return e.appendChild(n)}function u(n,e){var t=e.firstChild;return t?e.insertBefore(n,t):e.appendChild(n),n}function c(n,e){return e.parentNode.insertBefore(n,e)}function s(n,e){var t=e.nextSibling;return t?e.parentNode.insertBefore(n,t):e.parentNode.appendChild(n),n}function l(n,e){return N.clearAll(e),e.parentNode.replaceChild(n,e)}function f(n,e,t,o){var u=-1,c=e.length;if(c&&(n=r(n)))for(;++u<c;)o&&o.call(this,e[u])===!1||t.call(this,u===c-1?n:i(n,!0,!0),e[u]);return e}function a(n,e,r,o){var u=[];if("string"==typeof e)e=v(e);else{if(null==e||m.isWindow(e))return u;e=m.isNode(e)?[e]:p.toArray(e)}var c=e.length;if(c&&(n=t(n)))for(var s,l=-1;++l<c;)o&&o.call(this,e[l])===!1||(s=l===c-1?n:i(n,!0,!0),p.merge(u,s.childNodes),r.call(this,s,e[l]));return v.uniqueSort(u)}function d(n){return null!=n.parentNode}function h(n){return 1===n.nodeType||11===n.nodeType}var p=n("base/1.0.x/"),v=n("./sizzle"),m=n("./dom-base"),N=n("./dom-data"),C=n("./dom-traversal");return{htmlToNodes:e,shortcuts:{append:function(n){return f(n,this,o,h)},appendTo:function(n){return new this.constructor(a(this,n,o,h))},prepend:function(n){return f(n,this,u,h)},prependTo:function(n){return new this.constructor(a(this,n,u,h))},before:function(n){return f(n,this,c,d)},insertBefore:function(n){return new this.constructor(a(this,n,c,d))},after:function(n){return f(n,this,s,d)},insertAfter:function(n){return new this.constructor(a(this,n,s,d))},replaceWith:function(n){return f(n,this,l,d)},replaceAll:function(n){return new this.constructor(a(this,n,l,d))},detach:function(){return this.forEach(function(n){n.parentNode.removeChild(n)}),this},remove:function(){return this.forEach(function(n){var e=C.selfAndDescendants(n);if(e){for(var t=e.length-1;t>=0;t--)N.clearAll(e[t]);e=null}n.parentNode&&n.parentNode.removeChild(n)}),this},empty:function(){return this.forEach(function(n){var e=C.selfAndDescendants(n);if(e)for(var t=e.length-1;t>=1;t--)N.clearAll(e[t]);for(e=null;n.firstChild;)n.removeChild(n.firstChild);n.options&&"SELECT"===n.nodeName&&(n.options.length=0)}),this},clone:function(n,e){var t=[];return this.forEach(function(r,o){t[o]=i(r,n,e)}),new this.constructor(t)}}}});