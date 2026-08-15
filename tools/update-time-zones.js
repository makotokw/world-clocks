#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SOURCE_URL = 'https://nodatime.org/TimeZones?format=json';
const ZONE_TAB_URL = 'https://data.iana.org/time-zones/tzdb/zone.tab';
const OUTPUT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/common/data/time-zones.json',
);
const offsetReferenceYear = new Date().getUTCFullYear();
const OFFSET_REFERENCE_DATES = [
  new Date(Date.UTC(offsetReferenceYear, 0, 1, 12)),
  new Date(Date.UTC(offsetReferenceYear, 6, 1, 12)),
];
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

function asString(value, fieldName) {
  if (typeof value !== 'string') {
    throw new TypeError(`Expected ${fieldName} to be a string`);
  }
  return value;
}

function asStringArray(value, fieldName) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new TypeError(`Expected ${fieldName} to be an array of strings`);
  }
  return value;
}

function parseZoneTab(value) {
  const locationsByZoneId = new Map();

  for (const line of value.split('\n')) {
    if (!line || line.startsWith('#')) {
      continue;
    }

    const [countryCodes, , zoneId, comment] = line.split('\t');
    if (!countryCodes || !zoneId) {
      continue;
    }

    const countries = countryCodes.split(',').map((countryCode) => ({
      code: countryCode,
      name: regionNames.of(countryCode) || countryCode,
    }));

    locationsByZoneId.set(zoneId, {
      countries,
      country: countries.map((country) => country.name).join(', '),
      countryCode: countries.map((country) => country.code).join(','),
      comment: comment || undefined,
    });
  }

  return locationsByZoneId;
}

function partsToUtcTimestamp(parts, milliseconds) {
  return Date.UTC(
    parts.get('year') || 1970,
    (parts.get('month') || 1) - 1,
    parts.get('day') || 1,
    parts.get('hour') || 0,
    parts.get('minute') || 0,
    parts.get('second') || 0,
    milliseconds,
  );
}

function offsetMinutesAt(zoneId, date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    calendar: 'gregory',
    numberingSystem: 'latn',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: zoneId,
  });
  const parts = new Map(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );

  return Math.round((partsToUtcTimestamp(parts, date.getMilliseconds()) - date.getTime()) / 60000);
}

function offsetMinutes(zoneId) {
  return [...new Set(OFFSET_REFERENCE_DATES.map((date) => offsetMinutesAt(zoneId, date)))].sort(
    (a, b) => a - b,
  );
}

function normalizeZone(zone) {
  if (!zone || typeof zone !== 'object') {
    throw new TypeError('Expected zone to be an object');
  }

  const location = zone.location;
  const entry = {
    id: asString(zone.id, 'zone.id'),
    country: asString(location.countryName, `${zone.id}.location.countryName`),
    countryCode: asString(location.countryCode, `${zone.id}.location.countryCode`),
    aliases: asStringArray(zone.aliases ?? [], `${zone.id}.aliases`),
    offsetMinutes: offsetMinutes(zone.id),
  };

  if (typeof location.comment === 'string' && location.comment.length > 0) {
    entry.comment = location.comment;
  }

  return entry;
}

function normalizeAliasZone(alias, aliasLocation) {
  const entry = {
    id: alias,
    country: aliasLocation.country,
    countryCode: aliasLocation.countryCode,
    aliases: [],
    offsetMinutes: offsetMinutes(alias),
  };

  if (aliasLocation.comment) {
    entry.comment = aliasLocation.comment;
  }

  return entry;
}

function locationBackedAliasZones(zones, locationsByZoneId) {
  const canonicalZoneIds = new Set(zones.map((zone) => zone.id));
  const entriesById = new Map();

  for (const zone of zones) {
    for (const alias of zone.aliases) {
      const aliasLocation = locationsByZoneId.get(alias);
      if (!aliasLocation || canonicalZoneIds.has(alias)) {
        continue;
      }

      entriesById.set(alias, normalizeAliasZone(alias, aliasLocation));
    }
  }

  return [...entriesById.values()];
}

function removeLocationBackedAliases(zones, aliasZones) {
  const locationBackedAliasIds = new Set(aliasZones.map((zone) => zone.id));

  return zones.map((zone) => ({
    ...zone,
    aliases: zone.aliases.filter((alias) => !locationBackedAliasIds.has(alias)),
  }));
}

function sortZones(zones) {
  return zones.sort((a, b) => a.id.localeCompare(b.id));
}

async function main() {
  const [sourceResponse, zoneTabResponse] = await Promise.all([
    fetch(SOURCE_URL),
    fetch(ZONE_TAB_URL),
  ]);
  if (!sourceResponse.ok) {
    throw new Error(
      `Failed to fetch ${SOURCE_URL}: ${sourceResponse.status} ${sourceResponse.statusText}`,
    );
  }
  if (!zoneTabResponse.ok) {
    throw new Error(
      `Failed to fetch ${ZONE_TAB_URL}: ${zoneTabResponse.status} ${zoneTabResponse.statusText}`,
    );
  }

  const source = await sourceResponse.json();
  const locationsByZoneId = parseZoneTab(await zoneTabResponse.text());
  const tzdbVersion = asString(source.ianaVersion, 'ianaVersion');
  if (!Array.isArray(source.zones)) {
    throw new TypeError('Expected zones to be an array');
  }

  const canonicalZones = source.zones
    .filter((zone) => zone.location && typeof zone.location === 'object')
    .map(normalizeZone);
  const aliasZones = locationBackedAliasZones(canonicalZones, locationsByZoneId);
  const prunedCanonicalZones = removeLocationBackedAliases(canonicalZones, aliasZones);
  const output = {
    tzdbVersion,
    zones: sortZones([...prunedCanonicalZones, ...aliasZones]),
  };

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);

  console.log(`Wrote ${output.zones.length} time zones from TZDB ${tzdbVersion}`);
  console.log(OUTPUT_PATH);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
