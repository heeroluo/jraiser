/*!
 * jRaiser 2 Javascript Library
 * dom-data - v1.0.0 (2013-02-13T19:21:50+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("dom/1.0.x/dom-data",["base/1.0.x/","dom/1.0.x/dom-base",null],function(e,t,n){"use strict";function u(e,t){var n=s(e);return o[n]?o[n][t]:null}function a(e,t,n){var r=s(e),i=o[r]=o[r]||{};i[t]=n}function f(e,t,n){if(r.isEmptyObject(o))return;var u=s(e);if(t==null||t==="")delete o[u];else{var a=o[u];a&&(n||(t=i.splitBySpace(t)),t.forEach(function(e){delete a[e]}),r.isEmptyObject(a)&&delete o[u])}}var r=e("base/1.0.x/"),i=e("./dom-base"),s=i.uniqueId,o={};return{getData:u,setData:a,removeData:f,shortcuts:{data:function(e,t){return r.access(this,e,t,!0,{get:u,set:a})},removeData:function(e){return e=i.splitBySpace(e),this.forEach(function(t){f(t,e,!0)}),this}}}})