
export interface Neighborhood {
  id: string;
  name: string;
  description?: string;
}

export interface Landmark {
  id: string;
  name: string;
  type: 'monument' | 'park' | 'street' | 'river' | 'custom';
  coordinates: { lat: number; lng: number; x?: number; y?: number };
  description: string;
  color?: string;
  symbol?: string; // Novo campo para o ícone
}

export interface CustomMarker extends Landmark {
  color: string;
  symbol: string;
}

export interface MapData {
  landmarks: Landmark[];
  neighborhoods: Neighborhood[];
}
