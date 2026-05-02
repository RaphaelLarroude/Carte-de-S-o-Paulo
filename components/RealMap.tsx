
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { SP_MAP_DATA, SP_BOUNDARY_COORDS } from '../constants';
import L from 'leaflet';
import { MapStyle } from '../App';
import { Navigation, Footprints, Plus } from 'lucide-react';
import { Landmark, CustomMarker } from '../types';

interface RealMapProps {
  onLandmarkClick: (id: string) => void;
  onCustomLandmarkClick: (marker: CustomMarker) => void;
  mapStyle: MapStyle;
  customMarkers: CustomMarker[];
  isAddingMode: boolean;
  onMapClick: (latlng: L.LatLng) => void;
  pendingCoords: { lat: number; lng: number } | null;
  pendingMarkerStyle?: { color: string; symbol: string };
  selectedLandmark: Landmark | CustomMarker | null;
  onUserLocationUpdate?: (coords: {lat: number, lng: number} | null) => void;
  routeGeometry?: any;
  routeColor?: string;
  isSidebarOpen?: boolean;
}

const TILE_LAYERS = {
  standard: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
};

const SYMBOL_PATHS: Record<string, string> = {
  'map-pin': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
  'home': '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
  'building': '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h8"></path><path d="M8 10h8"></path><path d="M8 14h8"></path>',
  'building-2': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path>',
  'work': '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
  'school': '<path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path>',
  'train': '<path d="M2 14h20M7 8h10M9 22H7M15 22h2M4 18h16V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v13Z"></path>',
  'bus': '<path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h20"></path><path d="M2 18h20"></path><rect width="16" height="12" x="4" y="2" rx="2"></rect><path d="M4 18v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle>',
  'car': '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.2-1.4.7l-1.5 2c-.1.2-.1.5-.1.7V16c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle><path d="M13 17h2"></path><path d="M7 17h2"></path>',
  'bike': '<circle cx="18.5" cy="17.5" r="3.5"></circle><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="15" cy="5" r="1"></circle><path d="M12 17.5V14l-3-3 4-3 2 3h2"></path>',
  'plane': '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>',
  'ship': '<path d="M2 21c.6.5 1.2 1 2.5 1 1.4 0 2.1-1.5 3.5-1.5s2.1 1.5 3.5 1.5 2.1-1.5 3.5-1.5 2.1 1.5 3.5 1.5c1.3 0 1.9-.5 2.5-1"></path><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.2.94 4.19 2.42 5.58"></path><path d="M11 13h2"></path><path d="M11 9h2"></path><path d="M11 5h2"></path><path d="M3 10h18"></path>',
  'tram': '<rect width="16" height="10" x="4" y="3" rx="2"></rect><path d="M14 19V13"></path><path d="M10 19V13"></path><path d="M18 21h-2"></path><path d="M8 21H6"></path><path d="M2 13h2"></path><path d="M20 13h2"></path><path d="M12 3v-2"></path>',
  'rocket': '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"></path><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"></path>',
  'tent': '<path d="M3.5 21 14 3l10.5 18"></path><path d="M8.4 12.6 14 21"></path><path d="M14 21h-8"></path><path d="M14 3v18"></path>',
  'mountain': '<path d="m8 3 4 8 5-5 5 15H2L8 3z"></path>',
  'waves': '<path d="M2 6c.6.5 1.2 1 2.5 1C5.9 7 6.6 5.5 8 5.5s2.1 1.5 3.5 1.5c1.4 0 2.1-1.5 3.5-1.5s2.1 1.5 3.5 1.5c1.4 0 2.1-1.5 3.5-1.5s2.1 1.5 3.5 1.5c1.3 0 1.9-.5 2.5-1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 1.4 0 2.1-1.5 3.5-1.5s2.1 1.5 3.5 1.5 2.1-1.5 3.5-1.5 2.1 1.5 3.5 1.5c1.4 0 2.1-1.5 3.5-1.5s2.1 1.5 3.5 1.5c1.3 0 1.9-.5 2.5-1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 1.4 0 2.1-1.5 3.5-1.5s2.1 1.5 3.5 1.5 2.1-1.5 3.5-1.5 2.1 1.5 3.5 1.5c1.4 0 2.1-1.5 3.5-1.5s2.1 1.5 3.5 1.5c1.3 0 1.9-.5 2.5-1"></path>',
  'sun': '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>',
  'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>',
  'store': '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path><path d="M2 7h20"></path><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"></path>',
  'warehouse': '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"></path><path d="M6 18h12"></path><path d="M6 14h12"></path><rect width="12" height="12" x="6" y="10"></rect>',
  'factory': '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H2v18Z"></path><path d="M17 18h1"></path><path d="M12 18h1"></path><path d="M7 18h1"></path>',
  'church': '<path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2"></path><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"></path><path d="M18 5 12 2 6 5"></path><path d="M12 7v5"></path><path d="M10 9h4"></path>',
  'university': '<circle cx="12" cy="10" r="1"></circle><path d="M22 20V8L12 3 2 8v12h20Z"></path><path d="M6 17v.01"></path><path d="M6 13v.01"></path><path d="M18 17v.01"></path><path d="M18 13v.01"></path><path d="M14 22v-5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"></path>',
  'hospital': '<path d="M12 6v4"></path><path d="M14 14h-4"></path><path d="M14 18h-4"></path><path d="M14 8h-4"></path><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8Z"></path>',
  'hotel': '<path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"></path><path d="M7 14h10"></path><path d="M7 18h10"></path><path d="M7 10h10"></path><path d="M7 6h10"></path>',
  'landmark': '<line x1="3" y1="22" x2="21" y2="22"></line><line x1="6" y1="18" x2="6" y2="11"></line><line x1="10" y1="18" x2="10" y2="11"></line><line x1="14" y1="18" x2="14" y2="11"></line><line x1="18" y1="18" x2="18" y2="11"></line><polygon points="12 2 20 7 4 7 12 2"></polygon>',
  'castle': '<path d="M22 20v-9H2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"></path><path d="M18 11V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"></path><path d="M6 11V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"></path><path d="M2 11V8a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"></path><path d="M22 11V8a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"></path><rect width="4" height="4" x="10" y="14" rx="1"></rect>',
  'utensils': '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>',
  'cup-soda': '<path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"></path><path d="M5 8h14"></path><path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"></path><path d="m12 8 1-6h2"></path>',
  'coffee': '<path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"></path><path d="M6 2v2"></path><path d="M10 2v2"></path><path d="M14 2v2"></path>',
  'pizza': '<path d="M15 11h.01"></path><path d="M19 16h.01"></path><path d="M20 7c0-2.8-2.2-5-5-5-4 0-11 7-11 11 0 2.8 2.2 5 5 5 4 0 11-7 11-11Z"></path><path d="M11 7h.01"></path><path d="M7 15h.01"></path><path d="M13 15h.01"></path>',
  'cake': '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path><path d="M4 16h16"></path><path d="M10 9V3l2 1 2-1v6"></path><path d="M2 21h20"></path><path d="M7 8v1"></path><path d="M17 8v1"></path>',
  'apple': '<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.91 4.91 0 0 0-5 4.78c0 4.22 3 12.22 6 12.22 1.25 0 2.5-1.06 4-1.06Z"></path><path d="M12 5V2"></path>',
  'beer': '<path d="M17 11h1a3 3 0 0 1 0 6h-1"></path><path d="M9 12v6"></path><path d="M13 12v6"></path><path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.5.5 2.5.5s1.44-.5 3-.5 2.22.5 3 .5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-3-.5Z"></path><path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"></path>',
  'wine': '<path d="M8 22h8"></path><path d="M7 10h10"></path><path d="M12 15v7"></path><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"></path>',
  'ice-cream': '<path d="m7 11 4.3 8.2a1 1 0 0 0 1.4 0L17 11"></path><path d="M12 12A5 5 0 0 0 17 7c0-2.2-2-4-5-4s-5 1.8-5 4a5 5 0 0 0 5 5Z"></path><path d="M8 7c0 1.1.9 2 2 2"></path>',
  'shopping-cart': '<circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>',
  'shopping-bag': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path>',
  'pill': '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path>',
  'trash-2': '<path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>',
  'heart': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>',
  'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
  'flag': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>',
  'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>',
  'info': '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>',
  'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>',
  'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
  'eye': '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle>',
  'compass': '<circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>',
  'navigation': '<polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>',
  'navigation-2': '<polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>',
  'search': '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>',
  'crosshair': '<circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line>',
  'target': '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>',
  'locate': '<line x1="2" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="22"></line><circle cx="12" cy="12" r="7"></circle>',
  'locate-fixed': '<line x1="2" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="22"></line><circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="3"></circle>',
  'pin': '<path d="M12 2v8"></path><path d="m4.93 10.93 1.41 1.41"></path><path d="M2 18h20"></path><path d="m19.07 10.93-1.41 1.41"></path><path d="M12 22v-8"></path><path d="m4.93 21.07 1.41-1.41"></path><path d="m19.07 21.07-1.41-1.41"></path>',
  'tree-palm': '<path d="M14 6c0-1.8 1.4-3 3-3s3 1.2 3 3"></path><path d="M22 6s-2 3-5 3"></path><path d="M16 11c0-1.8-1.4-3-3-3s-3 1.2-3 3"></path><path d="M8 11s2 3 5 3"></path><path d="M12 22s2-3 2-9"></path><path d="M12 22s-2-3-2-9"></path><path d="M12 22s2-3 2-9"></path>',
  'flower-2': '<path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path><path d="M12 12c2.1 4.4 5.2 5.7 8 3.6"></path><path d="M12 12c5.9-1.8 7.4-4.7 5.1-6.1"></path><path d="M12 12c1.9-6.3-1.1-8.5-3.6-6.1"></path><path d="M12 12c-4.4-4.6-7.5-3.5-8 0"></path><path d="M12 12c-6.8 1-9.5 4.1-7.8 6"></path><path d="M12 12c-1.1 6.8 2.1 8 5.4 6"></path>',
  'cloud': '<path d="M17.5 19x2a4.5 4.5 0 0 0 2.09-8.5 5 5 0 0 0-9.59-1.9A3.5 3.5 0 0 0 6.5 15H17l.5 4z"></path>',
  'leaf': '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>',
  'sprout': '<path d="M7 20h10"></path><path d="M10 20c5.5-2.5 8-6.4 8-11.7V2c-5.5 0-10 4.5-10 10v8"></path><path d="M13 17c2-3 3-5 3-5"></path>',
  'fuel': '<line x1="3" y1="22" x2="15" y2="22"></line><path d="M4 9h8"></path><path d="M14 22V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v18"></path><path d="M14 22h2a2 2 0 0 0 2-2V9c0-1.1.9-2 2-2s2 .9 2 2v7"></path><circle cx="20" cy="18" r="2"></circle>',
  'parking': '<circle cx="12" cy="12" r="10"></circle><path d="M9 17V7h4a3 3 0 0 1 0 6H9"></path>',
  'dollar-sign': '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
  'credit-card': '<rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line>',
  'piggy-bank': '<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-.9-.1-1.5-1-3 1.5 0 3-2 3-3.5A2.5 2.5 0 0 0 19 5Z"></path><path d="M7 14s.5-1 2-1"></path><path d="M11 4v4"></path>',
  'tag': '<path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.59-8.59a1 1 0 0 0 0-1.41z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>',
  'gift': '<polyline points="20 12 20 22 4 22 4 12"></polyline><rect width="20" height="5" x="2" y="7"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>',
  'stethoscope': '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path><path d="M8 15v1a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6v-4"></path><circle cx="20" cy="10" r="2"></circle>',
  'microscope': '<path d="M6 18h8"></path><path d="M3 22h18"></path><path d="M14 22a7 7 0 1 0-14 0"></path><path d="M9 14h2"></path><path d="M9 12a2 2 0 1 0-2 2"></path><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"></path>',
  'syringe': '<path d="m18 2 4 4"></path><path d="m14 6 4 4"></path><path d="M21 9l-8.5 8.5"></path><path d="M18 12l-8.5 8.5"></path><path d="M3 21l3-3"></path><path d="m5 13 6 6"></path>',
  'thermometer': '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>',
  'dna': '<path d="M8 3c-1.5 2-1.5 5 0 7"></path><path d="M16 21c1.5-2 1.5-5 0-7"></path><path d="M8 14c-1.5 2-1.5 5 0 7"></path><path d="M16 10c1.5-2 1.5-5 0-7"></path><path d="M2 12h20"></path><path d="m4.34 20.34 15.32-15.32"></path><path d="m19.66 20.34-15.32-15.32"></path>',
  'flask': '<path d="M9 2v4"></path><path d="M15 2v4"></path><path d="M12 17v.01"></path><path d="M10 22h4"></path><path d="M10 2h4"></path><path d="M20 19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2l5-13h6l5 13Z"></path>',
  'laptop': '<rect width="18" height="12" x="3" y="4" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line>',
  'smartphone': '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>',
  'tablet': '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>',
  'monitor': '<rect width="20" height="14" x="2" y="3" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
  'mail': '<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>',
  'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',
  'wifi': '<path d="M5 13a10 10 0 0 1 14 0"></path><path d="M8.5 16.5a5 5 0 0 1 7 0"></path><path d="M2 9a15 15 0 0 1 20 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line>',
  'camera': '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle>',
  'mic': '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line>',
  'headphones': '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"></path>',
  'music': '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>',
  'film': '<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M7 3v18"></path><path d="M17 3v18"></path><path d="M3 7h4"></path><path d="M3 12h4"></path><path d="M3 17h4"></path><path d="M17 7h4"></path><path d="M17 12h4"></path><path d="M17 17h4"></path>',
  'gamepad': '<line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><rect width="20" height="12" x="2" y="6" rx="2"></rect><circle cx="15" cy="12" r="1"></circle><circle cx="18" cy="10" r="1"></circle><circle cx="18" cy="14" r="1"></circle>',
  'trophy': '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>',
  'dumbbell': '<path d="M14.4 6.7 17.3 3.8"></path><path d="M15.8 8.1 18.7 5.2"></path><path d="M7.9 15.8 5 18.7"></path><path d="M6.5 14.4 3.6 17.3"></path><path d="m2 2 2 2"></path><path d="m20 20 2 2"></path><path d="M6.3 6.3 3.5 9.1a1 1 0 0 0 0 1.4l2.8 2.8a1 1 0 0 0 1.4 0l2.8-2.8a1 1 0 0 0 0-1.4L7.7 6.3a1 1 0 0 0-1.4 0Z"></path><path d="M19.1 13.5 16.3 16.3a1 1 0 0 0 0 1.4l2.8 2.8a1 1 0 0 0 1.4 0l2.8-2.8a1 1 0 0 0 0-1.4l-2.8-2.8a1 1 0 0 0-1.4 0Z"></path><path d="m9.2 9.2 5.6 5.6"></path>',
  'book': '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6.5 18H20"></path>',
  'palette': '<circle cx="13.5" cy="9.5" r=".5"></circle><circle cx="17.5" cy="14.5" r=".5"></circle><circle cx="8.5" cy="14.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.76-.12 2.5-.35 1.1-.36 1.5-.9 1.5-1.9 0-1.12.44-1.91 1.5-2 1.06-.09 1.6.4.2 .9 2.5 0 5-4.5 5-10S17.5 2 12 2Z"></path>',
  'hammer': '<path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0-.83-.83-.83-2.17 0-3L12 9"></path><path d="M17.64 15 19 13.6!4a2 2 0 0 0 0-2.83l-5.66-5.66a2 2 0 0 0-2.83 0l-1.41 1.41 6.36 6.36Z"></path><path d="m14 11 6-6"></path>',
  'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>',
  'screwdriver': '<path d="M14.5 2v5a1 1 0 0 1-1 1H11l-7 7v4a2 2 0 0 0 2 2h4l7-7V10.5a1 1 0 0 1 1-1h5V2h-5Z"></path><path d="m9 15 11-11"></path>',
  'pen-tool': '<path d="m12 19 7-7 3 3-7 7-3-3Z"></path><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z"></path><path d="m2 2 5 5"></path><circle cx="11" cy="11" r="2"></circle>',
  'lamp': '<path d="M8 2h8a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Z"></path><path d="M12 11v8"></path><path d="M8 22h8"></path>',
  'key': '<circle cx="7.5" cy="15.5" r="5.5"></circle><path d="m21 2-9.6 9.6"></path><path d="m15.5 7.5 3 3L22 7l-3-3"></path>',
  'unlock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>',
  'theater': '<path d="M2 13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="m11 15 1-2 1 2"></path><path d="M12 21v-3"></path><path d="M14 6c0-1.1-.9-2-2-2s-2 .9-2 2"></path><path d="M18 15h.01"></path><path d="M6 15h.01"></path>',
  'ghost': '<path d="M9 10h.01"></path><path d="M15 10h.01"></path><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8Z"></path>',
  'skull': '<circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><path d="M8 20v2h8v-2a4 4 0 0 0-8 0Z"></path><path d="M12 2h.01a8 8 0 0 0 4 15v3H8v-3A8 8 0 0 0 12 2Z"></path>'
};

