export interface SealColor {
  name: string;
  hex: string;
  textColor: string; // for contrast on swatch
}

export const SEAL_COLORS: SealColor[] = [
  { name: 'Schwarz',       hex: '#1a1a1a', textColor: '#ffffff' },
  { name: 'Anthrazit',     hex: '#3b3b3b', textColor: '#ffffff' },
  { name: 'Dunkelgrau',    hex: '#5a5a5a', textColor: '#ffffff' },
  { name: 'Grau',          hex: '#8c8c8c', textColor: '#ffffff' },
  { name: 'Hellgrau',      hex: '#c0c0c0', textColor: '#333333' },
  { name: 'Silbergrau',    hex: '#d0d0d0', textColor: '#333333' },
  { name: 'Weiß',          hex: '#f5f5f5', textColor: '#333333' },
  { name: 'Cremeweiß',     hex: '#f0ece0', textColor: '#333333' },
  { name: 'Beige',         hex: '#d4b896', textColor: '#333333' },
  { name: 'Hellbraun',     hex: '#9b7355', textColor: '#ffffff' },
  { name: 'Braun',         hex: '#6b4423', textColor: '#ffffff' },
  { name: 'Dunkelbraun',   hex: '#3b2010', textColor: '#ffffff' },
];

export function findClosestColor(name: string): SealColor | null {
  const lower = name.toLowerCase();
  return SEAL_COLORS.find((c) =>
    c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())
  ) ?? null;
}
