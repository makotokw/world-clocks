export type DigitalClockFontId =
  | 'days-one'
  | 'system'
  | 'inter'
  | 'rajdhani'
  | 'oxanium'
  | 'chakra-petch'
  | 'orbitron'
  | 'dseg7-modern';

export interface DigitalClockFontOption {
  id: DigitalClockFontId;
  label: string;
  labelKey?: string;
  fontFamily: string;
}

export const DEFAULT_DIGITAL_CLOCK_FONT_ID: DigitalClockFontId = 'days-one';
export const DEFAULT_DIGITAL_CLOCK_FONT_BOLD = true;

// Keep the current default first, the system fallback second, then bundled
// alternatives from general-purpose to more display-specific styles.
export const digitalClockFonts: DigitalClockFontOption[] = [
  {
    id: 'days-one',
    label: 'Days One',
    fontFamily: "'Days One', sans-serif",
  },
  {
    id: 'system',
    label: 'System Default',
    labelKey: 'DIGITAL_CLOCK_FONT_SYSTEM_DEFAULT_LABEL',
    fontFamily: 'sans-serif',
  },
  {
    id: 'inter',
    label: 'Inter',
    fontFamily: "'Inter', sans-serif",
  },
  {
    id: 'rajdhani',
    label: 'Rajdhani',
    fontFamily: "'Rajdhani', sans-serif",
  },
  {
    id: 'oxanium',
    label: 'Oxanium',
    fontFamily: "'Oxanium', sans-serif",
  },
  {
    id: 'chakra-petch',
    label: 'Chakra Petch',
    fontFamily: "'Chakra Petch', sans-serif",
  },
  {
    id: 'orbitron',
    label: 'Orbitron',
    fontFamily: "'Orbitron', sans-serif",
  },
  {
    id: 'dseg7-modern',
    label: 'DSEG7 Modern',
    fontFamily: "'DSEG7 Modern', sans-serif",
  },
];

export function getDigitalClockFontOption(id: string): DigitalClockFontOption {
  return (
    digitalClockFonts.find((font) => font.id === id) ||
    digitalClockFonts.find((font) => font.id === DEFAULT_DIGITAL_CLOCK_FONT_ID) ||
    digitalClockFonts[0]
  );
}
