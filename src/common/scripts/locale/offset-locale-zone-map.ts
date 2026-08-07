// Migration-only map from the old offset/DST model to representative IANA zones.
// Keeping it outside LocaleRepository makes the eventual removal local to this file.
const OFFSET_LOCALE_ZONE_MAP: Record<string, string> = {
  // Eniwetok/Kwajalein represented a fixed UTC-12 choice in the old list.
  '-12|false': 'Pacific/Kwajalein',
  // No old UTC-12 entry had DST; keep the same representative if toggled.
  '-12|true': 'Pacific/Kwajalein',
  // Samoa/Midway old label maps best to American Samoa's canonical zone.
  '-11|false': 'Pacific/Pago_Pago',
  // No practical DST representative for UTC-11 in the old list.
  '-11|true': 'Pacific/Pago_Pago',
  // Hawaii has no DST and was the sole old UTC-10 representative.
  '-10|false': 'Pacific/Honolulu',
  // Old UTC-10 with DST most closely matches Alaska daylight time.
  '-10|true': 'America/Anchorage',
  // Alaska was the old UTC-9 representative.
  '-9|false': 'America/Anchorage',
  // Alaska also represents the old UTC-9 DST-enabled choice.
  '-9|true': 'America/Anchorage',
  // Phoenix preserves UTC-8 without DST more accurately than Pacific time.
  '-8|false': 'America/Phoenix',
  // Pacific Time was the first old UTC-8 label and observes DST.
  '-8|true': 'America/Los_Angeles',
  // Phoenix preserves UTC-7 without DST for old Mountain time users.
  '-7|false': 'America/Phoenix',
  // Denver is the canonical Mountain time DST representative.
  '-7|true': 'America/Denver',
  // Mexico City was listed in the old UTC-6 label and is now non-DST.
  '-6|false': 'America/Mexico_City',
  // Chicago is the canonical Central time DST representative.
  '-6|true': 'America/Chicago',
  // Bogota was listed in the old UTC-5 label and has no DST.
  '-5|false': 'America/Bogota',
  // New York is the canonical Eastern time DST representative.
  '-5|true': 'America/New_York',
  // Caracas was the old half-hour-free UTC-4.5 entry's named city.
  '-4.5|false': 'America/Caracas',
  // No current DST zone uses this old UTC-4.5 base offset.
  '-4.5|true': 'America/Caracas',
  // La Paz was listed in the old UTC-4 label and has no DST.
  '-4|false': 'America/La_Paz',
  // Halifax represents Atlantic time with DST.
  '-4|true': 'America/Halifax',
  // Newfoundland was the old UTC-3.5 representative.
  '-3.5|false': 'America/St_Johns',
  // Newfoundland also represents the DST-enabled old UTC-3.5 choice.
  '-3.5|true': 'America/St_Johns',
  // Buenos Aires preserves the old UTC-3 label without DST.
  '-3|false': 'America/Argentina/Buenos_Aires',
  // Sao Paulo is the best-known old Brazil representative for UTC-3.
  '-3|true': 'America/Sao_Paulo',
  // South Georgia is a fixed UTC-2 zone for the old Mid-Atlantic entry.
  '-2|false': 'Atlantic/South_Georgia',
  // No current DST zone cleanly matches old Mid-Atlantic.
  '-2|true': 'Atlantic/South_Georgia',
  // Cape Verde was listed in the old UTC-1 label and has no DST.
  '-1|false': 'Atlantic/Cape_Verde',
  // Azores is the old UTC-1 representative with DST.
  '-1|true': 'Atlantic/Azores',
  // Abidjan is a stable UTC representative for non-DST GMT users.
  '0|false': 'Africa/Abidjan',
  // London was the old UTC label's first named DST-observing city.
  '0|true': 'Europe/London',
  // Lagos gives a fixed UTC+1 alternative for the Western Europe bucket.
  '1|false': 'Africa/Lagos',
  // Paris was listed in the old UTC+1 European bucket and observes DST.
  '1|true': 'Europe/Paris',
  // Johannesburg preserves UTC+2 without DST for the old South Africa label.
  '2|false': 'Africa/Johannesburg',
  // Kaliningrad was the first old UTC+2 label.
  '2|true': 'Europe/Kaliningrad',
  // Riyadh preserves UTC+3 without DST for the old Baghdad/Riyadh label.
  '3|false': 'Asia/Riyadh',
  // Moscow was listed in the old UTC+3 label.
  '3|true': 'Europe/Moscow',
  // Tehran was the old UTC+3.5 representative.
  '3.5|false': 'Asia/Tehran',
  // No current DST zone cleanly matches old UTC+3.5.
  '3.5|true': 'Asia/Tehran',
  // Dubai preserves UTC+4 without DST for Abu Dhabi/Muscat.
  '4|false': 'Asia/Dubai',
  // Dubai is also the safest old UTC+4 fallback when toggled.
  '4|true': 'Asia/Dubai',
  // Kabul was the old UTC+4.5 representative.
  '4.5|false': 'Asia/Kabul',
  // No current DST zone cleanly matches old UTC+4.5.
  '4.5|true': 'Asia/Kabul',
  // Karachi preserves UTC+5 without DST for the old Islamabad/Karachi label.
  '5|false': 'Asia/Karachi',
  // Yekaterinburg was the first old UTC+5 label.
  '5|true': 'Asia/Yekaterinburg',
  // Kolkata was the old India half-hour representative.
  '5.5|false': 'Asia/Kolkata',
  // No current DST zone cleanly matches old UTC+5.5.
  '5.5|true': 'Asia/Kolkata',
  // Kathmandu was the old UTC+5.75 representative.
  '5.75|false': 'Asia/Kathmandu',
  // No current DST zone cleanly matches old UTC+5.75.
  '5.75|true': 'Asia/Kathmandu',
  // Dhaka preserves UTC+6 without DST from the old label.
  '6|false': 'Asia/Dhaka',
  // Almaty was the first old UTC+6 label.
  '6|true': 'Asia/Almaty',
  // Yangon was the old Rangoon representative.
  '6.5|false': 'Asia/Yangon',
  // No current DST zone cleanly matches old UTC+6.5.
  '6.5|true': 'Asia/Yangon',
  // Bangkok was the first old UTC+7 label.
  '7|false': 'Asia/Bangkok',
  // No current DST zone cleanly matches old UTC+7.
  '7|true': 'Asia/Bangkok',
  // Singapore preserves UTC+8 without DST from the old label.
  '8|false': 'Asia/Singapore',
  // Shanghai was the first old UTC+8 label.
  '8|true': 'Asia/Shanghai',
  // Tokyo was the first old UTC+9 label and has no DST.
  '9|false': 'Asia/Tokyo',
  // Tokyo remains the safest old UTC+9 fallback when toggled.
  '9|true': 'Asia/Tokyo',
  // Darwin preserves UTC+9.5 without DST for the old Adelaide/Darwin label.
  '9.5|false': 'Australia/Darwin',
  // Adelaide represents UTC+9.5 with DST.
  '9.5|true': 'Australia/Adelaide',
  // Guam preserves UTC+10 without DST from the old label.
  '10|false': 'Pacific/Guam',
  // Sydney is the best-known Eastern Australia DST representative.
  '10|true': 'Australia/Sydney',
  // Noumea preserves UTC+11 without DST for New Caledonia.
  '11|false': 'Pacific/Noumea',
  // Noumea is also the safest old UTC+11 fallback when toggled.
  '11|true': 'Pacific/Noumea',
  // Fiji was listed in the old UTC+12 label and is non-DST in current TZDB.
  '12|false': 'Pacific/Fiji',
  // Auckland represents the old UTC+12 label with DST.
  '12|true': 'Pacific/Auckland',
  // Tongatapu was the old UTC+13 representative.
  '13|false': 'Pacific/Tongatapu',
  // No current DST zone cleanly matches old UTC+13.
  '13|true': 'Pacific/Tongatapu',
};

export default OFFSET_LOCALE_ZONE_MAP;
