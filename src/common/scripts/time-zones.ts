import data from '@/common/data/time-zones.json';

export interface TimeZoneEntry {
  id: string;
  country: string;
  countryCode: string;
  comment?: string;
  aliases: string[];
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
  limit = 50,
): TimeZoneEntry[] {
  const normalizedQuery = normalizeSearchText(query.trim());
  const candidates = normalizedQuery
    ? entries.filter((entry) => timeZoneSearchText(entry).includes(normalizedQuery))
    : entries;

  return limit > 0 ? candidates.slice(0, limit) : candidates;
}
