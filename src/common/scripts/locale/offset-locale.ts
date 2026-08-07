export interface SerializedOffsetLocale {
  label?: unknown;
  offset: number | string;
  dst: unknown;
}

// Transitional type for the pre-IANA persisted model: numeric UTC offset plus manual DST.
// It stays isolated so the migration code can be removed cleanly after old data is no longer supported.
export default class OffsetLocale {
  constructor(
    public label: string,
    public offset: number,
    public dst: boolean,
  ) {}

  static isSerialized(raw: unknown): raw is SerializedOffsetLocale {
    return (
      !!raw &&
      typeof raw === 'object' &&
      'offset' in raw &&
      (typeof raw.offset === 'number' || typeof raw.offset === 'string') &&
      'dst' in raw
    );
  }

  static fromSerialized(raw: SerializedOffsetLocale): OffsetLocale {
    return new OffsetLocale(
      String(raw.label || ''),
      typeof raw.offset === 'string' ? parseFloat(raw.offset) : Number(raw.offset || 0),
      !!raw.dst,
    );
  }

  zoneMapKey(): string {
    return `${this.offset}|${this.dst}`;
  }
}
