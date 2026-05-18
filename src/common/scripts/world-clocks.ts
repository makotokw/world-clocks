import Locale from './locale.ts';

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

  get localLocale(): Locale {
    const localeTime = new Date();
    const localeOffset = localeTime.getTimezoneOffset() / -60.0;
    return { label: this.msg('LOCAL_TIME'), offset: localeOffset, dst: false };
  }

  get defaultLocales(): Locale[] {
    const localeTime = new Date();
    const localeOffset = localeTime.getTimezoneOffset() / -60.0;
    return [
      this.localLocale,
      { label: this.msg('LONDON'), offset: 0, dst: false },
      { label: this.msg('SANJOSE'), offset: -8, dst: false },
      { label: this.msg('TOKYO'), offset: 9, dst: false },
    ];
  }

  loadLocales(): Locale[] {
    let storedLocales = this.pref.get('locales');
    if (!storedLocales) {
      return this.defaultLocales;
    }
    try {
      const parsed = JSON.parse(storedLocales);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map(
        (item: any): Locale => ({
          label: String(item.label || ''),
          offset:
            typeof item.offset === 'string' ? parseFloat(item.offset) : Number(item.offset || 0),
          dst: !!item.dst,
        }),
      );
    } catch (e) {
      return [];
    }
  }

  saveLocales(locales: Locale[]) {
    this.pref.set('locales', JSON.stringify(locales));
  }
}

export default new WorldClocks();
