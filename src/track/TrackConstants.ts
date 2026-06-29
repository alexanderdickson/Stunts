export const DEG2RAD = Math.PI / 180;
export const ROT_90 = 90 * DEG2RAD;
export const ROT_180 = 180 * DEG2RAD;
export const ROT_270 = 270 * DEG2RAD;

export const Y_RATIO = 0.87890625;
export const HTILE_SIZE = 5.12;
export const TILE_SIZE = HTILE_SIZE * 2;

export const GRID_SIZE = 30;
export const TRACK_FILE_SIZE = 1802;
export const TERRAIN_OFFSET = 0x385;
export const HORIZON_OFFSET = 0x384;

export const MODEL_SCALE = 0.01;
export const TRACK_Y_OFFSET = 0.05;

export const HORIZON_THEMES = ['alpine', 'city', 'country', 'desert', 'tropical'] as const;
export type HorizonTheme = (typeof HORIZON_THEMES)[number];

export const HORIZON_SCENES = ['scen', 'sce2', 'sce3', 'sce4'] as const;

export const TRACK_OBJECT_NAMES = [
  'bank', 'barr', 'brid', 'btur', 'cfen', 'chi1', 'chi2', 'elsp', 'fini', 'gwro',
  'hpip', 'lban', 'loo1', 'loop', 'pipe', 'pip2', 'ramp', 'rban', 'rdup', 'road',
  'selr', 'sofl', 'sofr', 'spip', 'stur', 'sram', 'vcor', 'wroa',
  'goui', 'gouo', 'goup', 'hig1', 'hig2', 'hig3', 'high',
  'barn', 'boat', 'cact', 'gass', 'offi', 'palm', 'rest', 'tenn', 'tree',
] as const;

export type TrackObjectName = (typeof TRACK_OBJECT_NAMES)[number];
