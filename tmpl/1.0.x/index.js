/*!
 * JRaiser 2 Javascript Library
 * micro-templating - v1.0.0 (2014-04-21T14:44:29+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("tmpl/1.0.x/",null,function(){"use strict";function e(){for(var e=document.getElementsByTagName("script"),n={},t=0;t<e.length;t++)n[e[t].getAttribute("data-key")||e[t].id]=e[t].innerHTML.trim();return n}function n(e){return e.replace(u,function(e){return r[e]})}function t(r){var i=(r||{}).delimiters;i=i?i.slice():["<%","%>"];var p=new RegExp("((^|"+i[1]+")[^\\t]*)'","g"),u=new RegExp("\\t=(.*?)"+i[1],"g"),a=new RegExp("\\t-(.*?)"+i[1],"g"),_={};return{render:function(e,t,r){if(null==e||null==t)return e;var o=_[e];return o||(o=new Function("obj","escape","var __p__=[],print=function(){__p__.push.apply(__p__,arguments);};with(obj){__p__.push('"+e.replace(/[\r\t\n]/g," ").split(i[0]).join("	").replace(p,"$1\r").replace(u,"',$1,'").replace(a,"',escape($1),'").split("	").join("');").split(i[1]).join("__p__.push('").split("\r").join("\\'")+"');}return __p__.join('');"),r!==!1&&(_[e]=o)),o(t,n)},loadTemplateFromHTML:e,setup:t}}var r={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;"},i=[];for(var p in r)i.push(p);var u=new RegExp("["+i.join("")+"]","g");return t()});