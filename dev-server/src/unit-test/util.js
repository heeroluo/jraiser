exports.getType = function(value) {
	var toString = Object.prototype.toString;
	var type = '';
	var valueDisplay = JSON.stringify(value);
	if (typeof value === 'object') {
		switch (toString.call(value)) {
			case '[object Array]':
				type = 'array';
				break;
			case '[object Date]':
				type = 'date';
				break;
			default:
				type = 'object';
		}
	} else {
		type = typeof value;
	}
	return type + '(' + valueDisplay + ')';
};

exports.parseDOM = function(html) {
	var div = document.createElement('div');
	div.innerHTML = html;
	return div.childNodes[0];
};

exports.isEqual = function(o1, o2) {
	return JSON.stringify(o1) === JSON.stringify(o2);
};