
import { MapData } from './types';

export const SP_BOUNDARY_COORDS: [number, number][] = [
  [-23.35, -46.65], // Extrême Nord (Cantareira)
  [-23.38, -46.55],
  [-23.42, -46.45],
  [-23.45, -46.38], // Nord-Est
  [-23.50, -46.37],
  [-23.55, -46.36], // Extrême Est (Itaim Paulista)
  [-23.60, -46.40],
  [-23.68, -46.45], // Sud-Est
  [-23.75, -46.60],
  [-23.85, -46.62],
  [-23.98, -46.65], // Extrême Sud (Marsilac/Parelheiros)
  [-23.90, -46.75],
  [-23.80, -46.82], // Sud-Ouest
  [-23.70, -46.85],
  [-23.62, -46.86], // Extrême Ouest
  [-23.55, -46.80],
  [-23.48, -46.78],
  [-23.42, -46.75], // Nord-Ouest
  [-23.38, -46.70],
];

export const SP_MAP_DATA: MapData = {
  neighborhoods: [
    { id: 'se', name: 'Le Centre (Sé)' },
    { id: 'republica', name: 'République' },
    { id: 'liberdade', name: 'Quartier de la Liberté' },
    { id: 'santana', name: 'Santana (Nord)' },
    { id: 'vmaria', name: 'Vila Maria' },
    { id: 'vMariana', name: 'Vila Mariana' },
    { id: 'moema', name: 'Moema' },
    { id: 'tatuape', name: 'Tatuapé' },
    { id: 'mooca', name: 'Mooca' },
    { id: 'pinheiros', name: 'Pinheiros' },
    { id: 'butanta', name: 'Butantã' },
    { id: 'lapa', name: 'Lapa' },
  ],
  landmarks: [
    { 
      id: 'casa_tininha', 
      name: 'Maison Tininha', 
      type: 'custom', 
      coordinates: { lat: -23.5934, lng: -46.7265, x: 310, y: 580 },
      description: 'Adresse : Rua Dr. Cristiano de Sousa, 122 - Jardim Leonor, São Paulo - SP, 05658-010. Située en Zone Sud, près du Stade Morumbi.',
      color: '#8b5cf6',
      symbol: 'home'
    },
    { 
      id: 'ambienta', 
      name: 'Bureau Ambienta', 
      type: 'custom', 
      coordinates: { lat: -23.582772, lng: -46.685338, x: 350, y: 540 },
      description: 'Espace de travail Ambienta situé à Jardim Paulistano.',
      color: '#f97316',
      symbol: 'work'
    },
    { 
      id: 'casa_christina', 
      name: 'Maison de Christina', 
      type: 'custom', 
      coordinates: { lat: -23.633575, lng: -46.736021, x: 290, y: 680 },
      description: 'Résidence située à Vila Andrade.',
      color: '#8b5cf6',
      symbol: 'building'
    },
    { 
      id: 'estacao_butanta', 
      name: 'Gare de Butantã', 
      type: 'custom', 
      coordinates: { lat: -23.5718, lng: -46.7086, x: 280, y: 480 },
      description: 'Pôle de transport multimodal (Métro et Bus).',
      color: '#06b6d4',
      symbol: 'train'
    },
    { 
      id: 'paulista', 
      name: 'Avenue Paulista', 
      type: 'street', 
      coordinates: { lat: -23.5614, lng: -46.6559, x: 380, y: 500 },
      description: 'Le cœur financier et culturel de São Paulo, célèbre pour ses musées et ses gratte-ciel.'
    },
    { 
      id: 'se_cathedral', 
      name: 'Cathédrale Métropolitaine de la Sé', 
      type: 'monument', 
      coordinates: { lat: -23.5504, lng: -46.6339, x: 500, y: 475 },
      description: 'Point zéro de la ville, l\'un des plus grands temples néogothiques au monde.'
    },
    { 
      id: 'ibirapuera', 
      name: "Parc d'Ibirapuera", 
      type: 'park', 
      coordinates: { lat: -23.5874, lng: -46.6576, x: 450, y: 700 },
      description: 'Le parc le plus important de la ville, avec des lacs, des musées et des pistes cyclables.'
    },
    { 
      id: 'masp', 
      name: "MASP (Musée d'Art de São Paulo)", 
      type: 'monument', 
      coordinates: { lat: -23.5615, lng: -46.6559, x: 380, y: 500 },
      description: 'Musée emblématique célèbre pour son architecture suspendue sur quatre piliers rouges.'
    },
    { 
      id: 'mercadão', 
      name: 'Grand Marché Municipal', 
      type: 'monument', 
      coordinates: { lat: -23.5417, lng: -46.6297, x: 520, y: 450 },
      description: 'Le célèbre Marché Municipal, connu pour son architecture, ses vitraux et ses fruits exotiques.'
    }
  ]
};
