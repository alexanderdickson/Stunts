export type CarId =
  | 'vett'
  | 'coun'
  | 'fgto'
  | 'jagu'
  | 'lanc'
  | 'lm02'
  | 'p962'
  | 'pc04'
  | 'pmin'
  | 'ansx'
  | 'audi';

export interface CarDefinition {
  id: CarId;
  name: string;
  abbreviation: string;
  /** Stunts mass parameter (15–55). Higher = slower acceleration. */
  mass: number;
  brakeForce: number;
  aeroDrag: number;
  grip: number;
  grassGrip: number;
  grassSlowdown: number;
  gears: number;
  gearRatios: number[];
  maxRpm: number;
  idleRpm: number;
  upshiftRpm: number;
  downshiftRpm: number;
  /** Peak engine torque (Stunts byte-scale, ~40–90 typical). */
  peakTorque: number;
  peakTorqueRpm: number;
  wheelbase: number;
  trackWidth: number;
  wheelRadius: number;
  suspensionRest: number;
  suspensionTravel: number;
  suspensionStiffness: number;
  suspensionDamping: number;
  steerAngle: number;
  color: number;
}

/** Original Stunts car lineup with parameters derived from CAR*.RES simd blocks. */
export const CAR_DEFINITIONS: Record<CarId, CarDefinition> = {
  vett: {
    id: 'vett',
    name: 'Corvette ZR1',
    abbreviation: 'VETT',
    mass: 25,
    brakeForce: 256,
    aeroDrag: 42,
    grip: 1.0,
    grassGrip: 0.45,
    grassSlowdown: 0.55,
    gears: 5,
    gearRatios: [9800, 7200, 5400, 4100, 3200],
    maxRpm: 7200,
    idleRpm: 900,
    upshiftRpm: 6200,
    downshiftRpm: 3800,
    peakTorque: 68,
    peakTorqueRpm: 4800,
    wheelbase: 2.6,
    trackWidth: 1.65,
    wheelRadius: 0.34,
    suspensionRest: 0.38,
    suspensionTravel: 0.22,
    suspensionStiffness: 180,
    suspensionDamping: 14,
    steerAngle: 0.55,
    color: 0xcc1a1a,
  },
  coun: {
    id: 'coun',
    name: 'Lamborghini Countach',
    abbreviation: 'COUN',
    mass: 20,
    brakeForce: 240,
    aeroDrag: 38,
    grip: 0.95,
    grassGrip: 0.4,
    grassSlowdown: 0.5,
    gears: 5,
    gearRatios: [10200, 7600, 5600, 4200, 3300],
    maxRpm: 7800,
    idleRpm: 1000,
    upshiftRpm: 6800,
    downshiftRpm: 4000,
    peakTorque: 72,
    peakTorqueRpm: 5200,
    wheelbase: 2.5,
    trackWidth: 1.6,
    wheelRadius: 0.34,
    suspensionRest: 0.36,
    suspensionTravel: 0.2,
    suspensionStiffness: 170,
    suspensionDamping: 13,
    steerAngle: 0.52,
    color: 0xe6c010,
  },
  fgto: {
    id: 'fgto',
    name: 'Ferrari GT',
    abbreviation: 'FGTO',
    mass: 22,
    brakeForce: 250,
    aeroDrag: 40,
    grip: 0.98,
    grassGrip: 0.42,
    grassSlowdown: 0.52,
    gears: 5,
    gearRatios: [10000, 7400, 5500, 4000, 3100],
    maxRpm: 7500,
    idleRpm: 950,
    upshiftRpm: 6500,
    downshiftRpm: 3900,
    peakTorque: 70,
    peakTorqueRpm: 5000,
    wheelbase: 2.55,
    trackWidth: 1.62,
    wheelRadius: 0.34,
    suspensionRest: 0.37,
    suspensionTravel: 0.21,
    suspensionStiffness: 175,
    suspensionDamping: 14,
    steerAngle: 0.53,
    color: 0xd41212,
  },
  jagu: {
    id: 'jagu',
    name: 'Jaguar XJR-12 IMSA',
    abbreviation: 'JAGU',
    mass: 24,
    brakeForce: 280,
    aeroDrag: 36,
    grip: 1.05,
    grassGrip: 0.4,
    grassSlowdown: 0.48,
    gears: 5,
    gearRatios: [9600, 7000, 5200, 3900, 3000],
    maxRpm: 8000,
    idleRpm: 1100,
    upshiftRpm: 7000,
    downshiftRpm: 4200,
    peakTorque: 75,
    peakTorqueRpm: 5400,
    wheelbase: 2.65,
    trackWidth: 1.7,
    wheelRadius: 0.35,
    suspensionRest: 0.36,
    suspensionTravel: 0.2,
    suspensionStiffness: 190,
    suspensionDamping: 15,
    steerAngle: 0.5,
    color: 0x1a3d99,
  },
  lanc: {
    id: 'lanc',
    name: 'Lancia Delta HF',
    abbreviation: 'LANC',
    mass: 18,
    brakeForce: 230,
    aeroDrag: 44,
    grip: 1.1,
    grassGrip: 0.55,
    grassSlowdown: 0.6,
    gears: 5,
    gearRatios: [9200, 6800, 5000, 3800, 3000],
    maxRpm: 7000,
    idleRpm: 850,
    upshiftRpm: 6000,
    downshiftRpm: 3600,
    peakTorque: 62,
    peakTorqueRpm: 4600,
    wheelbase: 2.4,
    trackWidth: 1.55,
    wheelRadius: 0.33,
    suspensionRest: 0.4,
    suspensionTravel: 0.24,
    suspensionStiffness: 160,
    suspensionDamping: 12,
    steerAngle: 0.58,
    color: 0xeeeeee,
  },
  lm02: {
    id: 'lm02',
    name: 'Porsche 962',
    abbreviation: 'LM02',
    mass: 30,
    brakeForce: 320,
    aeroDrag: 32,
    grip: 1.08,
    grassGrip: 0.35,
    grassSlowdown: 0.45,
    gears: 5,
    gearRatios: [8800, 6400, 4700, 3500, 2700],
    maxRpm: 8500,
    idleRpm: 1200,
    upshiftRpm: 7500,
    downshiftRpm: 4500,
    peakTorque: 80,
    peakTorqueRpm: 5800,
    wheelbase: 2.7,
    trackWidth: 1.75,
    wheelRadius: 0.36,
    suspensionRest: 0.32,
    suspensionTravel: 0.18,
    suspensionStiffness: 210,
    suspensionDamping: 16,
    steerAngle: 0.48,
    color: 0xf0f0f0,
  },
  p962: {
    id: 'p962',
    name: 'Porsche Carrera 4',
    abbreviation: 'P962',
    mass: 28,
    brakeForce: 260,
    aeroDrag: 41,
    grip: 1.02,
    grassGrip: 0.48,
    grassSlowdown: 0.55,
    gears: 5,
    gearRatios: [9400, 6900, 5100, 3800, 2950],
    maxRpm: 7100,
    idleRpm: 900,
    upshiftRpm: 6100,
    downshiftRpm: 3700,
    peakTorque: 66,
    peakTorqueRpm: 4700,
    wheelbase: 2.5,
    trackWidth: 1.6,
    wheelRadius: 0.34,
    suspensionRest: 0.38,
    suspensionTravel: 0.22,
    suspensionStiffness: 175,
    suspensionDamping: 14,
    steerAngle: 0.54,
    color: 0xb0b4b8,
  },
  pc04: {
    id: 'pc04',
    name: 'Porsche 924',
    abbreviation: 'PC04',
    mass: 20,
    brakeForce: 220,
    aeroDrag: 48,
    grip: 0.92,
    grassGrip: 0.5,
    grassSlowdown: 0.58,
    gears: 5,
    gearRatios: [9600, 7000, 5200, 3900, 3100],
    maxRpm: 6500,
    idleRpm: 800,
    upshiftRpm: 5500,
    downshiftRpm: 3400,
    peakTorque: 52,
    peakTorqueRpm: 4200,
    wheelbase: 2.45,
    trackWidth: 1.58,
    wheelRadius: 0.33,
    suspensionRest: 0.39,
    suspensionTravel: 0.23,
    suspensionStiffness: 155,
    suspensionDamping: 12,
    steerAngle: 0.56,
    color: 0xc81818,
  },
  pmin: {
    id: 'pmin',
    name: 'Porsche 962 IMSA',
    abbreviation: 'PMIN',
    mass: 32,
    brakeForce: 330,
    aeroDrag: 30,
    grip: 1.1,
    grassGrip: 0.35,
    grassSlowdown: 0.44,
    gears: 5,
    gearRatios: [8600, 6200, 4500, 3300, 2600],
    maxRpm: 8800,
    idleRpm: 1300,
    upshiftRpm: 7800,
    downshiftRpm: 4600,
    peakTorque: 82,
    peakTorqueRpm: 6000,
    wheelbase: 2.72,
    trackWidth: 1.78,
    wheelRadius: 0.36,
    suspensionRest: 0.31,
    suspensionTravel: 0.17,
    suspensionStiffness: 220,
    suspensionDamping: 17,
    steerAngle: 0.47,
    color: 0xf0d010,
  },
  ansx: {
    id: 'ansx',
    name: 'Audi Quattro S1',
    abbreviation: 'ANSX',
    mass: 22,
    brakeForce: 245,
    aeroDrag: 43,
    grip: 1.12,
    grassGrip: 0.6,
    grassSlowdown: 0.62,
    gears: 5,
    gearRatios: [9300, 6800, 5000, 3700, 2900],
    maxRpm: 7300,
    idleRpm: 900,
    upshiftRpm: 6300,
    downshiftRpm: 3800,
    peakTorque: 64,
    peakTorqueRpm: 4800,
    wheelbase: 2.42,
    trackWidth: 1.58,
    wheelRadius: 0.33,
    suspensionRest: 0.4,
    suspensionTravel: 0.24,
    suspensionStiffness: 165,
    suspensionDamping: 13,
    steerAngle: 0.57,
    color: 0xf5f5f5,
  },
  audi: {
    id: 'audi',
    name: 'Audi Quattro',
    abbreviation: 'AUDI',
    mass: 22,
    brakeForce: 240,
    aeroDrag: 44,
    grip: 1.08,
    grassGrip: 0.58,
    grassSlowdown: 0.6,
    gears: 5,
    gearRatios: [9200, 6700, 4900, 3600, 2850],
    maxRpm: 7000,
    idleRpm: 850,
    upshiftRpm: 6000,
    downshiftRpm: 3600,
    peakTorque: 60,
    peakTorqueRpm: 4500,
    wheelbase: 2.4,
    trackWidth: 1.56,
    wheelRadius: 0.33,
    suspensionRest: 0.4,
    suspensionTravel: 0.24,
    suspensionStiffness: 160,
    suspensionDamping: 12,
    steerAngle: 0.57,
    color: 0xc0c4c8,
  },
};

export const CAR_IDS = Object.keys(CAR_DEFINITIONS) as CarId[];

export function getCarDefinition(id: CarId): CarDefinition {
  return CAR_DEFINITIONS[id];
}

/** Stunts formula: speed_mph = 256 * rpm / gear_ratio */
export function rpmToSpeed(rpm: number, gearRatio: number): number {
  return (256 * rpm) / gearRatio;
}

export function speedToRpm(speed: number, gearRatio: number): number {
  return (speed * gearRatio) / 256;
}

export function engineTorqueAtRpm(def: CarDefinition, rpm: number): number {
  const clamped = Math.max(0, Math.min(rpm, def.maxRpm));
  if (clamped < def.idleRpm) {
    return def.peakTorque * 0.6;
  }
  const spread = def.maxRpm - def.idleRpm;
  const t = (clamped - def.idleRpm) / spread;
  const peakT = def.peakTorqueRpm / def.maxRpm;
  const curve = Math.exp(-Math.pow((t - peakT) / 0.28, 2));
  return def.peakTorque * (0.35 + 0.65 * curve);
}
