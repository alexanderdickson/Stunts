import {
  HTILE_SIZE,
  ROT_90,
  ROT_180,
  ROT_270,
  Y_RATIO,
} from './TrackConstants';

export interface ResolvedTile {
  trackObj: string | null;
  trackObj2: string | null;
  terrObj: string | null;
  terrObj2: string | null;
  transX: number;
  transY: number;
  transZ: number;
  rotY: number;
  invertSecondObj: boolean;
}

export function resolveTile(trackTile: number, terrainTile: number): ResolvedTile {
  let trackObj: string | null = null;
  let trackObj2: string | null = null;
  let terrObj: string | null = null;
  let terrObj2: string | null = null;
  let transX = 0;
  let transY = 0;
  let transZ = 0;
  let rotY = 0;
  let rotZ = 0;
  let invertSecondObj = false;

  switch (terrainTile) {
    case 0x00:
      terrObj = 'terr';
      break;
    case 0x06:
      terrObj = 'high';
      transY = HTILE_SIZE * Y_RATIO;
      break;
    case 0x07:
      terrObj = 'goup';
      rotZ = -1;
      rotY = ROT_180;
      break;
    case 0x08:
      terrObj = 'goup';
      rotZ = 1;
      rotY = ROT_270;
      break;
    case 0x09:
      terrObj = 'goup';
      rotZ = 1;
      rotY = 0;
      break;
    case 0x0a:
      terrObj = 'goup';
      rotZ = -1;
      rotY = ROT_90;
      break;
    case 0x0b:
      terrObj = 'gouo';
      terrObj2 = 'terr';
      rotY = ROT_270;
      break;
    case 0x0c:
      terrObj = 'gouo';
      terrObj2 = 'terr';
      rotY = 0;
      break;
    case 0x0d:
      terrObj = 'gouo';
      terrObj2 = 'terr';
      rotY = ROT_90;
      break;
    case 0x0e:
      terrObj = 'gouo';
      terrObj2 = 'terr';
      rotY = ROT_180;
      break;
    case 0x0f:
      terrObj = 'goui';
      rotY = ROT_270;
      break;
    case 0x10:
      terrObj = 'goui';
      rotY = 0;
      break;
    case 0x11:
      terrObj = 'goui';
      rotY = ROT_90;
      break;
    case 0x12:
      terrObj = 'goui';
      rotY = ROT_180;
      break;
  }

  switch (trackTile) {
    case 0x01:
      trackObj = 'fini';
      trackObj2 = 'road';
      rotY = 0;
      break;
    case 0xb5:
      trackObj = 'fini';
      trackObj2 = 'road';
      rotY = ROT_90;
      break;
    case 0xb3:
      trackObj = 'fini';
      trackObj2 = 'road';
      rotY = ROT_180;
      break;
    case 0xb4:
      trackObj = 'fini';
      trackObj2 = 'road';
      rotY = ROT_270;
      break;
    case 0x04:
      if (rotZ !== 0) {
        trackObj = 'rdup';
        terrObj = null;
      } else {
        trackObj = 'road';
      }
      rotY = rotZ > 0 ? 0 : ROT_180;
      break;
    case 0x05:
      if (rotZ !== 0) {
        trackObj = 'rdup';
        terrObj = null;
      } else {
        trackObj = 'road';
      }
      rotY = rotZ > 0 ? ROT_270 : ROT_90;
      break;
    case 0x0a:
      trackObj = 'stur';
      rotY = ROT_180;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x0b:
      trackObj = 'stur';
      rotY = ROT_90;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x0c:
      trackObj = 'stur';
      rotY = ROT_270;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x0d:
      trackObj = 'stur';
      rotY = 0;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x24:
      trackObj = 'ramp';
      rotY = ROT_90;
      break;
    case 0x25:
      trackObj = 'ramp';
      rotY = ROT_270;
      break;
    case 0x26:
      trackObj = 'ramp';
      rotY = ROT_180;
      break;
    case 0x27:
      trackObj = 'ramp';
      rotY = 0;
      break;
    case 0x28:
      trackObj = 'lban';
      rotY = ROT_180;
      break;
    case 0x29:
      trackObj = 'lban';
      rotY = ROT_270;
      break;
    case 0x2a:
      trackObj = 'lban';
      rotY = 0;
      break;
    case 0x2b:
      trackObj = 'lban';
      rotY = ROT_90;
      break;
    case 0x2c:
      trackObj = 'rban';
      rotY = 0;
      break;
    case 0x2d:
      trackObj = 'rban';
      rotY = ROT_270;
      break;
    case 0x2e:
      trackObj = 'rban';
      rotY = 0;
      break;
    case 0x2f:
      trackObj = 'rban';
      rotY = ROT_270;
      break;
    case 0x30:
    case 0x31:
    case 0x33:
      trackObj = 'bank';
      rotY = 0;
      break;
    case 0x32:
      trackObj = 'bank';
      rotY = ROT_90;
      break;
    case 0x34:
      trackObj = 'btur';
      rotY = ROT_180;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x35:
      trackObj = 'btur';
      rotY = ROT_90;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x36:
      trackObj = 'btur';
      rotY = ROT_270;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x37:
      trackObj = 'btur';
      rotY = 0;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x38:
      trackObj = 'brid';
      rotY = ROT_90;
      break;
    case 0x39:
      trackObj = 'brid';
      rotY = ROT_270;
      break;
    case 0x3a:
      trackObj = 'brid';
      rotY = 0;
      break;
    case 0x3b:
      trackObj = 'brid';
      rotY = ROT_180;
      break;
    case 0x3c:
      trackObj = 'chi2';
      rotY = ROT_180;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x3d:
      trackObj = 'chi2';
      rotY = ROT_270;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x3e:
      trackObj = 'chi1';
      rotY = ROT_270;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x3f:
      trackObj = 'chi1';
      rotY = 0;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x40:
      trackObj = 'loop';
      trackObj2 = 'loo1';
      rotY = 0;
      transZ = HTILE_SIZE;
      break;
    case 0x41:
      trackObj = 'loop';
      trackObj2 = 'loo1';
      rotY = ROT_90;
      transZ = HTILE_SIZE;
      break;
    case 0x44:
      trackObj = 'pipe';
      trackObj2 = 'pip2';
      rotY = 0;
      break;
    case 0x45:
      trackObj = 'pipe';
      trackObj2 = 'pip2';
      rotY = ROT_90;
      break;
    case 0x46:
      trackObj = 'spip';
      rotY = ROT_180;
      break;
    case 0x47:
      trackObj = 'spip';
      rotY = 0;
      break;
    case 0x48:
      trackObj = 'spip';
      rotY = ROT_90;
      break;
    case 0x49:
      trackObj = 'spip';
      rotY = ROT_270;
      break;
    case 0x53:
      trackObj = 'hpip';
      trackObj2 = 'pip2';
      rotY = 0;
      break;
    case 0x54:
      trackObj = 'hpip';
      trackObj2 = 'pip2';
      rotY = ROT_90;
      break;
    case 0x55:
      trackObj = 'vcor';
      rotY = 0;
      transX = HTILE_SIZE;
      break;
    case 0x56:
      trackObj = 'vcor';
      rotY = ROT_90;
      transX = HTILE_SIZE;
      break;
    case 0x57:
      trackObj = 'sofr';
      rotY = ROT_180;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x58:
    case 0x59:
    case 0x5a:
      trackObj = 'sofr';
      rotY = 0;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x5b:
      trackObj = 'sofl';
      rotY = ROT_180;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x5c:
    case 0x5d:
    case 0x5e:
      trackObj = 'sofl';
      rotY = 0;
      transX = HTILE_SIZE;
      transZ = HTILE_SIZE;
      break;
    case 0x5f:
      trackObj = 'sram';
      rotY = ROT_90;
      break;
    case 0x60:
      trackObj = 'sram';
      rotY = ROT_270;
      break;
    case 0x61:
      trackObj = 'sram';
      rotY = ROT_180;
      break;
    case 0x62:
      trackObj = 'sram';
      rotY = 0;
      break;
    case 0x63:
      trackObj = 'selr';
      rotY = 0;
      break;
    case 0x64:
      trackObj = 'selr';
      rotY = ROT_90;
      break;
    case 0x65:
      trackObj = 'elsp';
      trackObj2 = 'road';
      rotY = 0;
      invertSecondObj = true;
      break;
    case 0x66:
      trackObj = 'elsp';
      trackObj2 = 'road';
      rotY = ROT_90;
      invertSecondObj = true;
      break;
    case 0x67:
      trackObj = 'elsp';
      rotY = 0;
      break;
    case 0x68:
      trackObj = 'elsp';
      rotY = ROT_90;
      break;
    case 0x6d:
      trackObj = 'wroa';
      rotY = 0;
      break;
    case 0x6e:
      trackObj = 'wroa';
      rotY = ROT_90;
      break;
    case 0x6f:
      trackObj = 'gwro';
      rotY = ROT_180;
      break;
    case 0x70:
      trackObj = 'gwro';
      rotY = ROT_270;
      break;
    case 0x71:
    case 0x72:
      trackObj = 'gwro';
      rotY = 0;
      break;
    case 0x73:
      trackObj = 'barr';
      trackObj2 = 'road';
      rotY = 0;
      break;
    case 0x74:
      trackObj = 'barr';
      trackObj2 = 'road';
      rotY = ROT_90;
      break;
    case 0x97:
      trackObj = 'palm';
      break;
    case 0x98:
      trackObj = 'cact';
      break;
    case 0x99:
      trackObj = 'tree';
      break;
    case 0x9a:
      trackObj = 'tenn';
      break;
    case 0x9b:
      trackObj = 'gass';
      rotY = ROT_180;
      break;
    case 0x9c:
      trackObj = 'gass';
      rotY = 0;
      break;
    case 0x9d:
      trackObj = 'gass';
      rotY = ROT_270;
      break;
    case 0x9e:
      trackObj = 'gass';
      rotY = ROT_90;
      break;
    case 0x9f:
      trackObj = 'barn';
      rotY = 0;
      break;
    case 0xa0:
      trackObj = 'barn';
      rotY = ROT_180;
      break;
    case 0xa1:
      trackObj = 'barn';
      rotY = ROT_270;
      break;
    case 0xa2:
      trackObj = 'barn';
      rotY = ROT_90;
      break;
    case 0xa3:
      trackObj = 'offi';
      rotY = 0;
      break;
    case 0xa4:
      trackObj = 'offi';
      rotY = ROT_180;
      break;
    case 0xa5:
      trackObj = 'offi';
      rotY = ROT_270;
      break;
    case 0xa6:
      trackObj = 'offi';
      rotY = ROT_90;
      break;
    case 0xab:
      trackObj = 'boat';
      rotY = 0;
      break;
    case 0xac:
      trackObj = 'boat';
      rotY = ROT_180;
      break;
    case 0xad:
      trackObj = 'boat';
      rotY = ROT_270;
      break;
    case 0xae:
      trackObj = 'boat';
      rotY = ROT_90;
      break;
    case 0xaf:
      trackObj = 'rest';
      rotY = 0;
      break;
    case 0xb0:
      trackObj = 'rest';
      rotY = ROT_180;
      break;
    case 0xb1:
      trackObj = 'rest';
      rotY = ROT_270;
      break;
    case 0xb2:
      trackObj = 'rest';
      rotY = ROT_90;
      break;
  }

  return {
    trackObj,
    trackObj2,
    terrObj,
    terrObj2,
    transX,
    transY,
    transZ,
    rotY,
    invertSecondObj,
  };
}
