/*!
 * JRaiser 2 Javascript Library
 * promise - v1.0.0 (2016-04-21T17:52:14+0800)
 * http://jraiser.org/ | Released under MIT license
 */
define("promise/1.0.x/",["base/1.1.x/"],function(n,t,e){"use strict";function i(n){return n&&"function"==typeof n.then&&2===n.then.length}var u=n("base/1.1.x/"),r="undefined"!=typeof console&&console.error?function(n){console.error("(in promise) "+n)}:function(){},o=0,c=1,s=2,f=u.createClass(function(n){if("function"!=typeof n)throw new Error("Executor must be a function");var t=this;t._status=o,t._pendings={},t._pendings[c]=[],t._pendings[s]=[];try{n(function(n){t._settle(c,n)},function(n){t._settle(s,n)})}catch(e){t._settle(s,e)}},{_settle:function(n,t){var e=this;e._status===o&&(e._status=n,e._value=t,e._pendings[n].forEach(function(n){n(t)}),delete e._pendings)},_listen:function(n,t){var e=this;e._status===o?e._pendings[n].push(t):e._status===n&&t(e._value)},then:function(n,t){var e=this;return new f(function(u,o){e._listen(c,function(){var t=e._value;if(n)try{t=n(t)}catch(c){r(t),o(c)}i(t)?t.then(u,o):u(t)}),e._listen(s,function(){var n=e._value;if(t){try{n=t(n)}catch(c){r(n),o(c)}i(n)?n.then(u,o):u(n)}else o(n)})})},"catch":function(n){return this.then(null,n)}});return u.extend(f,{all:function(n){var t=n.length;return t?new f(function(e,i){var u=new Array(t);n.forEach(function(n,r){n.then(function(n){u[r]=n,--t||e(u)},i)})}):f.resolve([])},resolve:function(n){return new f(function(t,e){t(n)})},reject:function(n){return new f(function(t,e){e(n)})}}),f});