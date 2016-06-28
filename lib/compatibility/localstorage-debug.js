/*!
 * JRaiser 2 Javascript Library
 * localStorage implemented by UserData
 * http://jraiser.org/ | Released under MIT license
 */
!function(window) {

if (window.localStorage) { return; }

var document = window.document, location = window.location;


// 通过UserData模拟localStorage
function UserData(filename, expires) {
	var input = document.createElement('input');
	input.type = 'hidden';
	input.addBehavior('#default#userData');
	document.body.insertBefore(input, document.body.firstChild);

	// filename不能有冒号（端口号符号）
	filename = filename.replace(':', '$');
	input.load(filename);

	function save(anotherExpires) {
		if (anotherExpires) {
			input.expires = anotherExpires.toUTCString();
		} else if (expires) {
			input.expires = expires;
		}
		input.save(filename);
	}

	this.getItem = function(key) {
		input.load(filename);
		return input.getAttribute(key);
	};
	this.setItem = function(key, value) {
		input.setAttribute(key, value);
		save();
	};
	this.removeItem = function(key) {
		input.removeAttribute(key);
		save();
	};
	this.clear = function() {
		// 1979年12月31日23时59分59秒
		// 这是删除UserData的最靠前的一个有效expires时间了
		save( new Date(315532799000) );
	};
}


window.localStorage = (function() {
	var expires = new Date();
	expires.setFullYear(expires.getFullYear() + 1);

	return new UserData( location.host, expires.toUTCString() );
})();

}(window);