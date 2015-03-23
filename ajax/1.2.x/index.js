/*!
 * JRaiser 2 Javascript Library
 * querystring - v1.0.1 (2013-11-13T11:08:26+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("querystring/1.0.x/",null,function(e){"use strict";function n(e,n,r){return r(e)+(null==n?"":"="+r(n))}var r=e("base/1.0.x/");return{stringify:function(e,t){if("string"==typeof e)return e;t=r.extend({encode:encodeURIComponent},t);var i=[];if(r.isArray(e))e.forEach(function(e){i.push(n(e.name,e.value,t.encode))});else for(var a in e)i.push(n(a,e[a],t.encode));return i.join("&")},parse:function(e,n){n=r.extend({decode:decodeURIComponent},n);var t="array"===n.dataType,i=t?[]:{};e=(e||window.location.search.substr(1)).replace(/(?:^|&)([^&]+)=([^&]+)/g,function(e,r,a){var u=a;try{u=n.decode(u)}catch(o){}return t?i.push({name:r,value:u}):i[r]=u,""}).split("&");for(var a=0;a<e.length;a++)e[a]&&(t?i.push({name:e[a],value:null}):i[e[a]]=null);return i},append:function(e,n,t){if(!n||r.isEmptyObject(n)||r.isArray(n)&&!n.length)return e;"string"!=typeof n&&(n=this.stringify(n,t)),n=n.replace(/^[?&]+/,"");var i=e.indexOf("#"),a="";return-1!==i&&(a=e.substring(i,e.length),e=e.substring(0,i)),e=e.replace(/[?&]+$/,""),e+(-1===e.indexOf("?")?"?":"&")+n+a}}});
/*!
 * JRaiser 2 Javascript Library
 * ajax - v1.2.0 (2015-03-23T17:49:44+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("ajax/1.2.x/",["base/1.0.x/"],function(e){"use strict";function t(e){return function(t,n){"function"==typeof n?n={onload:n}:n||(n={}),n.data&&(t=c.append(t,n.data)),n.callbackName&&(t=c.append(t,{callback:n.callbackName})),n.nocache&&(t=c.append(t,{_:+new Date}));for(var a=[t,n],o=arguments.length-1;o>1;o--)a.push(arguments[o]);e.apply(this,a)}}function n(e,t,n){function a(){o.parentNode&&o.parentNode.removeChild(o),n&&r.deleteGlobalVar(n),l("success")}var o=document.createElement("div");o.style.display="none";var c="form-target-"+r.uniqueRndStr(10);o.innerHTML='<form action="'+e+'" target="'+c+'" method="post"><input type="hidden" name="callback" value="'+n+'" /></form><iframe name="'+c+'" id="'+c+'"></iframe>';var i=o.firstChild;t.data&&r.each(t.data,function(e,t){var n=document.createElement("input");n.type="hidden",n.name=t,n.value=e,i.appendChild(n)});var s;n&&(window[n]=function(){!s&&t.onsuccess&&t.onsuccess.apply(window,arguments)});var l=r.once(function(e){s=e,t.onload&&t.onload.call(window,s)}),d=document.body;d.insertBefore(o,d.firstChild),i.submit();var u=i.nextSibling;u.addEventListener?u.addEventListener("load",a,!1):u.attachEvent&&u.attachEvent("onload",a);var m=Number(t.timeout);return m>0&&setTimeout(function(){l("timeout")},m),{abort:function(){l("aborted")}}}function a(e){var t=document.createElement("a");t.href=e;var n=t.pathname.split("/");n=(n[n.length-1]||"index").replace(/\.\w+$/,"");for(var a=(t.host+n).replace(/[^\w]+/g,""),o=a,r=0;window[o];)o=a+"_"+r++;return o}function o(e,t){t=r.mix({},t,{ignoreNull:!0});var o;return/[?&]callback=([^&]+)/.test(e)&&(o=RegExp.$1),o?delete t.callbackName:o=t.callbackName=t.callbackName||"jsonp_callback_"+a(e),t.onload=function(){t.oncomplete&&t.oncomplete.apply(window,arguments)},t.method&&"POST"===t.method.toUpperCase()?n(e,t,o):s(e,t,o)}var r=e("base/1.0.x/"),c=e("querystring/1.0.x/"),i="onload"in document.createElement("script")?"onload":"onreadystatechange",s=t(function(e,t,n){var a,o=document.getElementsByTagName("head")[0],c=document.createElement("script"),s=r.once(function(e){a=e,t.onload&&t.onload.call(window,a)}),l=function(){(!c.readyState||/loaded|complete/.test(c.readyState))&&(c[i]=null,c.parentNode&&c.parentNode.removeChild(c),c=null,n&&r.deleteGlobalVar(n),s("success"))};n&&(window[n]=function(){!a&&t.onsuccess&&t.onsuccess.apply(window,arguments)}),t.charset&&(c.charset=t.charset),c.async=!0,c[i]=l,c.src=e,o.insertBefore(c,o.firstChild);var d=Number(t.timeout);return d>0&&setTimeout(function(){s("timeout")},d),{abort:function(){s("aborted")}}}),l={},d=t(function(e,t){var n=new Image,a=Math.random();l[a]=n,n.onload=n.onabort=n.onerror=function(){delete l[a],t.onload&&t.onload.call(window)},n.src=e}),u=window.ActiveXObject?function(){try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(e){}}:function(){try{return new XMLHttpRequest}catch(e){}};return{createXHR:u,serializeForm:function(e,t){if("nodeType"in e||"function"!=typeof e.get||(e=e.get(0)),"FORM"!==e.tagName)throw new Error("invalid form element");for(var n,a=[],o=e.elements,r=0;n=o[r];r++)!n.disabled&&n.name&&("INPUT"!==n.tagName||"radio"!==n.type&&"checkbox"!==n.type||n.checked)&&a.push({name:n.name,value:n.value.trim()});switch(t){case"string":a=c.stringify(a);break;case"map":for(var i={},r=0;r<a.length;r++)i[a[r].name]=a[r].value;a=i}return a},getScript:s,jsonp:o,getCSS:function(e,t){var n=document.createElement("link"),a=r.extend({rel:"stylesheet",type:"text/css",href:e},t.props);for(var o in a)n[o]=a[o];return document.getElementsByTagName("head")[0].appendChild(n),n},getImage:d,send:function(e,t){"string"!=typeof e&&(t=e,e=t.url);var n=t.dataType;if(n&&(n=n.toLowerCase()),"jsonp"===n)return o(e,r.mix({},t,{whiteList:["data","callbackName","onsuccess","oncomplete","charset","nocache","timeout","method"],ignoreNull:!0}));var a=function(e,a){var o=m.readyState;if(4===o||a){var r,c=4===o?m.status:0;if(c>=200&&300>c||1223===c||304===c?(r="onsuccess",a="success"):(c||a)&&(r="onerror",a||(a="error")),t.onload&&t.onload.call(window,m,a),r){var i;if("onsuccess"===r)switch(n){case"json":var s=(m.responseText||"").trim();if(s)try{i=JSON.parse(s)}catch(e){r="onerror",a="parsererror"}break;case"xml":i=m.responseXML,i&&!i.documentElement&&(i=null),i||(r="onerror",a="parsererror");break;default:i=m.responseText}var l=t[r],d=[m,a];"onsuccess"===r&&d.unshift(i),l&&l.apply(window,d)}t.oncomplete&&t.oncomplete.call(window,m,a)}},i=(t.method||"GET").toUpperCase(),s="boolean"==typeof t.async?s:!0,l=t.data,d=t.headers||{},m=t.xhr||u();if(l)switch(l=c.stringify(l),i){case"GET":e=c.append(e,l),l=null;break;case"POST":r.mix(d,{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},{overwrite:!1})}if(t.nocache!==!1&&(e=c.append(e,{_:+new Date})),s){var p=Number(t.timeout);p>0&&setTimeout(function(){4!==m.readyState&&(m.abort(),a.call(m,null,"timeout"))},p),m.onreadystatechange=a}t.username?m.open(i,e,s,t.username,t.password):m.open(i,e,s),d["X-Requested-With"]||(d["X-Requested-With"]="XMLHttpRequest");for(var f in d)m.setRequestHeader(f,d[f]);return t.onbeforesend&&t.onbeforesend.call(window,m),m.send(l||""),s||a.call(m),m}}});