class WorldClocks {
  msg(key: string, args?: any): string {
    try {
      if (typeof chrome !== 'undefined' && chrome && typeof chrome.i18n !== 'undefined') {
        return chrome.i18n.getMessage(key, args);
      }
    } catch (e) {
      // ignore and fall back
    }
    return key;
  }

  pref = {
    get: this.getPref.bind(this),
    set: this.setPref.bind(this),
  };

  private setPref(key: string, value: any): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error(e);
    }
  }

  private getPref<T>(key: string, defaultValue: T): T {
    let value = defaultValue;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedValue = window.localStorage.getItem(key);
        if (storedValue !== null) {
          value = storedValue as unknown as T;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return value;
  }
}

export default new WorldClocks();

