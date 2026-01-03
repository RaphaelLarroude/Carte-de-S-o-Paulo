
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

// Mappage des lignes réelles SPTrans/CPTM depuis la région Morumbi
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
    }
  } catch (e) {
    console.error(`OSRM Error (${profile}):`, e);
  }
  return { distanceKm: 0, durationMinutes: 0 };
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
