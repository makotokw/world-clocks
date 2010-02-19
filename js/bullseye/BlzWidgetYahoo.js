/*!
 * Blz.Widget for Yahoo! Widget Engine
 * 
 * Bullseye is released under a permissive MIT license
 * Copyright (c) 2006-2010, makoto_kw (makoto.kw@gmail.com)
 */

Blz.Util.extend(Blz.Widget, {
	initialize: function() {
	},
	
	// Global function
	engine: Blz.Widget.Engines.Yahoo,
	getPlatform: function() {
		var p = system.platform;
		if (p == "macintosh") return this.Platforms.MacOSX;
		else if (p == "windows") return this.Platforms.Windows;
		return this.Platforms.Unknown;
	},
	getLocale: function() {
		return widget.locale;
	},
	debug: function(str) {
		return print(str);
	},
	print: function(str) {
		return print(str);
	},
	beep: function() {
		return beep();
	},
	capabilities: {
		com: true,
		appleScript: true,
		dummy: false
	},
	// Windows COM Supported
	connectComObject: function(object, prefix) {
		return COM.connectObject(object, prefix);
	},
	createComObject: function(guid) {
		return COM.createObject(guid);
	},
	disconnectComObject: function(object) {
		return COM.disconnectObject(object);
	},
	
	// AppleScript Supported
	appleScript: function(str) {
		return appleScript(str);
	},
	
	createXmlHttpRequest: function() {
		return new XMLHttpRequest();
	},
	
	// Widget
	name: "",
	version: (typeof widget != "undefined" && widget.version) ? widget.version : "",
	author: (typeof widget != "undefined" && widget.author) ? widget.author : "",
	company: (typeof widget != "undefined" && widget.company) ? widget.company : "",
	close: function() {
		return closeWidget();
	},
	focus: function() {
		return focusWidget();
	},
	reload: function() {
		return reloadWidget();
	},
	showPref: function() {
		return showWidgetPreference();
	},
	setPref: function(key, value) {
		try {
			eval("preferences." + key + ".value = \"" + value + "\";");
		} catch (e) {
		}
	},
	getPref: function(key) {
		var value = "";
		try {
			eval("value = preferences." + key + ".value;");
		} catch (e) {
		}
		return value;
	},
	getResourceString: function(key) {
		return widget.getLocalizedString(key);
	},
	
	// ext
	isApplicationRunning: function(str) {
		return isApplicationRunning(str);
	},
	runCommand: function(str) {
		return runCommand(str);
	},
	alert: function(msg, button1, button2, button3) {
		if (button3) return alert(msg, button1, button2, button3);
		if (button2) return alert(msg, button1, button2);
		if (button1) return alert(msg, button1);
		return alert(msg);
	}
});
