bowljs.config({
	libPath: '../../../',
	preload: [
		Function.prototype.bind ? '' : 'compatibility/es5-shim',
		window.JSON ? '' : 'compatibility/json2',
		window.localStorage ? '' : 'compatibility/localstorage'
	]
});