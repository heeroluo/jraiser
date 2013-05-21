/*!
 * jRaiser 2 Javascript Library
 * querystring - v1.0.0 (2013-03-13T15:37:14+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("querystring/1.0.x/",["base/1.0.x/",null],function(e,t,n){"use strict";var r=e("base/1.0.x/");return{stringify:function(e,t){t=r.extend({encode:encodeURIComponent},t);var n=[];return r.each(e,function(e,r){n.push(t.encode(r)+(e==null?"":"="+t.encode(e)))}),n.join("&")},parse:function(e,t){t=r.extend({decode:decodeURIComponent},t);var n={};e=(e||window.location.search.substr(1)).replace(/(?:^|&)([^&]+)=([^&]+)/g,function(e,r,i){return n[r]=t.decode(i),""}).split("&");for(var i=0;i<e.length;i++)e[i]&&(n[e[i]]=null);return n},append:function(e,t,n){if(!t||r.isEmptyObject(t))return e;typeof t!="string"&&(t=this.stringify(t,n)),t=t.replace(/^[?&]+/,"");var i=e.indexOf("#"),s="";return i!==-1&&(s=e.substring(i,e.length),e=e.substring(0,i)),e=e.replace(/[?&]+$/,""),e+(e.indexOf("?")===-1?"?":"&")+t+s}}})