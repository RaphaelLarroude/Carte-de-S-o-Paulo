
import React, { useState, useEffect, useCallback, useRef } from 'react';
import RealMap from './components/RealMap';
import { SP_MAP_DATA } from './constants';
import { Landmark, CustomMarker } from './types';
import { getGroundedLocationInfo } from './services/geminiService';
import { getAllTravelInfo, TravelModes } from './services/geoUtils';
import { 
  Compass, 
  ChevronRight, 
  ChevronLeft, 
  ExternalLink, 
  MapPin, 
  X, 
  Layers, 
  Loader2, 
  Plus, 
  Trash2,
  Map as MapIcon,
  Info,
  Navigation,
  Home,
  Building2,
  Briefcase,
  GraduationCap,
  TrainFront,
  Bus,
  Ruler,
  Car,
  Clock,
  ArrowRight,
  Info as InfoIcon,
  Navigation2,
  Share as ShareIcon,
  PlusSquare
} from 'lucide-react';

export type MapStyle = 'standard' | 'satellite';

const COLORS = [
  { name: 'Émeraude', hex: '#10b981' },
  { name: 'Rubis', hex: '#ef4444' },
  { name: 'Saphir', hex: '#3b82f6' },
  { name: 'Or', hex: '#f59e0b' },
  { name: 'Améthyste', hex: '#8b5cf6' },
  { name: 'Onyx', hex: '#1f2937' },
  { name: 'Ciel', hex: '#06b6d4' }
];

const SYMBOLS = [
  { id: 'map-pin', Icon: MapPin },
  { id: 'home', Icon: Home },
  { id: 'building', Icon: Building2 },
  { id: 'work', Icon: Briefcase },
  { id: 'school', Icon: GraduationCap },
  { id: 'train', Icon: TrainFront }
];

export const getSymbolIcon = (id: string, size = 20, color = "currentColor") => {
  const symbol = SYMBOLS.find(s => s.id === id) || SYMBOLS[0];
  return <symbol.Icon size={size} color={color} />;
};

