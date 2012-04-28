var WorldClocks = {};
(function(w) {
    function empty() {};
    function msg(key, args) {
        if (typeof(chrome) != "undefined" && typeof(chrome.i18n) != "undefined") {
            return chrome.i18n.getMessage(key, args);
        }
        return key;
    }
    function setPref(key, value) {
        try {
            if (window.localStorage) {
                localStorage[key] = value;
            }
        } catch (e) {
        }
    }
    function getPref(key, defaultValue) {
        var value = defaultValue;
        try {
            if (window.localStorage) {
                value = localStorage[key] || defaultValue;
            }
        } catch (e) {
        }
        return value;
    }
    function log() {
        console.log.apply(console, arguments);
    }
    w.msg = msg;
    w.pref = {get:getPref, set:setPref};
    w.log = (typeof(console) != "undefined" && typeof(console.log) != "undefined") ? log : empty;
})(WorldClocks);

