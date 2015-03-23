/*!
 * JRaiser 2 Javascript Library
 * dom-animation - v1.1.0 (2015-01-30T14:06:57+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("dom/1.1.x/dom-animation",["base/1.0.x/","animation/1.0.x/","dom/1.1.x/dom-base","dom/1.1.x/dom-data","dom/1.1.x/dom-style","dom/1.1.x/sizzle","dom/1.1.x/dom-offset"],function(t){"use strict";function e(t,e){return"string"==typeof e&&(f.test(e)?e=parseFloat(e,10)||0:g.test(t)?d.test(e)?e=[parseInt(e.substr(1,2),16),parseInt(e.substr(3,2),16),parseInt(e.substr(5,2),16)]:m.test(e)&&(e=[Number(RegExp.$1),Number(RegExp.$2),Number(RegExp.$3)]):e=e.toLowerCase()),e}function r(t,r){var n,s={};for(var o in r)r.hasOwnProperty(o)&&(n="width"===o||"height"===o?c.getSize(t,o):p.test(o)?l.getScroll(t,RegExp.$1):e(o,c.getStyle(t,o)),s[o]=n);return s}function n(t,r){var n,s={};for(n in t)s[n]=c.rRelNumber.test(t[n])?(parseFloat(r[n],10)||0)+Number(RegExp.$1+RegExp.$2):e(n,t[n]);return s}function s(t,e,s){if(i.isHTMLElement(t)){s=s||{};var u=r(t,e);e=n(e,u),o(t);var f=a.add({startValue:u,endValue:e,duration:s.duration,easing:s.easing,step:function(e,r){p.test(r)?l.setScroll(t,RegExp.$1,e):c.setStyle(t,r,g.test(r)?"rgb("+e.map(function(t){return Math.min(255,Math.round(t))}).join(", ")+")":e)},onprogress:function(){s.onprogress&&s.onprogress.apply(t,arguments)},oncomplete:function(){b.clear(t);var e=s.oncomplete||s.callback;e&&e.call(t)}});b.set(t,"taskId",f)}}function o(t,e){if(i.isHTMLElement(t)){var r=b.get(t,"taskId");r&&(a.remove(r,e),b.clear(t))}}var a=(t("base/1.0.x/"),t("animation/1.0.x/")),i=t("./dom-base"),u=t("./dom-data"),c=t("./dom-style"),l=t("./dom-offset"),f=/^[+-]?\d+(?:\.\d+)?[^\s]*$/,p=/^scroll(Top|Left)$/,g=/color$/i,d=/^#[0-9a-f]{6}$/i,m=/^rgb\((\d+),\s(\d+),\s(\d+)\)$/,b=u.createDataSpace({cloneable:!1});return{shortcuts:{animate:function(t,r){for(var n in t)t[n]=e(n,t[n]);return this.forEach(function(e){s(e,t,r)}),this},stop:function(t){return this.forEach(function(e){o(e,t)}),this}}}});