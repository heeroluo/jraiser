/*!
 * jRaiser 2 Javascript Library
 * dom-ready - v1.0.0 (2013-01-09T09:59:23+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("dom/1.0.x/dom-ready",null,function(e,t,n){"use strict";return function(e){function h(e){c=1;while(e=t.shift())e()}var t=[],n,r=!1,i=document,s=i.documentElement,o=s.doScroll,u="DOMContentLoaded",a="addEventListener",f="onreadystatechange",l="readyState",c=i[l]!=="loading";return i[a]&&i[a](u,n=function(){i.removeEventListener(u,n,r),h()},r),o&&i.attachEvent(f,n=function(){i[l]!=="loading"&&(i.detachEvent(f,n),h())}),e=o?function(n){self!=top?c?n():t.push(n):function(){try{s.doScroll("left")}catch(t){return setTimeout(function(){e(n)},50)}n()}()}:function(e){c?e():t.push(e)}}()})