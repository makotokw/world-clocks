/*!
 * Blz.Widget
 * 
 * Bullseye is released under a permissive MIT license
 * Copyright (c) 2006-2010, makoto_kw (makoto.kw@gmail.com)
 */
Blz.Widget = {
	// enum
	Engines: {
		Browser:"browser",
		Yahoo:"yahoo",
		iGoogle:"igoogle",
		GoogleDesktop:"googledesktop",
		VistaSidebar:"sidebar",
		Unknown:"unknown"
	},
	Platforms: {
		Windows:"windows",
		MacOSX:"macosx",
		Linux:"linux",
		Unknown:"unknown"
	},
	// core
	engine: "unknown",
	getPlatform: function() { return this.Platforms.Unknown; },
	getLocale:function() { return 'en'; },
	toPlatformPath: function(str) {
		if (!str ) return;
		if (this.getPlatform()==this.Platforms.Windows) {
			str = str.replace("/","\\");
		}
		return str;
	},
	alert:function(){},
	assert: function(expression){},
	debug: function(str) {},
	print: function(str) {},
	capabilities: {
		com: false,
		appleScript:false,
		dummy:false
	},
	// Windows COM Supported
	connectComObject: function(object, prefix) {},
	createComObject: function(guid) {return null;},
	disconnectComObject:  function(object) {},	
	// AppleScript Supported
	appleScript: function(commands){},
	createXmlHttpRequest: function() {
		var http = null;
		try {
			http = new XMLHttpRequest();
		} 
		catch (e) {
			if (window.ActiveXObject) {
				var activeX = ['MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];
				for (var i = 0, len = activeX.length; i < len; i++) {
					try {
						http = new ActiveXObject(activeX[i]);
						break;
					} 
					catch (e) {
					}
				}
			}
		}
		return http;
	},
	
	
	// widget global member/method
	name: "",
	version: "",
	author: "",
	company: "",
	close: function() {},
	focus: function() {},
	reload: function() {},
	showPref: function() {},
	setPref: function(key, value) {},
	getPref: function(key) {return '';},
	getResourceString: function(key) { return ''},
	getMenuSeparatorTitle: function() { return ''}
}