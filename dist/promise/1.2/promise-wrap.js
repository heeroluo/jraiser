define("promise/1.2/promise-wrap",["base/1.2/base"],function(n,t,e){"use strict";var r=n("../../base/1.2/base").createClass(function(n){this._promise=new Promise(n)},{then:function(t,e){var i=this;return new r(function(n){n(i._promise.then(t,e))})},spread:function(t,e){var i=this;return new r(function(n){n(i._promise.then(function(n){return t.apply(this,n)},e))})},"catch":function(t){var e=this;return new r(function(n){n(e._promise["catch"](t))})},"finally":function(i){var n=this;return new r(function(t,e){n._promise.then(function(n){i.apply(this,arguments),t(n)},function(n){i.apply(this,arguments),e(n)})})}});["all","race","reject","resolve"].forEach(function(n){r[n]=Promise[n]}),e.exports=r});