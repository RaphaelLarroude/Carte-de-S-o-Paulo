
export interface RouteInfo {
  distanceKm: number;
  durationMinutes: number;
  geometry?: any;
  lines?: string[]; // Numéros des lignes de bus ou trains
}

export interface TravelModes {
  car: RouteInfo;
  train: RouteInfo;
  bus: RouteInfo;
}

// Mapeamento de linhas reais SPTrans/CPTM (Ajustado para Português)
const TRANSIT_KNOWLEDGE: Record<string, { lines: string[], trainLines?: string[] }> = {
  'paulista': { 
    lines: ['809U-10', '709P-10', '6414-10'], 
    trainLines: ['Ligne 9-Émeraude', 'Ligne 4-Jaune'] 
  },
  'se_cathedral': { 
    lines: ['6451-10', '5111-10'], 
    trainLines: ['Ligne 9-Émeraude', 'Ligne 1-Bleue'] 
  },
  'ibirapuera': { 
    lines: ['5154-10', '6414-10', '6412-10'], 
    trainLines: ['Ligne 9-Émeraude', 'Ligne 5-Lilas'] 
  },
  'masp': { 
    lines: ['809U-10', '669A-10'], 
    trainLines: ['Ligne 4-Jaune', 'Ligne 2-Verte'] 
  },
  'mercadão': { 
    lines: ['6451-10', '6450-10'], 
    trainLines: ['Ligne 9-Émeraude', 'Express Tiradentes'] 
  },
  'casa_christina': {
    lines: ['746C-10', '746P-10', '807M-10'],
    trainLines: ['Ligne 5-Lilas (Station Giovanni Gronchi)']
  },
  'estacao_morumbi': {
    lines: ['809P-10', '857A-10', '8700-10'],
    trainLines: ['Ligne 4-Jaune (Station São Paulo-Morumbi)']
  },
  'ambienta': {
    lines: ['107T-10', '702U-10', '930P-10'],
    trainLines: ['Ligne 9-Émeraude (Station Cidade Jardim)']
  },
  'default': {
    lines: ['809P-10', '6412-10'],
    trainLines: ['Ligne 9-Émeraude']
  }
};

async function fetchOSRMRoute(lat1: number, lon1: number, lat2: number, lon2: number, profile: 'car' | 'foot' | 'bike'): Promise<RouteInfo> {
  const url = `https://router.project-osrm.org/route/v1/${profile}/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === 'Ok' && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distanceKm: parseFloat((route.distance / 1000).toFixed(1)),
        durationMinutes: Math.round(route.duration / 60),
        geometry: route.geometry
      };
    } else {
      // Fallback para linha direta se o OSRM falhar
      return {
        distanceKm: parseFloat((calculateDistance(lat1, lon1, lat2, lon2)).toFixed(1)),
        durationMinutes: Math.round(calculateDistance(lat1, lon1, lat2, lon2) * 2), // Estimativa simples
        geometry: {
          type: 'LineString',
          coordinates: [[lon1, lat1], [lon2, lat2]]
        }
      };
    }
  } catch (e) {
    console.error(`Erro OSRM (${profile}):`, e);
    // Fallback em caso de erro de rede
    return {
      distanceKm: parseFloat((calculateDistance(lat1, lon1, lat2, lon2)).toFixed(1)),
      durationMinutes: Math.round(calculateDistance(lat1, lon1, lat2, lon2) * 2),
      geometry: {
        type: 'LineString',
        coordinates: [[lon1, lat1], [lon2, lat2]]
      }
    };
  }
}

// Helper para calcular distância quando OSRM falha
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getAllTravelInfo(lat1: number, lon1: number, lat2: number, lon2: number, destinationId?: string): Promise<TravelModes> {
  const baseRoute = await fetchOSRMRoute(lat1, lon1, lat2, lon2, 'car');
  const knowledge = destinationId ? (TRANSIT_KNOWLEDGE[destinationId] || TRANSIT_KNOWLEDGE['default']) : TRANSIT_KNOWLEDGE['default'];

  return {
    car: {
      ...baseRoute
    },
    train: {
      ...baseRoute,
      durationMinutes: Math.round(baseRoute.durationMinutes * 0.75),
      lines: knowledge.trainLines
    },
    bus: {
      ...baseRoute,
      durationMinutes: Math.round(baseRoute.durationMinutes * 1.5),
      lines: knowledge.lines
    }
  };
}
