window.testUtils = {};
(function(testUtils) {
	testUtils.getErrByType = function(value) {
		var type = '',
			valueDisplay = JSON.stringify(value);;
		if (typeof value === 'object') {
			switch(Object.prototype.toString.call(value)) {
				case '[object Array]':
					type = 'Array';
					break;
				default:
					type = 'Object'
			}
		} else {
			type = typeof value;
		}
		return '非法值-' + type + '类型-' + valueDisplay;
	}
	testUtils.parseDom = function(arg) {
	　　 var objE = document.createElement("div");
	　　 objE.innerHTML = arg;
	　　 return objE.childNodes;
	};
})(window.testUtils);