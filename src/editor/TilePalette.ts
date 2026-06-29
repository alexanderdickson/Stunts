export interface TilePaletteEntry {
  id: string;
  label: string;
  byte: number;
  layer: 'track' | 'terrain';
  category: string;
}

export const TILE_PALETTE: TilePaletteEntry[] = [
  { id: 'erase', label: 'Erase', byte: 0x00, layer: 'track', category: 'Basic' },
  { id: 'start', label: 'Start/Finish', byte: 0x01, layer: 'track', category: 'Basic' },
  { id: 'road-ns', label: 'Road N-S', byte: 0x04, layer: 'track', category: 'Road' },
  { id: 'road-ew', label: 'Road E-W', byte: 0x05, layer: 'track', category: 'Road' },
  { id: 'straight', label: 'Straight', byte: 0x0a, layer: 'track', category: 'Road' },
  { id: 'stadium', label: 'Stadium', byte: 0x0b, layer: 'track', category: 'Road' },
  { id: 'ramp-n', label: 'Ramp North', byte: 0x27, layer: 'track', category: 'Stunts' },
  { id: 'ramp-e', label: 'Ramp East', byte: 0x24, layer: 'track', category: 'Stunts' },
  { id: 'ramp-s', label: 'Ramp South', byte: 0x26, layer: 'track', category: 'Stunts' },
  { id: 'ramp-w', label: 'Ramp West', byte: 0x25, layer: 'track', category: 'Stunts' },
  { id: 'l-bank-n', label: 'Left Bank N', byte: 0x2a, layer: 'track', category: 'Banks' },
  { id: 'l-bank-e', label: 'Left Bank E', byte: 0x2b, layer: 'track', category: 'Banks' },
  { id: 'r-bank-n', label: 'Right Bank N', byte: 0x2c, layer: 'track', category: 'Banks' },
  { id: 'r-bank-e', label: 'Right Bank E', byte: 0x2f, layer: 'track', category: 'Banks' },
  { id: 'bank-n', label: 'Banked N', byte: 0x30, layer: 'track', category: 'Banks' },
  { id: 'bank-e', label: 'Banked E', byte: 0x32, layer: 'track', category: 'Banks' },
  { id: 'bridge-n', label: 'Bridge N', byte: 0x3a, layer: 'track', category: 'Structures' },
  { id: 'bridge-e', label: 'Bridge E', byte: 0x38, layer: 'track', category: 'Structures' },
  { id: 'loop-n', label: 'Loop N', byte: 0x40, layer: 'track', category: 'Stunts' },
  { id: 'loop-e', label: 'Loop E', byte: 0x41, layer: 'track', category: 'Stunts' },
  { id: 'pipe-n', label: 'Pipe N', byte: 0x44, layer: 'track', category: 'Stunts' },
  { id: 'pipe-e', label: 'Pipe E', byte: 0x45, layer: 'track', category: 'Stunts' },
  { id: 'half-pipe', label: 'Half Pipe', byte: 0x53, layer: 'track', category: 'Stunts' },
  { id: 'cork', label: 'Corkscrew', byte: 0x57, layer: 'track', category: 'Stunts' },
  { id: 'espresso', label: 'Espresso', byte: 0x65, layer: 'track', category: 'Stunts' },
  { id: 'palm', label: 'Palm Tree', byte: 0x97, layer: 'track', category: 'Scenery' },
  { id: 'cactus', label: 'Cactus', byte: 0x98, layer: 'track', category: 'Scenery' },
  { id: 'tree', label: 'Tree', byte: 0x99, layer: 'track', category: 'Scenery' },
  { id: 'barn', label: 'Barn', byte: 0x9f, layer: 'track', category: 'Scenery' },
  { id: 'gas', label: 'Gas Station', byte: 0x9c, layer: 'track', category: 'Scenery' },

  { id: 't-flat', label: 'Flat Grass', byte: 0x00, layer: 'terrain', category: 'Terrain' },
  { id: 't-high', label: 'High Plateau', byte: 0x06, layer: 'terrain', category: 'Terrain' },
  { id: 't-up-n', label: 'Slope Up N', byte: 0x09, layer: 'terrain', category: 'Terrain' },
  { id: 't-up-e', label: 'Slope Up E', byte: 0x0a, layer: 'terrain', category: 'Terrain' },
  { id: 't-up-s', label: 'Slope Up S', byte: 0x07, layer: 'terrain', category: 'Terrain' },
  { id: 't-up-w', label: 'Slope Up W', byte: 0x08, layer: 'terrain', category: 'Terrain' },
  { id: 't-out-n', label: 'Slope Out N', byte: 0x0c, layer: 'terrain', category: 'Terrain' },
  { id: 't-in-n', label: 'Slope In N', byte: 0x10, layer: 'terrain', category: 'Terrain' },
];

export function getPaletteCategories(layer: 'track' | 'terrain'): string[] {
  const cats = new Set<string>();
  for (const entry of TILE_PALETTE) {
    if (entry.layer === layer) {
      cats.add(entry.category);
    }
  }
  return [...cats];
}

export function getPaletteByCategory(layer: 'track' | 'terrain', category: string): TilePaletteEntry[] {
  return TILE_PALETTE.filter((e) => e.layer === layer && e.category === category);
}

export const HORIZON_OPTIONS = [
  { label: 'Tropical Day', value: 0x18 },
  { label: 'Tropical Sunset', value: 0x19 },
  { label: 'Alpine Day', value: 0x00 },
  { label: 'Alpine Sunset', value: 0x01 },
  { label: 'Desert Day', value: 0x10 },
  { label: 'City Day', value: 0x08 },
  { label: 'Country Day', value: 0x20 },
] as const;