const App: React.FC = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showInstallHint, setShowInstallHint] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | CustomMarker | null>(null);
  const [groundedInfo, setGroundedInfo] = useState<{ text: string, links: {uri: string, title: string}[] }>({ text: '', links: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth >= 1024);
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const [travelData, setTravelData] = useState<TravelModes | null>(null);
  const [travelMode, setTravelMode] = useState<'car' | 'train' | 'bus'>('car');
  const [isCalculating, setIsCalculating] = useState(false);

  const [customMarkers, setCustomMarkers] = useState<CustomMarker[]>(() => {
    const saved = localStorage.getItem('sp_custom_markers');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{lat: number, lng: number} | null>(null);
  const [newMarkerForm, setNewMarkerForm] = useState({ 
    title: '', 
    description: '', 
    color: COLORS[0].hex,
    symbol: SYMBOLS[0].id 
  });

  const mapRef = useRef<{ triggerLocate: () => void }>(null);

  // Initial Loading & PWA Logic
  useEffect(() => {
    // Check if on iOS and NOT in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isIOS && !isStandalone) {
      // Delay hint slightly after splash screen
      setTimeout(() => setShowInstallHint(true), 4000);
    }

    const steps = [
      "Initialisation du moteur de carte...",
      "Connexion aux services de géolocalisation...",
      "Chargement des points d'intérêt...",
      "Synchronisation avec l'IA Gemini..."
    ];

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);

    const timer = setTimeout(() => {
      setIsInitialLoading(false);
      clearInterval(stepInterval);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(stepInterval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('sp_custom_markers', JSON.stringify(customMarkers));
  }, [customMarkers]);

  const handleLandmarkClick = async (id: string) => {
    const landmark = [...SP_MAP_DATA.landmarks, ...customMarkers].find(l => l.id === id);
    if (landmark) {
      setSelectedLandmark(landmark);
      setTravelData(null);
      setLoading(true);
      const info = landmark.type === 'custom' ? { text: landmark.description, links: [] } : await getGroundedLocationInfo(landmark.name);
      setGroundedInfo(info);
      setLoading(false);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }
  };

  const handleCustomLandmarkClick = (marker: CustomMarker) => {
    handleLandmarkClick(marker.id);
  };

  const calculateRouteToSelected = async () => {
    if (!selectedLandmark) return;
    
    if (!userLocation) {
      mapRef.current?.triggerLocate();
      alert("Localisation en cours... (Suggestion : Utilisez la gare Morumbi comme point de départ)");
      return;
    }

    setIsCalculating(true);
    try {
      const data = await getAllTravelInfo(
        userLocation.lat, 
        userLocation.lng, 
        selectedLandmark.coordinates.lat, 
        selectedLandmark.coordinates.lng,
        selectedLandmark.id
      );
      setTravelData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleMapClick = (latlng: any) => {
    if (isAddingMode) {
      setPendingCoords({ lat: latlng.lat, lng: latlng.lng });
      if (window.innerWidth < 1024) setIsSidebarOpen(true);
    } else {
      if (selectedLandmark) {
        setSelectedLandmark(null);
        setTravelData(null);
      }
    }
  };

  const openInGoogleMaps = () => {
    if (!userLocation || !selectedLandmark) return;
    
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${selectedLandmark.coordinates.lat},${selectedLandmark.coordinates.lng}`;
    const mode = travelMode === 'car' ? 'driving' : 'transit';
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${mode}`;
    window.open(url, '_blank');
  };

  const saveCustomMarker = () => {
    if (!pendingCoords || !newMarkerForm.title) return;
    const newMarker: CustomMarker = {
      id: `custom-${Date.now()}`,
      name: newMarkerForm.title,
      type: 'custom',
      coordinates: pendingCoords,
      description: newMarkerForm.description,
      color: newMarkerForm.color,
      symbol: newMarkerForm.symbol
    };
    setCustomMarkers([...customMarkers, newMarker]);
    setPendingCoords(null);
    setIsAddingMode(false);
    setNewMarkerForm({ title: '', description: '', color: COLORS[0].hex, symbol: SYMBOLS[0].id });
    setSelectedLandmark(newMarker);
    setGroundedInfo({ text: newMarker.description, links: [] });
  };

  const loadingMessages = [
    "Initialisation du moteur de carte...",
    "Connexion aux services de géolocalisation...",
    "Chargement des points d'intérêt...",
    "Synchronisation avec l'IA Gemini..."
  ];

  return (
    <div className="h-[100dvh] w-screen bg-slate-50 text-slate-900 overflow-hidden relative flex flex-col lg:flex-row font-sans">
      
      {/* Splash Screen */}
      {isInitialLoading && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center animate-out fade-out duration-500 fill-mode-forwards">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-emerald-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl animate-bounce">
              <MapIcon size={40} />
            </div>
            <div className="absolute -inset-4 border-2 border-emerald-100 rounded-[48px] animate-pulse"></div>
          </div>
          <h1 className="font-display text-4xl font-black text-slate-800 mb-2 tracking-tight">Carte de São Paulo</h1>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm uppercase tracking-widest">{loadingMessages[loadingStep]}</span>
            </div>
            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 transition-all duration-500 ease-out" 
                style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* PWA iOS Install Hint */}
      {showInstallHint && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[5000] w-[calc(100%-2rem)] max-w-sm animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="bg-white/95 backdrop-blur-xl border border-emerald-100 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-sky-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                    <MapIcon size={20} />
                 </div>
                 <div className="flex flex-col">
                   <h3 className="font-black text-slate-800 text-sm tracking-tight">Installer l'application</h3>
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sur votre écran d'accueil</span>
                 </div>
              </div>
              <button onClick={() => setShowInstallHint(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={18} /></button>
            </div>
            <div className="space-y-4">
               <p className="text-xs text-slate-600 font-medium leading-relaxed">
                 Ouvrez cette carte en plein écran comme une application native :
               </p>
               <div className="flex flex-col gap-3">
                 <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-100">
                      <ShareIcon size={16} className="text-blue-600" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 flex-1">1. Appuyez sur le bouton "Partager"</span>
                 </div>
                 <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-100">
                      <PlusSquare size={16} className="text-slate-800" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 flex-1">2. Choisissez "Sur l'écran d'accueil"</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      <aside className={`
        fixed inset-y-0 left-0 lg:relative z-[3000] lg:z-[2000]
        bg-white lg:bg-white/80 lg:backdrop-blur-xl border-r border-slate-200
        transition-all duration-500 ease-in-out
        ${isSidebarOpen ? 'w-full sm:w-[420px] translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 overflow-hidden'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 sm:p-8 flex justify-between items-center border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <MapIcon size={20} />
              </div>
              <h1 className="font-display text-2xl font-black text-slate-800 tracking-tight">Carte de São Paulo</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2.5 hover:bg-slate-100 rounded-2xl text-slate-400">
              <ChevronLeft size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
            <section className={isAddingMode ? 'bg-emerald-50 p-6 rounded-[32px] border-2 border-emerald-200' : 'bg-slate-50 p-2 rounded-3xl'}>
              {!isAddingMode ? (
                <button 
                  onClick={() => setIsAddingMode(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-transform"
                >
                  <Plus size={20} /> Nouveau Marqueur
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Créer un Marqueur</span>
                    <button onClick={() => {setIsAddingMode(false); setPendingCoords(null);}} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                  </div>
                  {!pendingCoords ? (
                    <div className="text-center py-6 px-4 bg-white/60 rounded-2xl border border-emerald-100">
                      <p className="text-sm text-emerald-900 font-bold mb-1">Appuyez sur la carte</p>
                      <p className="text-xs text-emerald-600 font-medium leading-relaxed">Choisissez l'endroit où vous souhaitez enregistrer ce lieu.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <input 
                        type="text" 
                        placeholder="Nom du lieu..." 
                        className="w-full p-4 rounded-2xl ring-1 ring-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={newMarkerForm.title}
                        onChange={e => setNewMarkerForm({...newMarkerForm, title: e.target.value})}
                      />
                      <div className="grid grid-cols-6 gap-2">
                        {SYMBOLS.map(({ id, Icon }) => (
                          <button key={id} onClick={() => setNewMarkerForm({...newMarkerForm, symbol: id})} className={`aspect-square rounded-xl flex items-center justify-center transition-all ${newMarkerForm.symbol === id ? 'bg-slate-900 text-white' : 'bg-white border text-slate-400'}`}>
                            <Icon size={16} />
                          </button>
                        ))}
                      </div>
                      <button onClick={saveCustomMarker} disabled={!newMarkerForm.title} className="w-full py-4 bg-emerald-600 text-white rounded-[20px] font-bold shadow-lg active:scale-95 transition-all">Enregistrer le Lieu</button>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="space-y-6">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Explorer les Lieux</h2>
              <div className="space-y-2">
                {[...customMarkers, ...SP_MAP_DATA.landmarks].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleLandmarkClick(l.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedLandmark?.id === l.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'}`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      {l.type === 'custom' ? <div style={{ color: (l as CustomMarker).color }}>{getSymbolIcon((l as CustomMarker).symbol, 18)}</div> : <MapPin size={18} className="text-emerald-500" />}
                      <span className="font-bold text-sm truncate">{l.name}</span>
                    </div>
                    <ChevronRight size={16} className="opacity-30" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </aside>

      <main className="flex-1 relative bg-slate-100 no-print overflow-hidden">
        <RealMap 
          ref={mapRef}
          onLandmarkClick={handleLandmarkClick}
          onCustomLandmarkClick={handleCustomLandmarkClick}
          mapStyle={mapStyle}
          customMarkers={customMarkers}
          isAddingMode={isAddingMode}
          onMapClick={handleMapClick}
          pendingCoords={pendingCoords}
          selectedLandmark={selectedLandmark}
          onUserLocationUpdate={(coords) => setUserLocation(coords)}
          routeGeometry={travelData ? travelData[travelMode].geometry : undefined}
          routeColor={travelMode === 'bus' ? '#f59e0b' : travelMode === 'train' ? '#3b82f6' : '#10b981'}
        />

        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-white"
          >
            <Compass size={24} />
          </button>
          <button 
            onClick={() => setMapStyle(prev => prev === 'standard' ? 'satellite' : 'standard')}
            className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-white"
          >
            <Layers size={24} className={mapStyle === 'satellite' ? 'text-emerald-600' : 'text-slate-600'} />
          </button>
        </div>

        {/* HUD de Route */}
        {travelData && (
          <div className="absolute top-4 left-4 lg:left-6 z-[2000] w-[calc(100%-2rem)] max-w-sm pointer-events-none">
            <div className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white p-5 pointer-events-auto animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <span className="font-black text-[10px] uppercase tracking-widest text-blue-600">Trajet Recommandé</span>
                  <span className="text-[10px] font-bold text-slate-400">Origine : Position Actuelle</span>
                </div>
                <button onClick={() => setTravelData(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button onClick={() => setTravelMode('car')} className={`flex flex-col items-center py-3 rounded-2xl border-2 transition-all ${travelMode === 'car' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-50 text-slate-400'}`}>
                  <Car size={18}/><span className="text-[10px] font-bold mt-1">Voiture</span>
                </button>
                <button onClick={() => setTravelMode('train')} className={`flex flex-col items-center py-3 rounded-2xl border-2 transition-all ${travelMode === 'train' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-50 text-slate-400'}`}>
                  <TrainFront size={18}/><span className="text-[10px] font-bold mt-1">Train</span>
                </button>
                <button onClick={() => setTravelMode('bus')} className={`flex flex-col items-center py-3 rounded-2xl border-2 transition-all ${travelMode === 'bus' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-white border-slate-50 text-slate-400'}`}>
                  <Bus size={18}/><span className="text-[10px] font-bold mt-1">Bus</span>
                </button>
              </div>

              {(travelMode === 'bus' || travelMode === 'train') && travelData[travelMode].lines && (
                <div className="mb-4 animate-in fade-in zoom-in-95">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Lignes Suggérées</p>
                  <div className="flex flex-wrap gap-2">
                    {travelData[travelMode].lines?.map(line => (
                      <span key={line} className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tight flex items-center gap-1.5 ${travelMode === 'bus' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                         {travelMode === 'bus' ? <Bus size={10} /> : <TrainFront size={10} />}
                         {line}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-slate-50 p-4 rounded-2xl text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Distance</p>
                  <p className="text-xl font-black text-slate-800 tracking-tight">{travelData[travelMode].distanceKm} km</p>
                </div>
                <div className="flex-1 bg-blue-50 p-4 rounded-2xl text-center">
                  <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Temps Est.</p>
                  <p className="text-xl font-black text-blue-700 tracking-tight flex items-center justify-center gap-1"><Clock size={16}/> {travelData[travelMode].durationMinutes} min</p>
                </div>
              </div>

              <button 
                onClick={openInGoogleMaps}
                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-[20px] font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all mb-4"
              >
                <Navigation2 size={18} fill="white" />
                Lancer la Navigation
              </button>
              
              <div className="flex items-start gap-2 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <InfoIcon size={14} className="text-emerald-600 mt-0.5" />
                <p className="text-[10px] text-emerald-800 font-medium leading-relaxed">
                  {travelMode === 'bus' 
                    ? "Itinéraires de bus via le Terminal Morumbi ou l'avenue Nações Unidas." 
                    : travelMode === 'train' 
                    ? "Utilisation de la Ligne 9-Émeraude (CPTM) avec correspondance."
                    : "Trajet optimisé via Marginal Pinheiros ou Avenue Morumbi."}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedLandmark && (
          <div className="fixed inset-x-0 bottom-0 lg:left-[420px] z-[4000] p-4 lg:p-10 pointer-events-none">
            <div className="bg-white rounded-[40px] shadow-2xl pointer-events-auto overflow-hidden animate-sheet max-w-2xl mx-auto border border-slate-200">
               <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl text-white shadow-lg" style={{ backgroundColor: selectedLandmark.type === 'custom' ? (selectedLandmark as CustomMarker).color : '#059669' }}>
                        {selectedLandmark.type === 'custom' ? getSymbolIcon((selectedLandmark as CustomMarker).symbol, 24) : <MapPin size={24} />}
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedLandmark.name}</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          {selectedLandmark.type === 'custom' ? 'Marqueur Personnel' : 'Monument Historique'}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => {setSelectedLandmark(null); setTravelData(null);}} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                  </div>
                  
                  {loading ? (
                    <div className="py-10 flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-emerald-600" size={32} />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recherche de détails...</span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-slate-700 text-sm leading-relaxed font-medium">
                          {selectedLandmark.type === 'custom' ? selectedLandmark.description : groundedInfo.text}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <button 
                            onClick={calculateRouteToSelected}
                            disabled={isCalculating}
                            className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-[24px] font-bold shadow-lg shadow-blue-200 disabled:opacity-50 active:scale-95 transition-all"
                         >
                            {isCalculating ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} fill="white" />}
                            Tracer l'itinéraire
                         </button>
                         {selectedLandmark.type === 'custom' && (
                            <button onClick={() => { setCustomMarkers(customMarkers.filter(m => m.id !== selectedLandmark.id)); setSelectedLandmark(null); }} className="w-full py-4 text-red-500 font-bold border-2 border-red-50 rounded-[24px] hover:bg-red-50 transition-colors flex items-center justify-center gap-2 active:scale-95">
                              <Trash2 size={18} /> Supprimer
                            </button>
                         )}
                         {selectedLandmark.type !== 'custom' && groundedInfo.links.length > 0 && (
                            <a href={groundedInfo.links[0].uri} target="_blank" className="flex items-center justify-center gap-2 py-4 bg-emerald-100 text-emerald-700 rounded-[24px] font-bold border border-emerald-200 active:scale-95 transition-all">
                                <ExternalLink size={18} /> Google Maps
                            </a>
                         )}
                      </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