const STATE_BOUNDS = L.latLngBounds([-25.5, -53.2], [-19.5, -44.0]);

const RealMap = forwardRef<{ triggerLocate: () => void }, RealMapProps>(({ 
  onLandmarkClick, 
  onCustomLandmarkClick,
  mapStyle, 
  customMarkers, 
  isAddingMode, 
  onMapClick,
  pendingCoords,
  pendingMarkerStyle,
  selectedLandmark,
  onUserLocationUpdate,
  routeGeometry,
  routeColor = '#3b82f6',
  isSidebarOpen
}, ref) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const pendingMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const customMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const boundaryLayerRef = useRef<L.Polygon | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useImperativeHandle(ref, () => ({
    triggerLocate: handleLocateMe
  }));

  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      maxBounds: STATE_BOUNDS,
      maxBoundsViscosity: 1.0, 
      minZoom: 8,
    }).setView([-23.5505, -46.6333], 11);
    
    mapRef.current = map;
    customMarkersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    tileLayerRef.current = L.tileLayer(TILE_LAYERS[mapStyle], {
      maxZoom: 19,
      bounds: STATE_BOUNDS,
    }).addTo(map);

    boundaryLayerRef.current = L.polygon(SP_BOUNDARY_COORDS as L.LatLngExpression[], {
      color: '#059669',
      weight: 2,
      opacity: 0.4,
      fillColor: '#059669',
      fillOpacity: 0.03,
      interactive: false,
    }).addTo(map);

    SP_MAP_DATA.landmarks.forEach(landmark => {
      const iconPath = SYMBOL_PATHS[landmark.symbol || 'map-pin'] || SYMBOL_PATHS['map-pin'];
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-container"><div style="background-color: ${landmark.color || '#10b981'}" class="w-9 h-9 rounded-[12px] border-2 border-white shadow-xl flex items-center justify-center text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">${iconPath}</svg></div></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });
      L.marker([landmark.coordinates.lat, landmark.coordinates.lng], { icon })
        .addTo(map)
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onLandmarkClick(landmark.id);
        });
    });

    map.on('click', (e) => onMapClickRef.current(e.latlng));
    return () => { if (mapRef.current) mapRef.current.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize({ animate: true });
      }, 300); // Wait for transition
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    if (mapRef.current && selectedLandmark && !routeGeometry) {
      mapRef.current.flyTo([selectedLandmark.coordinates.lat, selectedLandmark.coordinates.lng], 15);
    }
  }, [selectedLandmark, routeGeometry]);

  useEffect(() => {
    if (!mapRef.current || !customMarkersLayerRef.current) return;
    customMarkersLayerRef.current.clearLayers();
    customMarkers.forEach(m => {
      const iconPath = SYMBOL_PATHS[m.symbol] || SYMBOL_PATHS['map-pin'];
      const icon = L.divIcon({
        className: 'user-marker',
        html: `<div class="marker-container"><div style="background-color: ${m.color}" class="w-9 h-9 rounded-[12px] border-2 border-white shadow-xl flex items-center justify-center text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">${iconPath}</svg></div></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });
      L.marker([m.coordinates.lat, m.coordinates.lng], { icon })
        .addTo(customMarkersLayerRef.current!)
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onCustomLandmarkClick(m);
        });
    });
  }, [customMarkers]);

  useEffect(() => {
    if (!mapRef.current || !routeLayerRef.current) return;
    routeLayerRef.current.clearLayers();
    if (routeGeometry) {
      try {
        const geoLayer = L.geoJSON(routeGeometry, {
          style: {
            color: routeColor,
            weight: 6,
            opacity: 0.9,
            dashArray: routeColor === '#f59e0b' ? '8, 8' : '1, 1',
            lineCap: 'round',
            lineJoin: 'round'
          }
        }).addTo(routeLayerRef.current);
        
        // Relax max bounds temporarily to show the route if it goes outside
        const currentMaxBounds = mapRef.current.options.maxBounds;
        mapRef.current.setMaxBounds(null);
        
        mapRef.current.fitBounds(geoLayer.getBounds(), { padding: [40, 100], animate: true });
        
        // Restore max bounds after a delay or just let it be relaxed for now
        // To be safe, we just leave it relaxed while route is active
      } catch (e) {
        console.error("Error rendering route:", e);
      }
    } else {
      // Restore default max bounds if route is cleared
      mapRef.current.setMaxBounds(STATE_BOUNDS);
    }
  }, [routeGeometry, routeColor]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (pendingCoords) {
      const color = pendingMarkerStyle?.color || '#0f172a';
      const iconPath = SYMBOL_PATHS[pendingMarkerStyle?.symbol || 'map-pin'] || SYMBOL_PATHS['map-pin'];
      
      const icon = L.divIcon({
        className: 'pending-marker',
        html: `<div class="marker-container animate-bounce"><div style="background-color: ${color}" class="w-11 h-11 rounded-[14px] border-4 border-white shadow-2xl flex items-center justify-center text-white"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">${iconPath}</svg></div></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 44]
      });

      if (!pendingMarkerRef.current) {
        pendingMarkerRef.current = L.marker([pendingCoords.lat, pendingCoords.lng], { icon }).addTo(mapRef.current);
      } else {
        pendingMarkerRef.current.setLatLng([pendingCoords.lat, pendingCoords.lng]);
        pendingMarkerRef.current.setIcon(icon);
      }
    } else if (pendingMarkerRef.current) {
      pendingMarkerRef.current.remove();
      pendingMarkerRef.current = null;
    }
  }, [pendingCoords, pendingMarkerStyle]);

  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(TILE_LAYERS[mapStyle]);
  }, [mapStyle]);

  async function handleLocateMe() {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
        onUserLocationUpdate?.({ lat: latLng.lat, lng: latLng.lng });
        if (mapRef.current) {
          if (!userMarkerRef.current) {
            const icon = L.divIcon({
              className: 'user-pos',
              html: `<div class="relative"><div class="absolute inset-0 w-8 h-8 bg-blue-500/30 rounded-full animate-ping -translate-x-1/2 -translate-y-1/2"></div><div class="w-4 h-4 bg-blue-600 rounded-full border-[3px] border-white -translate-x-1/2 -translate-y-1/2 shadow-lg"></div></div>`,
            });
            userMarkerRef.current = L.marker(latLng, { icon }).addTo(mapRef.current);
          } else userMarkerRef.current.setLatLng(latLng);
          if (!selectedLandmark) mapRef.current.flyTo(latLng, 14);
        }
      },
      () => setIsLocating(false)
    );
  }

  return (
    <div className={`relative w-full h-full ${isAddingMode ? 'cursor-crosshair' : ''}`}>
      <div ref={containerRef} className="w-full h-full" />
      {/* Location button - adjusted for mobile safety */}
      <button 
        onClick={handleLocateMe} 
        className="absolute z-[1000] bottom-24 lg:bottom-10 right-4 bg-white shadow-2xl p-4 rounded-2xl border border-white hover:bg-slate-50 active:scale-90 transition-all"
      >
        <Navigation size={24} className={isLocating ? 'animate-pulse' : ''} fill={userMarkerRef.current ? '#2563eb' : 'none'} />
      </button>
    </div>
  );
});

export default RealMap;
