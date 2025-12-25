function empty() {}
const log = (typeof console !== 'undefined' && typeof console.log !== 'undefined') ? console.log : empty;

function msg(key, args) {
  try {
    if (typeof chrome !== 'undefined' && chrome && typeof chrome.i18n !== 'undefined') {
      return chrome.i18n.getMessage(key, args);
    }
  } catch (e) {
    // ignore and fall back
  }
  return key;
}

function setPref(key, value) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage[key] = value;
    }
  } catch (e) {
    log(e);
  }
}

function getPref(key, defaultValue) {
  let value = defaultValue;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      value = window.localStorage[key] ?? defaultValue;
    }
  } catch (e) {
    log(e);
  }
  return value;
}

export class WorldClocks {}
const w: any = WorldClocks;
w.msg = msg;
w.pref = { get: getPref, set: setPref };
w.log = log;

