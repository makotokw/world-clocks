// Numeric calendar fields parsed from Intl.DateTimeFormat#formatToParts.
// These match JavaScript Date constructor inputs except month is still 1-based
// here because it mirrors the formatted calendar value; callers subtract 1 when
// constructing a local Date.
interface DateTimeParts {
  /** Full calendar year, for example, 2026. */
  year: number;
  /** Calendar month, 1-12. */
  month: number;
  /** Calendar day of the month, 1-31. */
  day: number;
  /** 24-hour clock hour, 0-23. */
  hour: number;
  /** Minute, 0-59. */
  minute: number;
  /** Second, 0-59. */
  second: number;
}

export interface SerializedIanaLocale {
  type: typeof IanaLocale.storageType;
  label?: unknown;
  zoneId?: unknown;
}

const formatterOptions: Intl.DateTimeFormatOptions = {
  calendar: 'gregory',
  numberingSystem: 'latn',
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

function formatParts(timeZone: string, now: Date): DateTimeParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    ...formatterOptions,
    timeZone,
  });
  const values = new Map(
    formatter
      .formatToParts(now)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    year: values.get('year') || 1970,
    month: values.get('month') || 1,
    day: values.get('day') || 1,
    hour: values.get('hour') || 0,
    minute: values.get('minute') || 0,
    second: values.get('second') || 0,
  };
}

function safeFormatParts(timeZone: string, now: Date): DateTimeParts {
  try {
    return formatParts(timeZone, now);
  } catch {
    return formatParts('UTC', now);
  }
}

function partsToUtcTimestamp(parts: DateTimeParts, milliseconds: number): number {
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    milliseconds,
  );
}

export default class IanaLocale {
  static readonly storageType = 'iana';

  constructor(
    public label: string,
    public zoneId: string,
  ) {}

  static isSerialized(raw: unknown): raw is SerializedIanaLocale {
    return !!raw && typeof raw === 'object' && 'type' in raw && raw.type === IanaLocale.storageType;
  }

  static fromSerialized(raw: SerializedIanaLocale): IanaLocale {
    return new IanaLocale(
      String(raw.label || ''),
      typeof raw.zoneId === 'string' ? raw.zoneId : 'UTC',
    );
  }

  serialize(): SerializedIanaLocale {
    return {
      type: IanaLocale.storageType,
      label: this.label,
      zoneId: this.zoneId,
    };
  }

  currentTime(now: Date = new Date()): Date {
    const parts = safeFormatParts(this.zoneId, now);
    return new Date(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
      now.getMilliseconds(),
    );
  }

  currentOffsetHours(now: Date = new Date()): number {
    const parts = safeFormatParts(this.zoneId, now);
    const zonedTimestamp = partsToUtcTimestamp(parts, now.getMilliseconds());
    return (zonedTimestamp - now.getTime()) / (60 * 60 * 1000);
  }
}
