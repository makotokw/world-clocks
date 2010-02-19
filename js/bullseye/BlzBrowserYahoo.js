/*!
 * Blz.Browser for Yahoo! Widget Engine
 * 
 * Bullseye is released under a permissive MIT license
 * Copyright (c) 2006-2010, makoto_kw (makoto.kw@gmail.com)
 */

var navigator = {
	userAgent:{
		toLowerCase: function(){
			window.Ext = Ext; // hack!
			return "";
		}
	}
}

function setInterval(code, interval) {
	var t = new Timer();
	t.interval = interval / 1000;  // to second
	t.onTimerFired = code;
	t.ticking = true;
	return t;
}
function clearInterval(t) {
	t.ticking = false;
}
function setTimeout(code, delay) {
	var t = new Timer();
	t.interval = delay / 1000; // to second
	t.onTimerFired = function(){
		t.ticking=false;
		((typeof code) == "function") ? code() : eval(code);
	};
	t.ticking = true;
	return t;
}
function clearTimeout(t) {
	t.ticking = false;
}
var window = {
	setInterval:setInterval,
	clearInterval:clearInterval,
	setTimeout:setTimeout,
	clearTimeout:clearTimeout,
	location:{}
}