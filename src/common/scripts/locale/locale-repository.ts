import IanaLocale from './iana-locale';
import OffsetLocale from './offset-locale';
import offsetLocaleZoneMap from './offset-locale-zone-map';
import LocalStorageStore from '../storage/local-storage-store';

const LOCALES_STORAGE_KEY = 'locales';
const FALLBACK_ZONE_ID = 'UTC';

export default class LocaleRepository {
  constructor(private readonly store = new LocalStorageStore()) {}

  load(): IanaLocale[] | null {
    const storedLocales = this.store.load(LOCALES_STORAGE_KEY);
    if (!storedLocales) {
      return null;
    }

    try {
      const parsed = JSON.parse(storedLocales);
      if (!Array.isArray(parsed)) {
        return null;
      }

      return parsed
        .map((item: unknown) => LocaleRepository.toIanaLocale(item))
        .filter((locale): locale is IanaLocale => locale !== null);
    } catch {
      return null;
    }
  }

  save(locales: IanaLocale[]): void {
    this.store.save(
      LOCALES_STORAGE_KEY,
      JSON.stringify(locales.map((locale) => locale.serialize())),
    );
  }

  private static toIanaLocale(raw: unknown): IanaLocale | null {
    if (IanaLocale.isSerialized(raw)) {
      return IanaLocale.fromSerialized(raw);
    }

    if (OffsetLocale.isSerialized(raw)) {
      const offsetLocale = OffsetLocale.fromSerialized(raw);
      const zoneId = offsetLocaleZoneMap[offsetLocale.zoneMapKey()] || FALLBACK_ZONE_ID;
      return new IanaLocale(offsetLocale.label, zoneId);
    }

    return null;
  }
}
