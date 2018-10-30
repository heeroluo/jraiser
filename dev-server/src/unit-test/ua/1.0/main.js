var UA = require('ua/1.0/ua');
var QUnit = window.QUnit;


var uaStrings = {
	android403Chrome: 'Mozilla/5.0 (Linux; U; Android-4.0.3; en-us; Galaxy Nexus Build/IML74K) AppleWebKit/535.7 (KHTML, like Gecko) CrMo/16.0.912.75 Mobile Safari/535.7',
	android421Chrome: 'Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko; googleweblight) Chrome/38.0.1025.166 Mobile Safari/535.19',
	winIE9: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)',
	winIE11: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
	winEdge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299',
	osxSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.7 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7',
	macOSChrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
	iPhoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_2 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/51.0.2704.104 Mobile/13F69 Safari/601.1.46',
	iPadSafari: 'Mozilla/5.0 (iPad; CPU OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.0 Mobile/14G60 Safari/602.1',
	iOSMQQBrowser: 'Mozilla/5.0 (iPhone 84; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.0 MQQBrowser/7.8.0 Mobile/14G60 Safari/8536.25 MttCustomUA/2 QBWebViewType/1 WKType/1',
	AndroidMUCBrowser: 'Mozilla/5.0 (Linux; U; Android 6.0.1; en-US; Redmi 3S Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/40.0.2214.89 UCBrowser/11.4.8.1012 Mobile Safari/537.36',
	iOSWeixin: 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0_2 like Mac OS X) (Windows NT 6.1; WOW64) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12A405 MicroMessenger/5.4.2 NetType/WIFI',
	iOSQQ: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_2 like Mac OS X) AppleWebKit/602.3.12 (KHTML, like Gecko) Mobile/14C92 QQ/6.6.2.408 V1_IPH_SQ_6.6.2_1_APP_A Pixel/1080 Core/UIWebView NetType/WIFI',
	androidWeibo: 'Mozilla/5.0 (Linux; Android 8.1.0; ALP-AL00 Build/HUAWEIALP-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/68.0.3440.91 Mobile Safari/537.36 Weibo (HUAWEI-ALP-AL00__weibo__8.10.2__android__android8.1.0)',
	iOSWeiboIntl: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A404 WeiboIntliOS_3270'
};

QUnit.test('OS', function(assert) {
	var ua1 = new UA(uaStrings.android421Chrome);
	assert.strictEqual(ua1.isOS('Android', 'gte', '4.2.1'), true, 'Android');

	var ua2 = new UA(uaStrings.android403Chrome);
	assert.strictEqual(ua2.isOS('Android', 'eq', '4.0.3'), true, 'Android');

	var ua3 = new UA(uaStrings.winIE9);
	assert.strictEqual(ua3.isOS('pcWindows', 'lt', '7.0'), true, 'Windows(PC)');

	var ua4 = new UA(uaStrings.osxSafari);
	assert.strictEqual(ua4.isOS('macOS', 'eq', '10.11.6'), true, 'OS X');

	var ua5 = new UA(uaStrings.macOSChrome);
	assert.strictEqual(ua5.isOS('macOS'), true, 'macOS');

	var ua6 = new UA(uaStrings.iPhoneChrome);
	assert.strictEqual(ua6.isOS('iOS'), true, 'iOS(iPhone)');

	var ua7 = new UA(uaStrings.iPadSafari);
	assert.strictEqual(ua7.isOS('iOS'), true, 'iOS(iPad)');
});

QUnit.test('Browser core', function(assert) {
	var ua = new UA(uaStrings.android403Chrome);
	assert.strictEqual(ua.isBrowserCore('Webkit', 'eq', '535.7'), true);
});

QUnit.test('Browser', function(assert) {
	var ua1 = new UA(uaStrings.winIE11);
	assert.strictEqual(ua1.isBrowser('IE', 'eq', '11'), true, 'IE 11');

	var ua2 = new UA(uaStrings.winIE9);
	assert.strictEqual(ua2.isBrowser('IE', 'eq', '9.0'), true, 'IE 9');

	var ua3 = new UA(uaStrings.android403Chrome);
	assert.strictEqual(ua3.isBrowser('Chrome', 'gte', '16.0'), true, 'Android Chrome');

	var ua4 = new UA(uaStrings.android421Chrome);
	assert.strictEqual(ua4.isBrowser('Chrome'), true, 'Android Chrome');

	var ua5 = new UA(uaStrings.iPhoneChrome);
	assert.strictEqual(ua5.isBrowser('Chrome'), true, 'iPhone Chrome');

	var ua6 = new UA(uaStrings.winEdge);
	assert.strictEqual(ua6.isBrowser('Edge', 'gt', '16.0'), true, 'Edge');

	var ua7 = new UA(uaStrings.iOSMQQBrowser);
	assert.strictEqual(ua7.isBrowser('mQQ', 'eq', '7.8.0'), true, 'MQQ Browser');

	var ua8 = new UA(uaStrings.AndroidMUCBrowser);
	assert.strictEqual(ua8.isBrowser('mUC', 'gt', '11.4'), true, 'MUC Browser');
});

QUnit.test('Client', function(assert) {
	var ua1 = new UA(uaStrings.iOSWeixin);
	assert.strictEqual(ua1.isClient('Weixin', 'eq', '5.4.2'), true, 'Weixin');

	var ua2 = new UA(uaStrings.iOSQQ);
	assert.strictEqual(ua2.isClient('mQQ', 'gte', '6.6.2'), true, 'mQQ');

	var ua3 = new UA(uaStrings.androidWeibo);
	assert.strictEqual(ua3.isClient('Weibo'), true, 'Weibo');

	var ua4 = new UA(uaStrings.iOSWeiboIntl);
	assert.strictEqual(ua4.isClient('Weibo'), true, 'Weibo Intl');
});