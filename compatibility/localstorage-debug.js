/*!
 * JRaiser 2 Javascript Library
 * localStorage implemented by userData
 * http://jraiser.org/ | Released under MIT license
 */
!function(window) {

if (window.localStorage) { return; }

var document = window.document, location = window.location;


var input = document.createElement('input');
input.type = 'hidden';
input.addBehavior('#default#userData');
document.body.insertBefore(input, document.body.firstChild);

var filename = location.hostname;
input.load(filename);


function save(expires) {
	if (!expires) {
		// 默认过期时间为1年
		expires = new Date();
		expires.setFullYear(expires.getFullYear() + 1);
	}
	input.expires = expires.toUTCString();
	input.save(filename);
}

window.localStorage = {
	getItem: function(key) {
		return input.getAttribute(key);
	},

	setItem: function(key, val) {
		input.setAttribute(key, val);
		save();
	},

	removeItem: function(key) {
		input.removeAttribute(key);
		save();
	},

	clear: function() {
		// 1979年12月31日23时59分59秒
		// 这是删除UserData的最靠前的一个有效expires时间了
		save( new Date(315532799000) );
		input.load(filename);
	}
};

}(window);