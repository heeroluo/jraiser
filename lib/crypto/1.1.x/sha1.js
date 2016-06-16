/*!
 * JRaiser 2 Javascript Library
 * crypto-sha1@1.1.0 (2016-06-16T15:36:07+0800)
 * http://jraiser.org/ | Released under MIT license
 *
 * Modify from http://pajhome.org.uk/crypt/md5
 */
define("crypto/1.1.x/sha1",null,function(r,n,t){"use strict";function e(r){for(var n=Array(),t=(1<<h)-1,e=0;e<r.length*h;e+=h)n[e>>5]|=(r.charCodeAt(e/h)&t)<<32-h-e%32;return n}function u(r,n){var t=(65535&r)+(65535&n),e=(r>>16)+(n>>16)+(t>>16);return e<<16|65535&t}function f(r,n){return r<<n|r>>>32-n}function o(r,n,t,e){return 20>r?n&t|~n&e:40>r?n^t^e:60>r?n&t|n&e|t&e:n^t^e}function a(r){return 20>r?1518500249:40>r?1859775393:60>r?-1894007588:-899497514}function c(r,n){r[n>>5]|=128<<24-n%32,r[(n+64>>9<<4)+15]=n;for(var t=Array(80),e=1732584193,c=-271733879,i=-1732584194,h=271733878,v=-1009589776,A=0;A<r.length;A+=16){for(var g=e,l=c,d=i,s=h,y=v,b=0;80>b;b++){16>b?t[b]=r[A+b]:t[b]=f(t[b-3]^t[b-8]^t[b-14]^t[b-16],1);var p=u(u(f(e,5),o(b,c,i,h)),u(u(v,t[b]),a(b)));v=h,h=i,i=f(c,30),c=e,e=p}e=u(e,g),c=u(c,l),i=u(i,d),h=u(h,s),v=u(v,y)}return Array(e,c,i,h,v)}function i(r){for(var n="0123456789abcdef",t="",e=0;e<4*r.length;e++)t+=n.charAt(r[e>>2]>>8*(3-e%4)+4&15)+n.charAt(r[e>>2]>>8*(3-e%4)&15);return t}var h=8;t.exports=function(r){return i(c(e(r),r.length*h))}});