window.bowljs.config({
	libPath: '/jraiser',
	appPath: '/unit-test',
	debug: false,
	preload: [
		Function.prototype.bind ? '' : 'shims/es5-shim.nmd.js',
		window.JSON ? '' : 'shims/json2.nmd.js',
		window.localStorage ? '' : 'shims/localstorage.nmd.js'
	]
});