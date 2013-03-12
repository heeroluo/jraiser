/*!
 * jRaiser 2 Javascript Library
 * querystring - v1.0.0 (2013-03-08T14:38:22+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("querystring/1.0.x/",["base/1.0.x/"],function(e,t,n){"use strict";var r=e("base/1.0.x/");return{stringify:function(e,t){t=r.extend({encode:encodeURIComponent},t);var n=[];return r.each(e,function(e,r){n.push(t.encode(r)+(e==null?"":"="+t.encode(e)))}),n.join("&")},parse:function(e,t){t=r.extend({decode:decodeURIComponent},t);var n={};e=(e||window.location.search.substr(1)).replace(/(?:^|&)([^&]+)=([^&]+)/g,function(e,r,i){return n[r]=t.decode(i),""}).split("&");for(var i=0;i<e.length;i++)e[i]&&(n[e[i]]=null);return n},append:function(e,t,n){if(!t)return e;typeof t!="string"&&(t=this.stringify(t,n)),t=t.replace(/^[?&]+/,"");var r=e.indexOf("#"),i="";return r!==-1&&(i=e.substring(r,e.length),e=e.substring(0,r)),e=e.replace(/[?&]+$/,""),e+(e.indexOf("?")===-1?"?":"&")+t+i}}})