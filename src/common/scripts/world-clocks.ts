import IanaLocale from './locale/iana-locale';
import LocaleRepository from './locale/locale-repository';

class WorldClocks {
  private readonly localeRepository = new LocaleRepository();

  msg(key: string, args?: string | (string | number)[]): string {
    try {
      if (typeof chrome !== 'undefined' && chrome && typeof chrome.i18n !== 'undefined') {
        return chrome.i18n.getMessage(key, args);
      }
    } catch {
      // ignore and fall back
    }
    return key;
  }

  pref = {
    get: this.getPref.bind(this),
    set: this.setPref.bind(this),
  };

  private setPref(key: string, value: string | number | boolean): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, String(value));
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

  get localLocale(): IanaLocale {
    const zoneId = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    return new IanaLocale(this.msg('LOCAL_TIME'), zoneId);
  }

  get defaultLocales(): IanaLocale[] {
    return [
      this.localLocale,
      new IanaLocale(this.msg('LONDON'), 'Europe/London'),
      new IanaLocale(this.msg('SANJOSE'), 'America/Los_Angeles'),
      new IanaLocale(this.msg('TOKYO'), 'Asia/Tokyo'),
    ];
  }

  loadLocales(): IanaLocale[] {
    return this.localeRepository.load() || this.defaultLocales;
  }

  saveLocales(locales: IanaLocale[]) {
    this.localeRepository.save(locales);
  }
}

export default new WorldClocks();
