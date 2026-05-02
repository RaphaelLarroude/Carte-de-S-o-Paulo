
import { MapData } from './types';

export const SP_BOUNDARY_COORDS: [number, number][] = [
  [-23.35, -46.65], 
  [-23.38, -46.55],
  [-23.42, -46.45],
  [-23.45, -46.38], 
  [-23.50, -46.37],
  [-23.55, -46.36], 
  [-23.60, -46.40],
  [-23.68, -46.45], 
  [-23.75, -46.60],
  [-23.85, -46.62],
  [-23.98, -46.65], 
  [-23.90, -46.75],
  [-23.80, -46.82], 
  [-23.70, -46.85],
  [-23.62, -46.86], 
  [-23.55, -46.80],
  [-23.48, -46.78],
  [-23.42, -46.75], 
  [-23.38, -46.70],
];

export const SP_ZONES = [
  { id: 'north', name: 'Zone Nord', color: '#3b82f6', points: '300,100 700,100 800,400 200,400' },
  { id: 'center', name: 'Centre', color: '#eab308', points: '400,400 600,400 600,600 400,600' },
  { id: 'south', name: 'Zone Sud', color: '#22c55e', points: '200,800 800,800 900,1300 100,1300' },
  { id: 'east', name: 'Zone Est', color: '#ef4444', points: '600,400 950,400 950,800 600,800' },
  { id: 'west', name: 'Zone Ouest', color: '#f97316', points: '50,400 400,400 400,800 50,800' }
];

