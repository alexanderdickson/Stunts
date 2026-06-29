export interface TilePaletteEntry {
  id: string;
  label: string;
  byte: number;
  layer: 'track' | 'terrain';
  category: string;
  icon: string;
  fKey?: string;
}

const icon = (id: string) => `/texs/editor/tiles/${id}.svg`;

export const TILE_PALETTE: TilePaletteEntry[] = [
  { id: 'erase', label: 'Erase', byte: 0x00, layer: 'track', category: 'Basic', icon: icon('erase'), fKey: 'F1' },
  { id: 'start', label: 'Start/Finish', byte: 0x01, layer: 'track', category: 'Basic', icon: icon('start'), fKey: 'F1' },
  { id: 'road-ns', label: 'Road N-S', byte: 0x04, layer: 'track', category: 'Road', icon: icon('road-ns'), fKey: 'F2' },
  { id: 'road-ew', label: 'Road E-W', byte: 0x05, layer: 'track', category: 'Road', icon: icon('road-ew'), fKey: 'F2' },
  { id: 'straight', label: 'Straight', byte: 0x0a, layer: 'track', category: 'Road', icon: icon('straight'), fKey: 'F2' },
  { id: 'stadium', label: 'Stadium', byte: 0x0b, layer: 'track', category: 'Road', icon: icon('stadium'), fKey: 'F2' },
  { id: 'ramp-n', label: 'Ramp North', byte: 0x27, layer: 'track', category: 'Stunts', icon: icon('ramp-n'), fKey: 'F3' },
  { id: 'ramp-e', label: 'Ramp East', byte: 0x24, layer: 'track', category: 'Stunts', icon: icon('ramp-e'), fKey: 'F3' },
  { id: 'ramp-s', label: 'Ramp South', byte: 0x26, layer: 'track', category: 'Stunts', icon: icon('ramp-s'), fKey: 'F3' },
  { id: 'ramp-w', label: 'Ramp West', byte: 0x25, layer: 'track', category: 'Stunts', icon: icon('ramp-w'), fKey: 'F3' },
  { id: 'loop-n', label: 'Loop N', byte: 0x40, layer: 'track', category: 'Stunts', icon: icon('loop-n'), fKey: 'F3' },
  { id: 'loop-e', label: 'Loop E', byte: 0x41, layer: 'track', category: 'Stunts', icon: icon('loop-e'), fKey: 'F3' },
  { id: 'pipe-n', label: 'Pipe N', byte: 0x44, layer: 'track', category: 'Stunts', icon: icon('pipe-n'), fKey: 'F3' },
  { id: 'pipe-e', label: 'Pipe E', byte: 0x45, layer: 'track', category: 'Stunts', icon: icon('pipe-e'), fKey: 'F3' },
  { id: 'half-pipe', label: 'Half Pipe', byte: 0x53, layer: 'track', category: 'Stunts', icon: icon('half-pipe'), fKey: 'F3' },
  { id: 'cork', label: 'Corkscrew', byte: 0x57, layer: 'track', category: 'Stunts', icon: icon('cork'), fKey: 'F3' },
  { id: 'espresso', label: 'Espresso', byte: 0x65, layer: 'track', category: 'Stunts', icon: icon('espresso'), fKey: 'F3' },
  { id: 'l-bank-n', label: 'Left Bank N', byte: 0x2a, layer: 'track', category: 'Banks', icon: icon('l-bank-n'), fKey: 'F4' },
  { id: 'l-bank-e', label: 'Left Bank E', byte: 0x2b, layer: 'track', category: 'Banks', icon: icon('l-bank-e'), fKey: 'F4' },
  { id: 'r-bank-n', label: 'Right Bank N', byte: 0x2c, layer: 'track', category: 'Banks', icon: icon('r-bank-n'), fKey: 'F4' },
  { id: 'r-bank-e', label: 'Right Bank E', byte: 0x2f, layer: 'track', category: 'Banks', icon: icon('r-bank-e'), fKey: 'F4' },
  { id: 'bank-n', label: 'Banked N', byte: 0x30, layer: 'track', category: 'Banks', icon: icon('bank-n'), fKey: 'F4' },
  { id: 'bank-e', label: 'Banked E', byte: 0x32, layer: 'track', category: 'Banks', icon: icon('bank-e'), fKey: 'F4' },
  { id: 'bridge-n', label: 'Bridge N', byte: 0x3a, layer: 'track', category: 'Structures', icon: icon('bridge-n'), fKey: 'F5' },
  { id: 'bridge-e', label: 'Bridge E', byte: 0x38, layer: 'track', category: 'Structures', icon: icon('bridge-e'), fKey: 'F5' },
  { id: 'palm', label: 'Palm Tree', byte: 0x97, layer: 'track', category: 'Scenery', icon: icon('palm'), fKey: 'F6' },
  { id: 'cactus', label: 'Cactus', byte: 0x98, layer: 'track', category: 'Scenery', icon: icon('cactus'), fKey: 'F6' },
  { id: 'tree', label: 'Tree', byte: 0x99, layer: 'track', category: 'Scenery', icon: icon('tree'), fKey: 'F6' },
  { id: 'barn', label: 'Barn', byte: 0x9f, layer: 'track', category: 'Scenery', icon: icon('barn'), fKey: 'F6' },
  { id: 'gas', label: 'Gas Station', byte: 0x9c, layer: 'track', category: 'Scenery', icon: icon('gas'), fKey: 'F6' },

  { id: 't-flat', label: 'Flat Grass', byte: 0x00, layer: 'terrain', category: 'Terrain', icon: icon('t-flat'), fKey: 'F7' },
  { id: 't-high', label: 'High Plateau', byte: 0x06, layer: 'terrain', category: 'Terrain', icon: icon('t-high'), fKey: 'F7' },
  { id: 't-up-n', label: 'Slope Up N', byte: 0x09, layer: 'terrain', category: 'Terrain', icon: icon('t-up-n'), fKey: 'F7' },
  { id: 't-up-e', label: 'Slope Up E', byte: 0x0a, layer: 'terrain', category: 'Terrain', icon: icon('t-up-e'), fKey: 'F7' },
  { id: 't-up-s', label: 'Slope Up S', byte: 0x07, layer: 'terrain', category: 'Terrain', icon: icon('t-up-s'), fKey: 'F7' },
  { id: 't-up-w', label: 'Slope Up W', byte: 0x08, layer: 'terrain', category: 'Terrain', icon: icon('t-up-w'), fKey: 'F7' },
  { id: 't-out-n', label: 'Slope Out N', byte: 0x0c, layer: 'terrain', category: 'Terrain', icon: icon('t-out-n'), fKey: 'F7' },
  { id: 't-in-n', label: 'Slope In N', byte: 0x10, layer: 'terrain', category: 'Terrain', icon: icon('t-in-n'), fKey: 'F7' },
];

export const EDITOR_CATEGORIES = [
  { key: 'F1', label: 'Basic', layer: 'track' as const, category: 'Basic' },
  { key: 'F2', label: 'Road', layer: 'track' as const, category: 'Road' },
  { key: 'F3', label: 'Stunts', layer: 'track' as const, category: 'Stunts' },
  { key: 'F4', label: 'Banks', layer: 'track' as const, category: 'Banks' },
  { key: 'F5', label: 'Structures', layer: 'track' as const, category: 'Structures' },
  { key: 'F6', label: 'Scenery', layer: 'track' as const, category: 'Scenery' },
  { key: 'F7', label: 'Terrain', layer: 'terrain' as const, category: 'Terrain' },
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

export function getCategoryByFKey(fKey: string) {
  return EDITOR_CATEGORIES.find((c) => c.key === fKey);
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
