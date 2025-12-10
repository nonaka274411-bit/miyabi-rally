export interface Checkpoint {
  id: number;
  name: string;
  description: string;
  address: string;
  image: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
}

export interface Prize {
  id: number;
  name: string;
  description: string;
  requiredStamps: number;
  image: string;
}

export enum AppView {
  INTRO = 'INTRO',
  STAMP_CARD = 'STAMP_CARD',
  LOCATIONS = 'LOCATIONS',
  PRIZES = 'PRIZES',
  SCANNER = 'SCANNER',
}

export interface Fortune {
    checkpointId: number;
    text: string;
}