export const SP_MAP_DATA: MapData = {
  neighborhoods: [
    { id: 'se', name: 'Centre (Sé)' },
    { id: 'liberdade', name: 'Liberdade' },
    { id: 'santana', name: 'Santana' },
    { id: 'vMariana', name: 'Vila Mariana' },
    { id: 'moema', name: 'Moema' },
    { id: 'pinheiros', name: 'Pinheiros' },
    { id: 'butanta', name: 'Butantã' },
    { id: 'lapa', name: 'Lapa' },
    { id: 'tatuape', name: 'Tatuapé' },
  ],
  landmarks: [
    { 
      id: 'paulista', 
      name: 'Avenue Paulista', 
      type: 'street', 
      coordinates: { lat: -23.5614, lng: -46.6559, x: 420, y: 560 },
      symbol: 'navigation',
      description: 'Le cœur financier et culturel de São Paulo, célèbre pour ses musées et ses gratte-ciel.',
      category: 'tourist'
    },
    { 
      id: 'se_cathedral', 
      name: 'Cathédrale de la Sé', 
      type: 'monument', 
      coordinates: { lat: -23.5504, lng: -46.6339, x: 500, y: 500 },
      symbol: 'landmark',
      description: 'Le point zéro de la ville, l\'un des plus grands temples néogothiques au monde.',
      category: 'tourist'
    },
    { 
      id: 'ibirapuera', 
      name: 'Parc d\'Ibirapuera', 
      type: 'park', 
      coordinates: { lat: -23.5874, lng: -46.6576, x: 480, y: 720 },
      symbol: 'mountain',
      description: 'Le parc le plus important de la ville, avec des lacs, des musées et des pistes cyclables.',
      category: 'tourist'
    },
    { 
      id: 'masp', 
      name: 'MASP', 
      type: 'monument', 
      coordinates: { lat: -23.5615, lng: -46.6559, x: 400, y: 550 },
      symbol: 'palette',
      description: 'Musée d\'Art de São Paulo, célèbre pour son architecture suspendue sur quatre piliers rouges.',
      category: 'tourist'
    },
    { 
      id: 'mercadão', 
      name: 'Marché Municipal', 
      type: 'monument', 
      coordinates: { lat: -23.5417, lng: -46.6297, x: 530, y: 460 },
      symbol: 'store',
      description: 'Le célèbre Mercadão, connu pour son sandwich à la mortadelle et ses fruits exotiques.',
      category: 'tourist'
    },
    { 
      id: 'estacao_luz', 
      name: 'Gare de la Luz', 
      type: 'monument', 
      coordinates: { lat: -23.5342, lng: -46.6341, x: 500, y: 430 },
      symbol: 'train',
      description: 'L\'une des gares ferroviaires les plus emblématiques, abritant le Musée de la Langue Portugaise.',
      category: 'tourist'
    },
    { 
      id: 'liberdade', 
      name: 'Quartier de la Liberté', 
      type: 'monument', 
      coordinates: { lat: -23.5555, lng: -46.6353, x: 520, y: 530 },
      symbol: 'utensils',
      description: 'Le plus grand quartier de la communauté japonaise hors du Japon, célèbre pour sa gastronomie et ses foires.',
      category: 'tourist'
    },
    { 
      id: 'beco_batman', 
      name: 'Beco do Batman', 
      type: 'street', 
      coordinates: { lat: -23.5564, lng: -46.6865, x: 280, y: 580 },
      symbol: 'palette',
      description: 'Galerie de graffitis à ciel ouvert dans le quartier de Vila Madalena, l\'un des points les plus photogéniques de la ville.',
      category: 'tourist'
    },
    { 
      id: 'ipiranga_museum', 
      name: 'Musée de l\'Ipiranga', 
      type: 'monument', 
      coordinates: { lat: -23.5855, lng: -46.6091, x: 620, y: 680 },
      symbol: 'landmark',
      description: 'Lieu où l\'Indépendance du Brésil a été proclamée, avec des jardins inspirés de Versailles.',
      category: 'tourist'
    },
    { 
      id: 'ambienta', 
      name: 'Bureau Ambienta', 
      type: 'monument', 
      coordinates: { lat: -23.5828, lng: -46.6888 },
      color: '#06b6d4',
      symbol: 'work',
      description: 'Situé au 241 rue Prof. Artur Ramos - Jardim Paulistano. Bureau d\'Ambienta à São Paulo.',
      category: 'personal'
    },
    { 
      id: 'casa_christina', 
      name: 'Maison Christina', 
      type: 'monument', 
      coordinates: { lat: -23.6268, lng: -46.7328, x: 380, y: 850 },
      color: '#8b5cf6',
      symbol: 'building',
      description: 'Située au 180 rue José Gonçalves - Vila Andrade. Un point de repère iconique de la région.',
      category: 'personal'
    },
    { 
      id: 'estacao_morumbi', 
      name: 'Station Morumbi', 
      type: 'monument', 
      coordinates: { lat: -23.5866, lng: -46.7237 },
      color: '#3b82f6',
      symbol: 'train',
      description: 'Située au 50 Av. Dep. Jacob Salvador Zveibil. Station de la ligne 4-jaune intégrée au centre commercial Butantã.',
      category: 'personal'
    },
    { 
      id: 'pacaembu', 
      name: 'Stade du Pacaembu', 
      type: 'monument', 
      coordinates: { lat: -23.5475, lng: -46.6669, x: 340, y: 510 },
      symbol: 'trophy',
      description: 'Stade historique et siège du Musée du Football.',
      category: 'tourist'
    },
    { 
      id: 'pinacoteca', 
      name: 'Pinacothèque', 
      type: 'monument', 
      coordinates: { lat: -23.5340, lng: -46.6330, x: 515, y: 410 },
      symbol: 'palette',
      description: 'L\'un des musées d\'art les plus importants du Brésil, situé dans un bâtiment en briques emblématique.',
      category: 'tourist'
    },
    { 
      id: 'teatro_municipal', 
      name: 'Théâtre Municipal', 
      type: 'monument', 
      coordinates: { lat: -23.5451, lng: -46.6384, x: 470, y: 485 },
      symbol: 'theater',
      description: 'Un joyau architectural inauguré en 1911, inspiré de l\'Opéra de Paris.',
      category: 'tourist'
    }
  ]
};
