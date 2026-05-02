
import React, { useState, useEffect, useCallback, useRef } from 'react';
import RealMap from './components/RealMap';
import { SP_MAP_DATA } from './constants';
import { Landmark, CustomMarker } from './types';
import { getAllTravelInfo, TravelModes } from './services/geoUtils';
import { ICON_CATEGORIES, SYMBOL_LIST } from './constants/icons';
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
  Navigation,
  Car,
  Bus,
  TrainFront,
  Clock,
  Navigation2,
  Share as ShareIcon,
  PlusSquare,
  Menu,
  ChevronDown,
  Search as SearchIcon
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

const SYMBOLS = SYMBOL_LIST;

export const getSymbolIcon = (id: string, size = 20, color = "currentColor") => {
  const symbol = SYMBOLS.find(s => s.id === id) || SYMBOLS[0];
  return <symbol.Icon size={size} color={color} />;
};

const IconPicker: React.FC<{ selected: string, onSelect: (id: string) => void }> = ({ selected, onSelect }) => {
  const [activeCategory, setActiveCategory] = useState(ICON_CATEGORIES[0].id);
  const [search, setSearch] = useState('');

  const filteredIcons = ICON_CATEGORIES
    .find(c => c.id === activeCategory)?.icons
    .filter(icon => icon.id.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-3 bg-white border border-slate-100 p-3 rounded-2xl shadow-inner min-h-[200px]">
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 pt-1 px-1">
        {ICON_CATEGORIES.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${activeCategory === cat.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      
      <div className="relative">
        <SearchIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Rechercher un icône..." 
          className="w-full pl-8 pr-4 py-2 bg-slate-50 border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-slate-200"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-6 gap-2 max-h-[160px] overflow-y-auto custom-scrollbar p-1">
        {filteredIcons.map(({ id, Icon }) => (
          <button 
            key={id} 
            onClick={() => onSelect(id)} 
            title={id}
            className={`aspect-square rounded-xl flex items-center justify-center transition-all ${selected === id ? 'bg-slate-900 text-white shadow-lg scale-110' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showInstallHint, setShowInstallHint] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | CustomMarker | null>(null);
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

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isIOS && !isStandalone) {
      setTimeout(() => setShowInstallHint(true), 4000);
    }

    const steps = [
      "Initialisation...",
      "Géolocalisation...",
      "Points emblématiques...",
      "Chargement de la carte..."
    ];

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);

    const timer = setTimeout(() => {
      setIsInitialLoading(false);
      clearInterval(stepInterval);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(stepInterval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('sp_custom_markers', JSON.stringify(customMarkers));
  }, [customMarkers]);

  const handleLandmarkClick = (id: string) => {
    const landmark = [...SP_MAP_DATA.landmarks, ...customMarkers].find(l => l.id === id);
    if (landmark) {
      setSelectedLandmark(landmark);
      setTravelData(null);
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
      // Mostramos um feedback visual melhor
      alert("Localisation de votre position actuelle... Une fois localisé, réessayez.");
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
      
      if (data && data[travelMode] && data[travelMode].geometry) {
        setTravelData(data);
      } else {
        alert("Impossible de calculer l'itinéraire pour le moment.");
      }
    } catch (err) {
      console.error("Route calculation error:", err);
      alert("Erreur lors du calcul de l'itinéraire.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleMapClick = useCallback((latlng: any) => {
    if (isAddingMode) {
      setPendingCoords({ lat: latlng.lat, lng: latlng.lng });
      // Always ensure sidebar is open when we have coords
      setIsSidebarOpen(true);
    } else {
      if (selectedLandmark) {
        setSelectedLandmark(null);
        setTravelData(null);
      }
    }
  }, [isAddingMode, selectedLandmark]);

  const openInWaze = () => {
    if (!selectedLandmark) return;
    const { lat, lng } = selectedLandmark.coordinates;
    window.open(`https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
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
  };

  return (
    <div className="h-[100dvh] w-screen bg-white text-slate-900 overflow-hidden relative flex flex-col lg:flex-row font-sans">
      
      {/* Splash Screen */}
      {isInitialLoading && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center animate-out fade-out duration-500 fill-mode-forwards">
          <div className="w-20 h-20 bg-emerald-600 rounded-[24px] flex items-center justify-center text-white shadow-xl mb-6">
            <MapIcon size={32} />
          </div>
          <h1 className="font-display text-3xl font-black text-slate-800 mb-6">São Paulo</h1>
          <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${((loadingStep + 1) / 4) * 100}%` }}></div>
          </div>
        </div>
      )}

      {/* iOS PWA Prompt */}
      {showInstallHint && (
        <div className="fixed bottom-10 left-4 right-4 z-[5000] lg:hidden animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 p-5 rounded-[28px] shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <MapIcon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Installer l'App</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Utilisez en plein écran sur votre écran d'accueil</p>
                </div>
              </div>
              <button onClick={() => setShowInstallHint(false)} className="p-1 text-slate-400"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                <ShareIcon size={14} className="text-blue-500" />
                <span>1. Appuyez sur "Partager" dans Safari</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                <PlusSquare size={14} className="text-slate-800" />
                <span>2. "Sur l'écran d'accueil"</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[3000]" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 lg:relative z-[3100]
        bg-white lg:bg-white/80 lg:backdrop-blur-xl border-slate-200
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 w-full lg:w-[380px] border-r' : '-translate-x-full w-0 overflow-hidden opacity-0 pointer-events-none border-none'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex justify-between items-center border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00a86b] rounded-xl flex items-center justify-center text-white shadow-sm">
                <MapIcon size={20} />
              </div>
              <div className="flex flex-col">
                <h1 className="font-display text-lg font-black text-slate-800 leading-none">São</h1>
                <h1 className="font-display text-lg font-black text-slate-800 leading-none">Paulo</h1>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
              <ChevronLeft size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            <section className={isAddingMode ? 'bg-emerald-50 p-5 rounded-[24px] border border-emerald-100' : 'bg-slate-50 p-1.5 rounded-2xl'}>
              {!isAddingMode ? (
                <button 
                  onClick={() => {
                    setIsAddingMode(true);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold active:scale-95 transition-all text-sm"
                >
                  <Plus size={18} /> Nouveau Marqueur
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Nouveau Marqueur</span>
                    <button onClick={() => {setIsAddingMode(false); setPendingCoords(null);}} className="text-slate-400"><X size={18} /></button>
                  </div>
                  {!pendingCoords ? (
                    <div className="py-4 text-center space-y-2">
                       <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                          <MapPin size={20} />
                       </div>
                       <p className="text-xs text-emerald-700 font-bold">Appuyez sur la carte pour marquer le lieu</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="Nom du lieu (ex : Ma Maison)" 
                        className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                        value={newMarkerForm.title}
                        onChange={e => setNewMarkerForm({...newMarkerForm, title: e.target.value})}
                      />
                      <textarea 
                        placeholder="Description ou adresse..." 
                        className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px] resize-none"
                        value={newMarkerForm.description}
                        onChange={e => setNewMarkerForm({...newMarkerForm, description: e.target.value})}
                      />
                      
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Couleur</span>
                        <div className="flex flex-wrap gap-2">
                          {COLORS.map((c) => (
                            <button 
                              key={c.hex} 
                              onClick={() => setNewMarkerForm({...newMarkerForm, color: c.hex})}
                              style={{ backgroundColor: c.hex }}
                              className={`w-6 h-6 rounded-full border-2 transition-transform ${newMarkerForm.color === c.hex ? 'border-slate-900 scale-110' : 'border-transparent active:scale-90'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Icône</span>
                        <IconPicker selected={newMarkerForm.symbol} onSelect={id => setNewMarkerForm({...newMarkerForm, symbol: id})} />
                      </div>
                      
                      <button 
                        onClick={saveCustomMarker} 
                        disabled={!newMarkerForm.title} 
                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold active:scale-95 shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:grayscale transition-all mt-2"
                      >
                        Enregistrer le lieu
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
  
            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mes Lieux</h2>
              <div className="space-y-1.5">
                {[...SP_MAP_DATA.landmarks.filter(l => l.category === 'personal'), ...customMarkers].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleLandmarkClick(l.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${selectedLandmark?.id === l.id ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm ring-1 ring-emerald-500/20' : 'bg-white border-slate-100 text-slate-600 active:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div style={{ color: (l as CustomMarker).color || '#10b981' }}>
                        {getSymbolIcon((l as CustomMarker).symbol || 'map-pin', 16)}
                      </div>
                      <span className="font-bold text-xs truncate">{l.name}</span>
                    </div>
                    <ChevronRight size={14} className="opacity-30" />
                  </button>
                ))}
                {[...SP_MAP_DATA.landmarks.filter(l => l.category === 'personal'), ...customMarkers].length === 0 && (
                  <p className="text-[10px] text-slate-400 text-center py-4 font-medium italic">Aucun lieu enregistré pour le moment.</p>
                )}
              </div>
            </section>
  
            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Points d'intérêt</h2>
              <div className="space-y-1.5">
                {SP_MAP_DATA.landmarks.filter(l => l.category === 'tourist').map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleLandmarkClick(l.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${selectedLandmark?.id === l.id ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm ring-1 ring-emerald-500/20' : 'bg-white border-slate-100 text-slate-600 active:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="text-emerald-500">
                        {getSymbolIcon(l.symbol || 'map-pin', 16)}
                      </div>
                      <span className="font-bold text-xs truncate">{l.name}</span>
                    </div>
                    <ChevronRight size={14} className="opacity-30" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </aside>

      <main className="flex-1 relative bg-slate-50 overflow-hidden">
        <RealMap 
          ref={mapRef}
          isSidebarOpen={isSidebarOpen}
          onLandmarkClick={handleLandmarkClick}
          onCustomLandmarkClick={handleCustomLandmarkClick}
          mapStyle={mapStyle}
          customMarkers={customMarkers}
          isAddingMode={isAddingMode}
          onMapClick={handleMapClick}
          pendingCoords={pendingCoords}
          pendingMarkerStyle={{ 
            color: newMarkerForm.color, 
            symbol: newMarkerForm.symbol 
          }}
          selectedLandmark={selectedLandmark}
          onUserLocationUpdate={(coords) => setUserLocation(coords)}
          routeGeometry={travelData ? travelData[travelMode].geometry : undefined}
          routeColor={travelMode === 'bus' ? '#f59e0b' : travelMode === 'train' ? '#3b82f6' : '#10b981'}
        />

        {/* Adding mode helper hint */}
        {isAddingMode && !pendingCoords && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[2000] pointer-events-none px-4 w-full flex justify-center">
            <div className="bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border-2 border-white">
              <MapPin size={18} fill="white" />
              <span className="font-bold text-xs sm:text-sm">Appuyez sur la carte pour marquer</span>
            </div>
          </div>
        )}

        {/* Floating Controls */}
        <div className="absolute top-4 right-4 z-[2000] flex flex-col gap-3">
          <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-[22px] shadow-xl border border-white flex flex-col gap-1">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-3 rounded-[16px] text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
              >
                <Menu size={20} />
              </button>
            )}
            <button onClick={() => setMapStyle('standard')} className={`p-3 rounded-[16px] transition-all ${mapStyle === 'standard' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:bg-slate-50'}`}>
              <MapIcon size={20} />
            </button>
            <button onClick={() => setMapStyle('satellite')} className={`p-3 rounded-[16px] transition-all ${mapStyle === 'satellite' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:bg-slate-50'}`}>
              <Layers size={20} />
            </button>
          </div>
        </div>

        {/* Route HUD (Waze Style Menu) */}
        {travelData && (
          <div className="absolute top-4 left-4 right-16 lg:left-6 lg:right-auto z-[2000] lg:w-96 pointer-events-none">
            <div className="bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden pointer-events-auto flex flex-col transition-all">
              {/* Waze-style Top Header */}
              <div className="bg-blue-500 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Navigation2 size={18} fill="white" />
                  </div>
                  <div>
                    <p className="font-black text-[10px] uppercase tracking-widest opacity-80">Itinéraire</p>
                    <h3 className="font-bold text-sm truncate max-w-[200px]">{selectedLandmark?.name}</h3>
                  </div>
                </div>
                <button onClick={() => setTravelData(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors leading-none">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Mode Selector */}
                <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <button onClick={() => setTravelMode('car')} className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${travelMode === 'car' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-slate-200' : 'text-slate-400'}`}>
                    <Car size={18} fill={travelMode === 'car' ? "currentColor" : "none"}/><span className="text-[9px] font-bold mt-1">Voiture</span>
                  </button>
                  <button onClick={() => setTravelMode('train')} className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${travelMode === 'train' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-slate-200' : 'text-slate-400'}`}>
                    <TrainFront size={18} fill={travelMode === 'train' ? "currentColor" : "none"}/><span className="text-[9px] font-bold mt-1">Métro</span>
                  </button>
                  <button onClick={() => setTravelMode('bus')} className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${travelMode === 'bus' ? 'bg-white shadow-sm text-amber-500 ring-1 ring-slate-200' : 'text-slate-400'}`}>
                    <Bus size={18} fill={travelMode === 'bus' ? "currentColor" : "none"}/><span className="text-[9px] font-bold mt-1">Bus</span>
                  </button>
                </div>
 
                {/* Stats & Traffic */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100/50">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Temps est.</p>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-blue-500" />
                      <p className="text-lg font-black text-slate-800">{travelData[travelMode].durationMinutes}m</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100/50">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Distance</p>
                    <div className="flex items-center gap-1">
                      <Compass size={14} className="text-slate-500" />
                      <p className="text-lg font-black text-slate-800">{travelData[travelMode].distanceKm} <span className="text-[10px] font-bold text-slate-400 uppercase">km</span></p>
                    </div>
                  </div>
                </div>

                {/* Simulated Traffic Info */}
                <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span>Trafic fluide sur votre trajet</span>
                </div>

                {/* Transit Lines Section */}
                {(travelMode === 'train' || travelMode === 'bus') && travelData[travelMode].lines && travelData[travelMode].lines!.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Lignes & Correspondances</p>
                    <div className="flex flex-wrap gap-1.5">
                      {travelData[travelMode].lines?.map((line, idx) => (
                        <div key={idx} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm border ${
                          travelMode === 'train' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                        }`}>
                          {travelMode === 'train' ? <TrainFront size={11} /> : <Bus size={11} />}
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  <button onClick={openInWaze} className="w-full flex items-center justify-center gap-3 py-3.5 bg-sky-400 text-white rounded-2xl font-black text-sm shadow-lg shadow-sky-100 active:scale-95 transition-all">
                    <Navigation2 size={18} fill="white" />
                    Ouvrir dans Waze
                  </button>
                  <button onClick={openInGoogleMaps} className="w-full py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest active:opacity-70 transition-all">
                    Ouvrir dans Google Maps
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selection Details Sheet */}
        {selectedLandmark && !travelData && (
          <div className={`fixed inset-x-0 bottom-0 lg:bottom-8 z-[4000] ${isSidebarOpen ? 'lg:left-[380px]' : 'lg:left-0'} lg:px-6 pointer-events-none transition-all duration-300`}>
            <div className="bg-white/95 backdrop-blur-xl rounded-t-[40px] lg:rounded-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-t lg:border border-white pointer-events-auto overflow-hidden w-full max-w-2xl mx-auto transform transition-all duration-300">
               {/* Mobile Drag Handle */}
               <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 lg:hidden opacity-50" />
               
               <div className="p-6 lg:p-8 space-y-5 lg:space-y-6">
                  {/* Landmark Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-[22px] text-white shadow-lg flex items-center justify-center shrink-0" style={{ backgroundColor: (selectedLandmark as any).color || '#10b981' }}>
                      {getSymbolIcon((selectedLandmark as any).symbol || 'map-pin', window.innerWidth < 640 ? 20 : 28)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl lg:text-2xl font-black text-slate-900 leading-tight truncate">{selectedLandmark.name}</h2>
                      <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {selectedLandmark.type === 'custom' ? 'LIEU ENREGISTRÉ' : 'POINT D\'INTÉRÊT'}
                      </p>
                    </div>
                    <button onClick={() => {setSelectedLandmark(null); setTravelData(null);}} className="p-2 lg:p-3 hover:bg-slate-100 rounded-full text-slate-300 transition-colors">
                      <X size={20} className="lg:hidden" />
                      <X size={24} className="hidden lg:block" />
                    </button>
                  </div>
                  
                  {/* Description Box */}
                  <div className="bg-slate-50/50 p-4 lg:p-6 rounded-[28px] border border-slate-100">
                    <p className="text-slate-600 text-xs lg:text-sm leading-relaxed font-medium">
                      {selectedLandmark.description || "Aucune description disponible pour ce lieu."}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                     <button 
                        onClick={calculateRouteToSelected}
                        disabled={isCalculating}
                        className="flex-[2] flex items-center justify-center gap-2 lg:gap-3 py-4 lg:py-5 bg-blue-600 text-white rounded-2xl lg:rounded-[24px] font-black text-xs lg:text-sm shadow-[0_10px_25px_rgba(37,99,235,0.3)] active:scale-95 transition-all disabled:opacity-50"
                     >
                        {isCalculating ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Navigation size={18} fill="white" />
                        )}
                        <span>{isCalculating ? 'CALCUL...' : "Voir l'itinéraire"}</span>
                     </button>
                     
                     {selectedLandmark.type === 'custom' ? (
                        <button onClick={() => { setCustomMarkers(customMarkers.filter(m => m.id !== selectedLandmark.id)); setSelectedLandmark(null); }} className="flex-1 flex items-center justify-center py-4 lg:py-5 bg-red-50 text-red-500 rounded-2xl lg:rounded-[24px] font-black text-xs lg:text-sm border border-red-100 active:scale-95 transition-all">
                          <Trash2 size={18} />
                        </button>
                     ) : (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLandmark.name + ' São Paulo')}`} 
                          target="_blank" 
                          className="flex-1 flex items-center justify-center gap-2 py-4 lg:py-5 bg-[#d1FAE5] text-[#065F46] rounded-2xl lg:rounded-[24px] font-black text-xs lg:text-sm shadow-[0_10px_25px_rgba(16,185,129,0.1)] active:scale-95 transition-all"
                        >
                          <ExternalLink size={18} />
                          <span>Maps</span>
                        </a>
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Floating User Location Button */}
        <div className="absolute bottom-10 right-6 lg:bottom-12 lg:right-8 z-[2000]">
          <button 
            onClick={() => mapRef.current?.triggerLocate()}
            className="w-14 h-14 lg:w-16 lg:h-16 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-full border border-white flex items-center justify-center text-slate-800 active:scale-90 transition-all transform hover:scale-105"
          >
            <Navigation2 className="rotate-45" size={24} fill="currentColor" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
