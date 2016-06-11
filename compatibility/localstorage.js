/*!
 * JRaiser 2 Javascript Library
 * localStorage implemented by UserData
 * http://jraiser.org/ | Released under MIT license
 */
!function(t){function e(t,e){function i(n){n?r.expires=n.toUTCString():e&&(r.expires=e),r.save(t)}var r=n.createElement("input");r.type="hidden",r.addBehavior("#default#userData"),n.body.insertBefore(r,n.body.firstChild),t=t.replace(":","$"),r.load(t),this.getItem=function(e){return r.load(t),r.getAttribute(e)},this.setItem=function(t,e){r.setAttribute(t,e),i()},this.removeItem=function(t){r.removeAttribute(t),i()},this.clear=function(){i(new Date(315532799e3))}}if(!t.localStorage){var n=t.document,i=t.location;t.localStorage=function(){var t=new Date;return t.setFullYear(t.getFullYear()+1),new e(i.host,t.toUTCString())}()}}(window);