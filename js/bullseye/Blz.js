/*!
 * Blz
 * 
 * Bullseye is released under a permissive MIT license
 * Copyright (c) 2006-2010, makoto_kw (makoto.kw@gmail.com)
 */
// namespace of Blz(Bullseye)
if (typeof(Blz)=='undefined') Blz = {};
Blz.Util = {
	toArray: function(iterable) {
		if (!iterable) return [];
		if (iterable.toArray) return iterable.toArray();
		var results = [];
		for (var i = 0, length = iterable.length; i < length; i++) results.push(iterable[i]);
		return results;
	},
	extend: function(destination, source){
		for (var property in source) {
			destination[property] = source[property];
		}
		return destination;
	},
	removeInjectionsForWeb : function(str) {
		if (!str) return;
		str = String(str);
		str = str.replace(/[<>\"\'\\\n\r]/g, function(c) {
			c = escape(c);
			return c;
		});
		return str;
	}
}
