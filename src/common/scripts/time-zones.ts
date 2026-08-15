import data from '@/common/data/time-zones.json';

export interface TimeZoneEntry {
  id: string;
  country: string;
  countryCode: string;
  comment?: string;
  aliases: string[];
  offsetMinutes?: number[];
}

interface TimeZoneData {
  tzdbVersion: string;
  zones: TimeZoneEntry[];
}

const timeZoneData = data as TimeZoneData;

export const tzdbVersion = timeZoneData.tzdbVersion;
export const timeZones: TimeZoneEntry[] = timeZoneData.zones;

let supportedTimeZoneIds: Set<string> | null | undefined;

function normalizeSearchText(value: string): string {
  // Fold accents and timezone separators so searches like "cote", "new york",
  // and "America New_York" match the same catalog text.
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_/-]/g, ' ')
    .toLowerCase();
}

function getSupportedTimeZoneIdSet(): Set<string> | null {
  if (supportedTimeZoneIds !== undefined) {
    return supportedTimeZoneIds;
  }

  const supportedValuesOf = (
    Intl as typeof Intl & {
      supportedValuesOf?: (key: 'timeZone') => string[];
    }
  ).supportedValuesOf;

  supportedTimeZoneIds =
    typeof supportedValuesOf === 'function' ? new Set(supportedValuesOf('timeZone')) : null;

  return supportedTimeZoneIds;
}

function parseOffsetQuery(query: string): number | null {
  const match = query
    .trim()
    .match(/^(?:utc|gmt)?\s*([+-]?)(\d{1,2})(?:(?::?([0-5]\d))|(?:\.(\d{1,2})))?$/i);
  if (!match) {
    return null;
  }

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const colonMinutes = match[3] ? Number(match[3]) : null;
  const decimalMinutes = match[4] ? Math.round(Number(`0.${match[4]}`) * 60) : null;
  const minutes = colonMinutes ?? decimalMinutes ?? 0;
  const offsetMinutes = sign * (hours * 60 + minutes);

  return offsetMinutes >= -12 * 60 && offsetMinutes <= 14 * 60 ? offsetMinutes : null;
}

export function isTimeZoneSupported(zoneId: string): boolean {
  const supportedIds = getSupportedTimeZoneIdSet();
  return supportedIds === null || supportedIds.has(zoneId);
}

export function supportedTimeZones(entries: TimeZoneEntry[] = timeZones): TimeZoneEntry[] {
  return entries.filter((entry) => isTimeZoneSupported(entry.id));
}

export function timeZoneCityName(zoneId: string): string {
  return (zoneId.split('/').pop() || zoneId).replace(/_/g, ' ');
}

export function formatTimeZoneLabel(entry: TimeZoneEntry): string {
  const city = timeZoneCityName(entry.id);
  const region = entry.comment ? `${entry.country} - ${entry.comment}` : entry.country;
  return `${city}, ${region} (${entry.id})`;
}

export function timeZoneSearchText(entry: TimeZoneEntry): string {
  return normalizeSearchText(
    [
      entry.id,
      timeZoneCityName(entry.id),
      entry.country,
      entry.countryCode,
      entry.comment || '',
      ...entry.aliases,
    ].join(' '),
  );
}

export function searchTimeZones(
  query: string,
  entries: TimeZoneEntry[] = supportedTimeZones(),
): TimeZoneEntry[] {
  const normalizedQuery = normalizeSearchText(query.trim());
  if (!normalizedQuery) {
    return entries;
  }

  const offsetMinutes = parseOffsetQuery(query);

  return entries.filter(
    (entry) =>
      timeZoneSearchText(entry).includes(normalizedQuery) ||
      (offsetMinutes !== null && (entry.offsetMinutes || []).includes(offsetMinutes)),
  );
}
