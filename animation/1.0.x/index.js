/*!
 * JRaiser 2 Javascript Library
 * animation - v1.0.0 (2014-12-16T16:13:12+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("animation/1.0.x/",["base/1.0.x/",null],function(n){"use strict";function t(n,e,r,a,u){var i;return"number"==typeof n&&"number"==typeof e?i=n+(e-n)*a.call(s,u,r*u,0,1,r):o.isArray(n)&&o.isArray(e)&&(i=n.map(function(n,i){return t(n,e[i],a,u,r)})),null!=i?i:e}function e(){c.length||clearInterval(i)}function r(n){for(var t,e=0,r=c.length-1;r>=e;){if(t=parseInt((e+r)/2),c[t].id==n)return t;c[t].id>n?r=t-1:e=t+1}return-1}function a(n,e,r){var u,i=n.startValue,s=n.endValue;if(o.isObject(i)&&o.isObject(s)){u={};for(r in i)u[r]=a({startValue:i[r],endValue:s[r],duration:n.duration,easing:n.easing,step:n.step},e,r)}else u=e>=1?n.endValue:t(n.startValue,n.endValue,n.duration,n.easing,e),n.step.call(window,u,r);return u}function u(){for(var n,t,r,u=0;n=c[u];){t=+new Date,n.startTime=n.startTime||t;var i=Math.max(0,n.startTime+n.duration-t),o=1-(i/n.duration||0);r=a(n,o),n.onprogress&&n.onprogress.call(window,r,o,i),o>=1?(c.splice(u,1),n.oncomplete&&n.oncomplete.call(window,n.id)):u++}e()}var i,o=n("base/1.0.x/"),s={linear:function(n){return n},swing:function(n){return.5-Math.cos(n*Math.PI)/2},easeInQuad:function(n,t,e,r,a){return r*(t/=a)*t+e},easeOutQuad:function(n,t,e,r,a){return-r*(t/=a)*(t-2)+e},easeInOutQuad:function(n,t,e,r,a){return(t/=a/2)<1?r/2*t*t+e:-r/2*(--t*(t-2)-1)+e},easeInCubic:function(n,t,e,r,a){return r*(t/=a)*t*t+e},easeOutCubic:function(n,t,e,r,a){return r*((t=t/a-1)*t*t+1)+e},easeInOutCubic:function(n,t,e,r,a){return(t/=a/2)<1?r/2*t*t*t+e:r/2*((t-=2)*t*t+2)+e},easeInQuart:function(n,t,e,r,a){return r*(t/=a)*t*t*t+e},easeOutQuart:function(n,t,e,r,a){return-r*((t=t/a-1)*t*t*t-1)+e},easeInOutQuart:function(n,t,e,r,a){return(t/=a/2)<1?r/2*t*t*t*t+e:-r/2*((t-=2)*t*t*t-2)+e},easeInQuint:function(n,t,e,r,a){return r*(t/=a)*t*t*t*t+e},easeOutQuint:function(n,t,e,r,a){return r*((t=t/a-1)*t*t*t*t+1)+e},easeInOutQuint:function(n,t,e,r,a){return(t/=a/2)<1?r/2*t*t*t*t*t+e:r/2*((t-=2)*t*t*t*t+2)+e},easeInSine:function(n,t,e,r,a){return-r*Math.cos(t/a*(Math.PI/2))+r+e},easeOutSine:function(n,t,e,r,a){return r*Math.sin(t/a*(Math.PI/2))+e},easeInOutSine:function(n,t,e,r,a){return-r/2*(Math.cos(Math.PI*t/a)-1)+e},easeInExpo:function(n,t,e,r,a){return 0==t?e:r*Math.pow(2,10*(t/a-1))+e},easeOutExpo:function(n,t,e,r,a){return t==a?e+r:r*(-Math.pow(2,-10*t/a)+1)+e},easeInOutExpo:function(n,t,e,r,a){return 0==t?e:t==a?e+r:(t/=a/2)<1?r/2*Math.pow(2,10*(t-1))+e:r/2*(-Math.pow(2,-10*--t)+2)+e},easeInCirc:function(n,t,e,r,a){return-r*(Math.sqrt(1-(t/=a)*t)-1)+e},easeOutCirc:function(n,t,e,r,a){return r*Math.sqrt(1-(t=t/a-1)*t)+e},easeInOutCirc:function(n,t,e,r,a){return(t/=a/2)<1?-r/2*(Math.sqrt(1-t*t)-1)+e:r/2*(Math.sqrt(1-(t-=2)*t)+1)+e},easeInElastic:function(n,t,e,r,a){var u=1.70158,i=0,o=r;if(0==t)return e;if(1==(t/=a))return e+r;if(i||(i=.3*a),o<Math.abs(r)){o=r;var u=i/4}else var u=i/(2*Math.PI)*Math.asin(r/o);return-(o*Math.pow(2,10*(t-=1))*Math.sin(2*(t*a-u)*Math.PI/i))+e},easeOutElastic:function(n,t,e,r,a){var u=1.70158,i=0,o=r;if(0==t)return e;if(1==(t/=a))return e+r;if(i||(i=.3*a),o<Math.abs(r)){o=r;var u=i/4}else var u=i/(2*Math.PI)*Math.asin(r/o);return o*Math.pow(2,-10*t)*Math.sin(2*(t*a-u)*Math.PI/i)+r+e},easeInOutElastic:function(n,t,e,r,a){var u=1.70158,i=0,o=r;if(0==t)return e;if(2==(t/=a/2))return e+r;if(i||(i=.3*a*1.5),o<Math.abs(r)){o=r;var u=i/4}else var u=i/(2*Math.PI)*Math.asin(r/o);return 1>t?-.5*o*Math.pow(2,10*(t-=1))*Math.sin(2*(t*a-u)*Math.PI/i)+e:o*Math.pow(2,-10*(t-=1))*Math.sin(2*(t*a-u)*Math.PI/i)*.5+r+e},easeInBack:function(n,t,e,r,a,u){return void 0==u&&(u=1.70158),r*(t/=a)*t*((u+1)*t-u)+e},easeOutBack:function(n,t,e,r,a,u){return void 0==u&&(u=1.70158),r*((t=t/a-1)*t*((u+1)*t+u)+1)+e},easeInOutBack:function(n,t,e,r,a,u){return void 0==u&&(u=1.70158),(t/=a/2)<1?r/2*t*t*(((u*=1.525)+1)*t-u)+e:r/2*((t-=2)*t*(((u*=1.525)+1)*t+u)+2)+e},easeInBounce:function(n,t,e,r,a){return r-this.easeOutBounce(n,a-t,0,r,a)+e},easeOutBounce:function(n,t,e,r,a){return(t/=a)<1/2.75?7.5625*r*t*t+e:2/2.75>t?r*(7.5625*(t-=1.5/2.75)*t+.75)+e:2.5/2.75>t?r*(7.5625*(t-=2.25/2.75)*t+.9375)+e:r*(7.5625*(t-=2.625/2.75)*t+.984375)+e},easeInOutBounce:function(n,t,e,r,a){return a/2>t?.5*this.easeInBounce(n,2*t,0,r,a)+e:.5*this.easeOutBounce(n,2*t-a,0,r,a)+.5*r+e}},c=[],f=0;return{add:function(n){var t=n.easing||"linear";if("function"!=typeof t){var e=String(t);if(t=s[e],!t)throw new Error('easing "'+e+'" does not exist')}var r=++f;return c.push(o.mix({easing:t,id:r,duration:n.duration||400},n,{overwrite:!1,ignoreNull:!1})),i||(i=setInterval(u,13)),r},remove:function(n,t){var u=r(n);if(-1!==u){var i=c.splice(u,1)[0];t&&a(i,1)}e()}}});