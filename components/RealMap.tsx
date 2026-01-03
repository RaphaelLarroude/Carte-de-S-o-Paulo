
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
  selectedLandmark: Landmark | CustomMarker | null;
  onUserLocationUpdate?: (coords: {lat: number, lng: number} | null) => void;
  routeGeometry?: any;
  routeColor?: string;
}

const TILE_LAYERS = {
  standard: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
};

const SYMBOL_PATHS: Record<string, string> = {
  'map-pin': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
  'home': '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
  'building': '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h8"></path><path d="M8 10h8"></path><path d="M8 14h8"></path>',
  'work': '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
  'school': '<path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path>',
  'train': '<path d="M2 14h20M7 8h10M9 22H7M15 22h2M4 18h16V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v13Z"></path>'
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
  selectedLandmark,
  onUserLocationUpdate,
  routeGeometry,
  routeColor = '#3b82f6'
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

    // Adiciona o contorno da cidade de São Paulo
    boundaryLayerRef.current = L.polygon(SP_BOUNDARY_COORDS as L.LatLngExpression[], {
      color: '#059669',
      weight: 3,
      opacity: 0.6,
      fillColor: '#059669',
      fillOpacity: 0.05,
      dashArray: '8, 8',
      interactive: false,
    }).addTo(map);

    SP_MAP_DATA.landmarks.forEach(landmark => {
      const iconPath = SYMBOL_PATHS[landmark.symbol || 'map-pin'] || SYMBOL_PATHS['map-pin'];
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-container"><div style="background-color: ${landmark.color || '#059669'}" class="w-10 h-10 rounded-[14px] border-2 border-white shadow-xl flex items-center justify-center text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">${iconPath}</svg></div></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });
      L.marker([landmark.coordinates.lat, landmark.coordinates.lng], { icon })
        .addTo(map)
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onLandmarkClick(landmark.id);
        });
    });

    map.on('click', (e) => onMapClick(e.latlng));
    return () => { if (mapRef.current) mapRef.current.remove(); mapRef.current = null; };
  }, []);

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
        html: `<div class="marker-container"><div style="background-color: ${m.color}" class="w-10 h-10 rounded-[14px] border-2 border-white shadow-xl flex items-center justify-center text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">${iconPath}</svg></div></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
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
      const geoLayer = L.geoJSON(routeGeometry, {
        style: {
          color: routeColor,
          weight: 7,
          opacity: 0.9,
          dashArray: routeColor === '#f59e0b' ? '10, 10' : '1, 1', // Tracejado para ônibus
          lineCap: 'round',
          lineJoin: 'round'
        }
      }).addTo(routeLayerRef.current);
      mapRef.current.fitBounds(geoLayer.getBounds(), { padding: [80, 80], animate: true });
    }
  }, [routeGeometry, routeColor]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (pendingCoords) {
      if (!pendingMarkerRef.current) {
        const icon = L.divIcon({
          className: 'pending-marker',
          html: `<div class="animate-bounce bg-slate-900 w-12 h-12 rounded-2xl border-4 border-white flex items-center justify-center text-emerald-400 shadow-2xl"><Plus size={24}/></div>`,
          iconSize: [48, 48],
          iconAnchor: [24, 48]
        });
        pendingMarkerRef.current = L.marker([pendingCoords.lat, pendingCoords.lng], { icon }).addTo(mapRef.current);
      } else pendingMarkerRef.current.setLatLng([pendingCoords.lat, pendingCoords.lng]);
    } else if (pendingMarkerRef.current) {
      pendingMarkerRef.current.remove();
      pendingMarkerRef.current = null;
    }
  }, [pendingCoords]);

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
              html: `<div class="relative"><div class="absolute inset-0 w-8 h-8 bg-blue-500/20 rounded-full animate-ping -translate-x-1/2 -translate-y-1/2"></div><div class="w-4 h-4 bg-blue-600 rounded-full border-4 border-white -translate-x-1/2 -translate-y-1/2 shadow-xl"></div></div>`,
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
      <button onClick={handleLocateMe} className="absolute z-[1000] bottom-10 right-4 bg-white/95 backdrop-blur p-4 rounded-3xl shadow-2xl border border-white hover:bg-slate-50 transition-all active:scale-95">
        <Navigation size={28} className={isLocating ? 'animate-pulse' : ''} fill={userMarkerRef.current ? '#2563eb' : 'none'} />
      </button>
    </div>
  );
});

export default RealMap;
