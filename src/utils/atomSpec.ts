export interface Dimension {
  w: number;
  h: number;
}

export interface CropZone {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const ATOM_MAIN: Dimension = { w: 750, h: 450 };
export const ATOM_SQUARE: Dimension = { w: 600, h: 600 };
export const ATOM_CROP_AREA = 0.8;
export const ATOM_FIT_FILL = 0.9;
export const EXPORT_PIXEL_RATIO = 2;

export function getCropZone(W: number, H: number): CropZone {
  return {
    x: W * 0.1,
    y: H * 0.1,
    w: W * 0.8,
    h: H * 0.8,
  };
}
