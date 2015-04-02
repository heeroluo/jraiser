/*!
 * JRaiser 2 Javascript Library
 * dom-data - v1.0.0 (2014-05-06T10:57:25+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("dom/1.0.x/dom-data",["base/1.0.x/","dom/1.0.x/dom-base"],function(t,e,n){"use strict";function a(t,e){var n=u(t);return o[n]?o[n][e]:null}function i(t,e,n){var a=u(t),i=o[a]=o[a]||{};i[e]=n}function r(t,e,n){if(!c.isEmptyObject(o)){var a=u(t);if(null==e||""===e)delete o[a];else{var i=o[a];i&&(n||(e=s.splitBySpace(e)),e.forEach(function(t){delete i[t]}),c.isEmptyObject(i)&&delete o[a])}}}var c=t("base/1.0.x/"),s=t("./dom-base"),u=s.uniqueId,o={};return{getData:a,setData:i,removeData:r,shortcuts:{data:function(t,e){return s.access(this,t,e,!0,{get:a,set:i})},removeData:function(t){return t=s.splitBySpace(t),this.forEach(function(e){r(e,t,!0)}),this}}}});