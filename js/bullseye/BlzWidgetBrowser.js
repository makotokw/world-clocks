/*!
 * Blz.Widget.Browser
 *
 * Bullseye is released under a permissive MIT license
 * Copyright (c) 2006-2010, makoto_kw (makoto.kw@gmail.com)
 */
Blz.Util.extend(Blz.Widget, {
	initialize: function() {
		this.isComSupported = (typeof(ActiveXObject) != 'undefined') ? true : false;
		if (typeof(Blz.Cookie) != "undefined") {
			this.cookie = Blz.Cookie;
			this.cookie.initialize();
		}
	},
	
	// Global function
	engine: Blz.Widget.Engines.Browser,
	getPlatform: function() {
		if (Ext.isWindows) return Blz.Widget.Platforms.Windows;
		else if (Ext.isMac) return Blz.Widget.Platforms.MacOSX;
		else if (Ext.isLinux) return Blz.Widget.Platforms.Linux;
		return Blz.Widget.Platforms.Unknown;
	},
	debug: function(str) {
		console.log(str);
	},
	print: function(str) {
		console.log(str);
	},
	
	// Windows COM Supported
	connectComObject: function(object, prefix) {
	},
	createComObject: function(guid) {
		return new ActiveXObject(guid);
	},
	disconnectComObject: function(object) {
	},
	
	// Widget
	name: "",
	version: "",
	author: "",
	company: "",
	setPref: function(key, value) {
		try {
			if (window.localStorage) {
				localStorage[key] = value;
			} else {
				this.cookie.setCookie(key, value);
			}
		} catch (e) {
		}
	},
	getPref: function(key, defaultValue) {
		var value = defaultValue;
		try {
			if (window.localStorage) {
				value = localStorage[key] || defaultValue;
			} else {
				value = this.cookie.getCookie(key);
			}
		} catch (e) {
		}
		return value;
	},
	getResourceString: function(key, args) {
		if (typeof(chrome) != "undefined" && typeof(chrome.i18n) != "undefined") {
			return chrome.i18n.getMessage(key, args);
		}
		return key;
	}
});
