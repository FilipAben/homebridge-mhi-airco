export interface AirconStatus {
  operation: boolean;
  presetTemp: number;
  operationMode: OperationMode;
  airFlow: number;
  windDirectionUD: number;
  windDirectionLR: number;
  entrust: boolean;
  coolHotJudge: boolean;
  modelNr: number;
  vacant: boolean;
  errorCode: string;
  outdoorTemp: number;
  indoorTemp: number;
  lastUpdated: number;
}

export enum OperationMode {
  Auto = 0,
  Cool = 1,
  Heat = 2,
  Fan = 3,
  Dry = 4
}

export const opModes = [8, 16, 12, 4];
export const airFlows = [7, 0, 1, 2, 6];
export const UDDirections = [0, 16, 32, 48];
export const LRDirections = [0, 1, 2, 3, 4, 5, 6];
export const outdoorTempList = [
  -50.0,
  -50.0,
  -50.0,
  -50.0,
  -50.0,
  -48.9,
  -46.0,
  -44.0,
  -42.0,
  -41.0,
  -39.0,
  -38.0,
  -37.0,
  -36.0,
  -35.0,
  -34.0,
  -33.0,
  -32.0,
  -31.0,
  -30.0,
  -29.0,
  -28.5,
  -28.0,
  -27.0,
  -26.0,
  -25.5,
  -25.0,
  -24.0,
  -23.5,
  -23.0,
  -22.5,
  -22.0,
  -21.5,
  -21.0,
  -20.5,
  -20.0,
  -19.5,
  -19.0,
  -18.5,
  -18.0,
  -17.5,
  -17.0,
  -16.5,
  -16.0,
  -15.5,
  -15.0,
  -14.6,
  -14.3,
  -14.0,
  -13.5,
  -13.0,
  -12.6,
  -12.3,
  -12.0,
  -11.5,
  -11.0,
  -10.6,
  -10.3,
  -10.0,
  -9.6,
  -9.3,
  -9.0,
  -8.6,
  -8.3,
  -8.0,
  -7.6,
  -7.3,
  -7.0,
  -6.6,
  -6.3,
  -6.0,
  -5.6,
  -5.3,
  -5.0,
  -4.6,
  -4.3,
  -4.0,
  -3.7,
  -3.5,
  -3.2,
  -3.0,
  -2.6,
  -2.3,
  -2.0,
  -1.7,
  -1.5,
  -1.2,
  -1.0,
  -0.6,
  -0.3,
  0.0,
  0.2,
  0.5,
  0.7,
  1.0,
  1.3,
  1.6,
  2.0,
  2.2,
  2.5,
  2.7,
  3.0,
  3.2,
  3.5,
  3.7,
  4.0,
  4.2,
  4.5,
  4.7,
  5.0,
  5.2,
  5.5,
  5.7,
  6.0,
  6.2,
  6.5,
  6.7,
  7.0,
  7.2,
  7.5,
  7.7,
  8.0,
  8.2,
  8.5,
  8.7,
  9.0,
  9.2,
  9.5,
  9.7,
  10.0,
  10.2,
  10.5,
  10.7,
  11.0,
  11.2,
  11.5,
  11.7,
  12.0,
  12.2,
  12.5,
  12.7,
  13.0,
  13.2,
  13.5,
  13.7,
  14.0,
  14.2,
  14.4,
  14.6,
  14.8,
  15.0,
  15.2,
  15.5,
  15.7,
  16.0,
  16.2,
  16.5,
  16.7,
  17.0,
  17.2,
  17.5,
  17.7,
  18.0,
  18.2,
  18.5,
  18.7,
  19.0,
  19.2,
  19.4,
  19.6,
  19.8,
  20.0,
  20.2,
  20.5,
  20.7,
  21.0,
  21.2,
  21.5,
  21.7,
  22.0,
  22.2,
  22.5,
  22.7,
  23.0,
  23.2,
  23.5,
  23.7,
  24.0,
  24.2,
  24.5,
  24.7,
  25.0,
  25.2,
  25.5,
  25.7,
  26.0,
  26.2,
  26.5,
  26.7,
  27.0,
  27.2,
  27.5,
  27.7,
  28.0,
  28.2,
  28.5,
  28.7,
  29.0,
  29.2,
  29.5,
  29.7,
  30.0,
  30.2,
  30.5,
  30.7,
  31.0,
  31.3,
  31.6,
  32.0,
  32.2,
  32.5,
  32.7,
  33.0,
  33.2,
  33.5,
  33.7,
  34.0,
  34.3,
  34.6,
  35.0,
  35.2,
  35.5,
  35.7,
  36.0,
  36.3,
  36.6,
  37.0,
  37.2,
  37.5,
  37.7,
  38.0,
  38.3,
  38.6,
  39.0,
  39.3,
  39.6,
  40.0,
  40.3,
  40.6,
  41.0,
  41.3,
  41.6,
  42.0,
  42.3,
  42.6,
  43.0,
]

