/*!
 * JRaiser 2 Javascript Library
 * dom-ready - v1.1.0 (2014-08-18T11:12:55+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("dom/1.1.x/dom-ready",null,function(t,n,e){"use strict";return function(t){function n(t){for(l=1;t=o.shift();)t()}var e,o=[],c=!1,u=document,i=u.documentElement,r=i.doScroll,a="DOMContentLoaded",d="addEventListener",f="onreadystatechange",s="readyState",l="loading"!==u[s];return u[d]&&u[d](a,e=function(){u.removeEventListener(a,e,c),n()},c),r&&u.attachEvent(f,e=function(){"loading"!==u[s]&&(u.detachEvent(f,e),n())}),t=r?function(n){self!=top?l?n():o.push(n):function(){try{i.doScroll("left")}catch(e){return setTimeout(function(){t(n)},50)}n()}()}:function(t){l?t():o.push(t)}}()});