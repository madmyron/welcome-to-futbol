/**
 * Fake nations for generated players (no real-player licenses).
 * Owns country names and flags; generators pick from this list.
 */

export type Nation = {
  country: string
  flag: string
}

export const NATIONS: Nation[] = [
  { country: 'Argentina', flag: '🇦🇷' },
  { country: 'Australia', flag: '🇦🇺' },
  { country: 'Belgium', flag: '🇧🇪' },
  { country: 'Brazil', flag: '🇧🇷' },
  { country: 'Canada', flag: '🇨🇦' },
  { country: 'Chile', flag: '🇨🇱' },
  { country: 'Colombia', flag: '🇨🇴' },
  { country: 'Croatia', flag: '🇭🇷' },
  { country: 'Egypt', flag: '🇪🇬' },
  { country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { country: 'France', flag: '🇫🇷' },
  { country: 'Germany', flag: '🇩🇪' },
  { country: 'Ghana', flag: '🇬🇭' },
  { country: 'Ireland', flag: '🇮🇪' },
  { country: 'Italy', flag: '🇮🇹' },
  { country: 'Japan', flag: '🇯🇵' },
  { country: 'Mexico', flag: '🇲🇽' },
  { country: 'Morocco', flag: '🇲🇦' },
  { country: 'Netherlands', flag: '🇳🇱' },
  { country: 'Nigeria', flag: '🇳🇬' },
  { country: 'Norway', flag: '🇳🇴' },
  { country: 'Poland', flag: '🇵🇱' },
  { country: 'Portugal', flag: '🇵🇹' },
  { country: 'Senegal', flag: '🇸🇳' },
  { country: 'South Korea', flag: '🇰🇷' },
  { country: 'Spain', flag: '🇪🇸' },
  { country: 'Sweden', flag: '🇸🇪' },
  { country: 'Turkey', flag: '🇹🇷' },
  { country: 'United States', flag: '🇺🇸' },
  { country: 'Uruguay', flag: '🇺🇾' },
]
