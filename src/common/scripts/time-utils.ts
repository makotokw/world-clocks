/**
 * Converts a Date object to local time (pseudo-local time calculated based on UTC).
 * @param date
 */
export function toLocalTime(date: Date): Date {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );
}

/**
 * Converts a date to a short string format (removing the year).
 * @param date
 */
export function toShortDateString(date: Date): string {
  return date.toDateString().replace(/\s?[0-9]{4}\s?/, '');
}

/**
 * Converts a time to a short string format.
 * @param date
 * @param showSecond Whether to show seconds.
 * @param use24h Whether to use 24-hour format.
 */
export function toLocaleShortTimeString(date: Date, showSecond = false, use24h = false): string {
  let h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  let suffix = '';

  if (use24h) {
    const hh = h.toString().padStart(2, '0');
    return showSecond ? `${hh}:${m}:${s}` : `${hh}:${m}`;
  }

  suffix = h < 12 ? ' AM' : ' PM';
  if (h >= 12) {
    h -= 12;
  }
  if (h === 0) {
    h = 12;
  }

  const time = showSecond ? `${h}:${m}:${s}` : `${h}:${m}`;
  return time + suffix;
}