export const indoorTempList = [
  -30.0,
  -30.0,
  -30.0,
  -30.0,
  -30.0,
  -30.0,
  -30.0,
  -30.0,
  -30.0,
  -30.0,
  -30.0,
  -30.0,
  -30.0,
  -30.0,
  -30.0,
  -30.0,
  -29.0,
  -28.0,
  -27.0,
  -26.0,
  -25.0,
  -24.0,
  -23.0,
  -22.5,
  -22.0,
  -21.0,
  -20.0,
  -19.5,
  -19.0,
  -18.0,
  -17.5,
  -17.0,
  -16.5,
  -16.0,
  -15.0,
  -14.5,
  -14.0,
  -13.5,
  -13.0,
  -12.5,
  -12.0,
  -11.5,
  -11.0,
  -10.5,
  -10.0,
  -9.5,
  -9.0,
  -8.6,
  -8.3,
  -8.0,
  -7.5,
  -7.0,
  -6.5,
  -6.0,
  -5.6,
  -5.3,
  -5.0,
  -4.5,
  -4.0,
  -3.6,
  -3.3,
  -3.0,
  -2.6,
  -2.3,
  -2.0,
  -1.6,
  -1.3,
  -1.0,
  -0.5,
  0.0,
  0.3,
  0.6,
  1.0,
  1.3,
  1.6,
  2.0,
  2.3,
  2.6,
  3.0,
  3.2,
  3.5,
  3.7,
  4.0,
  4.3,
  4.6,
  5.0,
  5.3,
  5.6,
  6.0,
  6.3,
  6.6,
  7.0,
  7.2,
  7.5,
  7.7,
  8.0,
  8.3,
  8.6,
  9.0,
  9.2,
  9.5,
  9.7,
  10.0,
  10.3,
  10.6,
  11.0,
  11.2,
  11.5,
  11.7,
  12.0,
  12.3,
  12.6,
  13.0,
  13.2,
  13.5,
  13.7,
  14.0,
  14.2,
  14.5,
  14.7,
  15.0,
  15.3,
  15.6,
  16.0,
  16.2,
  16.5,
  16.7,
  17.0,
  17.2,
  17.5,
  17.7,
  18.0,
  18.2,
  18.5,
  18.7,
  19.0,
  19.2,
  19.5,
  19.7,
  20.0,
  20.2,
  20.5,
  20.7,
  21.0,
  21.2,
  21.5,
  21.7,
  22.0,
  22.2,
  22.5,
  22.7,
  23.0,
  23.2,
  23.5,
  23.7,
  24.0,
  24.2,
  24.5,
  24.7,
  25.0,
  25.2,
  25.5,
  25.7,
  26.0,
  26.2,
  26.5,
  26.7,
  27.0,
  27.2,
  27.5,
  27.7,
  28.0,
  28.2,
  28.5,
  28.7,
  29.0,
  29.2,
  29.5,
  29.7,
  30.0,
  30.2,
  30.5,
  30.7,
  31.0,
  31.3,
  31.6,
  32.0,
  32.2,
  32.5,
  32.7,
  33.0,
  33.2,
  33.5,
  33.7,
  34.0,
  34.2,
  34.5,
  34.7,
  35.0,
  35.3,
  35.6,
  36.0,
  36.2,
  36.5,
  36.7,
  37.0,
  37.2,
  37.5,
  37.7,
  38.0,
  38.3,
  38.6,
  39.0,
  39.2,
  39.5,
  39.7,
  40.0,
  40.3,
  40.6,
  41.0,
  41.2,
  41.5,
  41.7,
  42.0,
  42.3,
  42.6,
  43.0,
  43.2,
  43.5,
  43.7,
  44.0,
  44.3,
  44.6,
  45.0,
  45.3,
  45.6,
  46.0,
  46.2,
  46.5,
  46.7,
  47.0,
  47.3,
  47.6,
  48.0,
  48.3,
  48.6,
  49.0,
  49.3,
  49.6,
  50.0,
  50.3,
  50.6,
  51.0,
  51.3,
  51.6,
  52.0,
];
