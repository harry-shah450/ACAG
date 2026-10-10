import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { useLanguage } from '../../context/LanguageContext';
import { useDashboardData } from '../../context/DashboardDataContext';
import {
  MapPin,
  Layers,
  Filter,
  Search,
  Maximize2,
  Minimize2,
  Building2,
  HardHat,
  ShieldAlert,
  CloudSun,
  Eye,
  CheckCircle2,
  Calendar,
  X,
  CreditCard,
  ThermometerSun,
  Navigation,
  Compass,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  User,
  Check,
  AlertTriangle,
  FileCheck,
  Sliders,
  ChevronRight,
  ExternalLink,
  Info,
  Clock,
  ArrowUpRight,
  Crosshair,
  Map as MapIcon,
  Home,
} from 'lucide-react';

export const PUNJAB_DISTRICT_COORDS = {
  'Lahore': { lat: 31.5204, lng: 74.3587, zoom: 12 },
  'Rawalpindi': { lat: 33.5984, lng: 73.0441, zoom: 12 },
  'Faisalabad': { lat: 31.4504, lng: 73.1350, zoom: 12 },
  'Multan': { lat: 30.1575, lng: 71.5249, zoom: 12 },
  'Gujranwala': { lat: 32.1877, lng: 74.1945, zoom: 12 },
  'Sargodha': { lat: 32.0836, lng: 72.6711, zoom: 12 },
  'Sahiwal': { lat: 30.6682, lng: 73.1114, zoom: 12 },
  'Bahawalpur': { lat: 29.3544, lng: 71.6911, zoom: 12 },
  'Sialkot': { lat: 32.4945, lng: 74.5229, zoom: 12 },
  'Kasur': { lat: 31.1179, lng: 74.4479, zoom: 12 },
  'Okara': { lat: 30.8081, lng: 73.4458, zoom: 12 },
  'Rahim Yar Khan': { lat: 28.4212, lng: 70.2989, zoom: 12 },
  'D.G. Khan': { lat: 30.0561, lng: 70.6403, zoom: 12 },
  'Gujrat': { lat: 32.5742, lng: 74.0754, zoom: 12 },
  'Attock': { lat: 33.7660, lng: 72.3609, zoom: 12 },
  'Chakwal': { lat: 32.9328, lng: 72.8553, zoom: 12 },
  'Jhelum': { lat: 32.9344, lng: 73.7269, zoom: 12 },
  'Khushab': { lat: 32.2967, lng: 72.3525, zoom: 12 },
  'Mianwali': { lat: 32.5853, lng: 71.5436, zoom: 12 },
  'Bhakkar': { lat: 31.6253, lng: 71.0657, zoom: 12 },
  'Jhang': { lat: 31.2781, lng: 72.3317, zoom: 12 },
  'Chiniot': { lat: 31.7200, lng: 72.9789, zoom: 12 },
  'Toba Tek Singh': { lat: 30.9709, lng: 72.4826, zoom: 12 },
  'Nankana Sahib': { lat: 31.4492, lng: 73.7125, zoom: 12 },
  'Sheikhupura': { lat: 31.7131, lng: 73.9783, zoom: 12 },
  'Hafizabad': { lat: 32.0719, lng: 73.6880, zoom: 12 },
  'Mandi Bahauddin': { lat: 32.5870, lng: 73.4912, zoom: 12 },
  'Narowal': { lat: 32.1000, lng: 74.8730, zoom: 12 },
  'Pakpattan': { lat: 30.3410, lng: 73.3866, zoom: 12 },
  'Vehari': { lat: 30.0419, lng: 72.3528, zoom: 12 },
  'Khanewal': { lat: 30.3017, lng: 71.9321, zoom: 12 },
  'Lodhran': { lat: 29.5405, lng: 71.6336, zoom: 12 },
  'Bahawalnagar': { lat: 29.9984, lng: 73.2536, zoom: 12 },
  'Muzaffargarh': { lat: 30.0744, lng: 71.1847, zoom: 12 },
  'Layyah': { lat: 30.9613, lng: 70.9398, zoom: 12 },
  'Rajanpur': { lat: 29.1035, lng: 70.3250, zoom: 12 },
};

const ACAG_STAGES = [
  'Site Preparation',
  'Layout Marking',
  'Foundation',
  'DPC',
  'Brick Masonry',
  'Lintel',
  'Roof',
  'Plaster',
  'Flooring',
  'Plumbing',
  'Electrical',
  'Finishing',
  'Septic Tank',
  'Final Inspection',
  'House Construction Completed',
];

const TILE_LAYERS = {
  HYBRID: {
    name: '🛰️ Satellite + Streets (HD)',
    url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxNativeZoom: 20,
    maxZoom: 22,
    attribution: '&copy; Google Maps & Satellite Imagery',
  },
  GOOGLE_STREET: {
    name: '🗺️ Google Streets',
    url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxNativeZoom: 20,
    maxZoom: 22,
    attribution: '&copy; Google Maps',
  },
  SATELLITE: {
    name: '🌍 Esri Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: ['server', 'services'],
    maxNativeZoom: 19,
    maxZoom: 22,
    attribution: 'Tiles &copy; Esri World Imagery',
  },
  OSM: {
    name: '📍 OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    maxNativeZoom: 19,
    maxZoom: 22,
    attribution: '&copy; OpenStreetMap contributors',
  },
  DARK: {
    name: '🌙 Command Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    maxNativeZoom: 19,
    maxZoom: 22,
    attribution: '&copy; CARTO &copy; OpenStreetMap',
  },
};

export const GISMapPage = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetHouseId = searchParams.get('houseId');

  const { houses, engineers } = useDashboardData();

  // Selected house for detailed drawer
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('SPECS');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [tehsilFilter, setTehsilFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loanFilter, setLoanFilter] = useState('ALL');
  const [safetyFilter, setSafetyFilter] = useState('ALL');
  const [engineerFilter, setEngineerFilter] = useState('ALL');
  const [minProgress, setMinProgress] = useState(0);
  const [maxProgress, setMaxProgress] = useState(100);

  // Map States
  const [currentTileLayer, setCurrentTileLayer] = useState('HYBRID');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState([31.5083, 74.3086]); // Default Sheikh Zayed Hospital / Muslim Town, Lahore
  const [mapZoom, setMapZoom] = useState(17);

  // Refs for Leaflet
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerLayerGroupRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Unique Lists for Dropdowns
  const districtsList = Array.from(new Set(houses.map((h) => h.district).filter(Boolean))).sort();
  const tehsilsList = Array.from(
    new Set(
      houses
        .filter((h) => districtFilter === 'ALL' || h.district === districtFilter)
        .map((h) => h.tehsil)
        .filter(Boolean)
    )
  ).sort();

  // Filter Houses
  const filteredHouses = houses.filter((h) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (h.id && h.id.toLowerCase().includes(q)) ||
        (h.caseId && h.caseId.toLowerCase().includes(q)) ||
        (h.ownerName && h.ownerName.toLowerCase().includes(q)) ||
        (h.ownerCnic && h.ownerCnic.toLowerCase().includes(q)) ||
        (h.district && h.district.toLowerCase().includes(q)) ||
        (h.address && h.address.toLowerCase().includes(q)) ||
        (h.engineerName && h.engineerName.toLowerCase().includes(q));
      if (!match) return false;
    }

    // District & Tehsil
    if (districtFilter !== 'ALL' && h.district !== districtFilter) return false;
    if (tehsilFilter !== 'ALL' && h.tehsil !== tehsilFilter) return false;

    // Construction Stage
    if (stageFilter !== 'ALL' && !h.stage?.toLowerCase().includes(stageFilter.toLowerCase())) return false;

    // House Status
    if (statusFilter !== 'ALL' && h.status !== statusFilter) return false;

    // Loan Status
    if (loanFilter !== 'ALL' && !h.loanStatus?.toLowerCase().includes(loanFilter.toLowerCase())) return false;

    // Safety Status
    if (safetyFilter !== 'ALL') {
      if (safetyFilter === 'Critical' && !(h.safetyStatus === 'Critical' || h.safetyStatus === 'Critical Issue' || h.safetyIssuesCount > 0)) {
        return false;
      }
      if (safetyFilter === 'Safe' && (h.safetyStatus === 'Critical' || h.safetyStatus === 'Critical Issue' || h.safetyIssuesCount > 0)) {
        return false;
      }
      if (safetyFilter !== 'Critical' && safetyFilter !== 'Safe' && h.safetyStatus !== safetyFilter) {
        return false;
      }
    }

    // Engineer
    if (engineerFilter !== 'ALL' && h.engineerName !== engineerFilter) return false;

    // Progress Range
    const progress = h.progressPct ?? h.overallProgressPct ?? 0;
    if (progress < minProgress || progress > maxProgress) return false;

    return true;
  });

  // KPI Metrics on Map
  const stats = {
    totalMapped: filteredHouses.length,
    underConstruction: filteredHouses.filter((h) => h.status === 'Under Construction' || (h.progressPct > 0 && h.progressPct < 100)).length,
    completed: filteredHouses.filter((h) => h.status === 'Completed' || h.progressPct === 100).length,
    criticalSafety: filteredHouses.filter((h) => h.safetyStatus === 'Critical' || h.safetyStatus === 'Critical Issue' || h.safetyIssuesCount > 0).length,
    reVisitRequired: filteredHouses.filter((h) => h.status === 'Re-Visit' || h.reInspectionRequired).length,
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setDistrictFilter('ALL');
    setTehsilFilter('ALL');
    setStageFilter('ALL');
    setStatusFilter('ALL');
    setLoanFilter('ALL');
    setSafetyFilter('ALL');
    setEngineerFilter('ALL');
    setMinProgress(0);
    setMaxProgress(100);
  };

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    if (mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      minZoom: 5,
      maxZoom: 22,
      zoomControl: false,
    });

    // Custom top-right zoom control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add Tile Layer
    const initialTile = TILE_LAYERS[currentTileLayer] || TILE_LAYERS.HYBRID;
    const tileLayer = L.tileLayer(initialTile.url, {
      attribution: initialTile.attribution,
      maxZoom: initialTile.maxZoom || 22,
      maxNativeZoom: initialTile.maxNativeZoom || 20,
      subdomains: initialTile.subdomains || ['a', 'b', 'c'],
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    markerLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Trigger size recalculation after layout settles
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Invalidate map size when fullscreen or sidebar changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isFullscreen, isSidebarOpen]);

  // 2. Switch Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const selectedTile = TILE_LAYERS[currentTileLayer] || TILE_LAYERS.HYBRID;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(selectedTile.url, {
      attribution: selectedTile.attribution,
      maxZoom: selectedTile.maxZoom || 22,
      maxNativeZoom: selectedTile.maxNativeZoom || 20,
      subdomains: selectedTile.subdomains || ['a', 'b', 'c'],
    }).addTo(map);
  }, [currentTileLayer]);

  // 3. Render Custom House Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markerLayerGroupRef.current) return;
    const map = mapInstanceRef.current;
    const layerGroup = markerLayerGroupRef.current;

    layerGroup.clearLayers();

    const bounds = [];

    filteredHouses.forEach((house) => {
      const lat = parseFloat(house.lat || house.latitude);
      const lng = parseFloat(house.lng || house.longitude);

      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

      bounds.push([lat, lng]);

      // Determine Pin Theme & Status
      const isCritical = house.safetyStatus === 'Critical' || house.safetyStatus === 'Critical Issue' || house.safetyIssuesCount > 0;
      const isCompleted = house.status === 'Completed' || house.progressPct === 100;
      const isRevisit = house.status === 'Re-Visit' || house.reInspectionRequired;
      const isUnderConst = house.status === 'Under Construction' || (!isCompleted && !isRevisit);

      let pinColor = 'bg-blue-600 border-blue-200 text-white shadow-blue-500/30';
      let statusBadge = 'bg-blue-100 text-blue-800';
      let iconHtml = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`;

      if (isCritical) {
        pinColor = 'bg-rose-600 border-rose-200 text-white shadow-rose-600/40 animate-pulse';
        statusBadge = 'bg-rose-100 text-rose-800';
        iconHtml = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
      } else if (isCompleted) {
        pinColor = 'bg-emerald-600 border-emerald-200 text-white shadow-emerald-500/30';
        statusBadge = 'bg-emerald-100 text-emerald-800';
        iconHtml = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`;
      } else if (isRevisit) {
        pinColor = 'bg-amber-500 border-amber-200 text-white shadow-amber-500/30';
        statusBadge = 'bg-amber-100 text-amber-800';
        iconHtml = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`;
      }

      // Create Leaflet HTML divIcon
      const customDivIcon = L.divIcon({
        className: 'custom-gis-marker',
        html: `
          <div class="relative group cursor-pointer transform hover:scale-125 transition-transform duration-200">
            <div class="h-8 w-8 rounded-full ${pinColor} border-2 flex items-center justify-center shadow-lg">
              ${iconHtml}
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 opacity-60"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lat, lng], { icon: customDivIcon });

      // Interactive Popup Content
      const progressValue = house.progressPct ?? house.overallProgressPct ?? 0;
      const popupHtml = `
        <div class="p-3.5 min-w-[260px] max-w-[300px] text-slate-800 font-sans space-y-2.5">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <span class="font-mono font-black text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
              ${house.id || house.caseId}
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${statusBadge}">
              ${house.status || 'Active'}
            </span>
          </div>

          <div>
            <h4 class="font-black text-sm text-slate-900">${house.ownerName || 'House Owner'}</h4>
            <p class="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <span>📍 ${house.district || 'Punjab'}</span>
              ${house.tehsil ? `<span>• ${house.tehsil}</span>` : ''}
            </p>
          </div>

          <div class="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
            <div class="flex justify-between items-center text-[11px]">
              <span class="text-slate-500 font-medium">Stage:</span>
              <span class="font-bold text-slate-800">${house.stage || 'Site Preparation'}</span>
            </div>
            <div class="flex justify-between items-center text-[11px]">
              <span class="text-slate-500 font-medium">Progress:</span>
              <span class="font-black text-emerald-700">${progressValue}%</span>
            </div>
            <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div class="bg-emerald-600 h-full rounded-full" style="width: ${progressValue}%"></div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600">
            <div class="bg-slate-100/70 p-1.5 rounded-lg">
              <span class="block text-slate-400 font-medium">Engineer</span>
              <span class="font-bold text-slate-800 truncate block">${house.engineerName || 'Unassigned'}</span>
            </div>
            <div class="bg-slate-100/70 p-1.5 rounded-lg">
              <span class="block text-slate-400 font-medium">Safety</span>
              <span class="font-bold ${isCritical ? 'text-rose-600' : 'text-emerald-700'} block">${house.safetyStatus || 'Safe'}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 mt-2">
            <button
              id="zoom-house-btn-${house.id}"
              class="py-2 px-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <span>🔍 Rooftop HD</span>
            </button>
            <button
              id="view-details-btn-${house.id}"
              class="py-2 px-2 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <span>Details ➔</span>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const zoomBtn = document.getElementById(`zoom-house-btn-${house.id}`);
        if (zoomBtn) {
          zoomBtn.onclick = () => {
            map.flyTo([lat, lng], 19, { duration: 1.0 });
          };
        }
        const btn = document.getElementById(`view-details-btn-${house.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedHouse(house);
            setIsDrawerOpen(true);
          };
        }
      });

      marker.addTo(layerGroup);
    });

    // Auto-center / pan to house
    if (targetHouseId) {
      const target = filteredHouses.find((h) => h.id === targetHouseId || h.caseId === targetHouseId);
      if (target && target.lat && target.lng) {
        map.flyTo([target.lat, target.lng], 19, { duration: 1.5 });
        setSelectedHouse(target);
      }
    } else if (bounds.length === 1) {
      map.flyTo(bounds[0], 18, { duration: 1.2 });
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    }
  }, [filteredHouses, targetHouseId]);

  // Handle District Jump
  const handleDistrictJump = (districtName) => {
    setDistrictFilter(districtName);
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (districtName === 'ALL') {
      map.flyTo([31.1704, 72.7097], 7, { duration: 1.5 });
    } else if (PUNJAB_DISTRICT_COORDS[districtName]) {
      const { lat, lng, zoom } = PUNJAB_DISTRICT_COORDS[districtName];
      map.flyTo([lat, lng], zoom || 12, { duration: 1.5 });
    }
  };

  // Quick Zoom Level Handler
  const handleZoomLevel = (zoom) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setZoom(zoom);
  };

  // Fly to specific house from sidebar list (HD Rooftop Zoom 19)
  const flyToHouse = (house) => {
    if (!mapInstanceRef.current) return;
    const lat = parseFloat(house.lat || house.latitude);
    const lng = parseFloat(house.lng || house.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    mapInstanceRef.current.flyTo([lat, lng], 19, { duration: 1.2 });
    setSelectedHouse(house);
  };

  // GPS Geolocation Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });

          // Add a pulsating GPS marker
          L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: '#3b82f6',
            color: '#ffffff',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9,
          })
            .bindPopup('<b class="text-xs">Your Current Location</b>')
            .addTo(mapInstanceRef.current)
            .openPopup();
        }
      },
      (err) => {
        setIsLocating(false);
        alert('Could not determine your GPS location. Please check browser permissions.');
      }
    );
  };

  // Fit all mapped points to screen
  const handleFitAllBounds = () => {
    if (!mapInstanceRef.current || filteredHouses.length === 0) return;
    const validCoords = filteredHouses
      .map((h) => [parseFloat(h.lat || h.latitude), parseFloat(h.lng || h.longitude)])
      .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0);

    if (validCoords.length > 0) {
      mapInstanceRef.current.fitBounds(validCoords, { padding: [40, 40], maxZoom: 14 });
    }
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-4 overflow-hidden flex flex-col' : ''}`}>
      {/* Top Header & Layer Selection */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase tracking-wider shadow-xs">
              GIS Geospatial Engine v2.0
            </span>
            <span className="text-xs text-slate-400 font-bold">•</span>
            <span className="text-xs text-slate-600 font-bold">
              Punjab Province Real-Time Housing Grid
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <MapIcon className="h-6 w-6 text-orange-600" />
            <span>GIS Interactive House Monitoring</span>
          </h1>
        </div>

        {/* Map Actions & Layer Pickers */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
          {/* Layer Selector Chips */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            {Object.keys(TILE_LAYERS).map((layerKey) => (
              <button
                key={layerKey}
                onClick={() => setCurrentTileLayer(layerKey)}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  currentTileLayer === layerKey
                    ? 'bg-white text-slate-900 font-black shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {TILE_LAYERS[layerKey].name}
              </button>
            ))}
          </div>

          {/* GPS Locate Me Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Locate my position"
          >
            <Crosshair className={`h-4 w-4 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">GPS Location</span>
          </button>

          {/* Fit Bounds */}
          <button
            type="button"
            onClick={handleFitAllBounds}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Zoom to fit all filtered houses"
          >
            <Compass className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">Fit All Pins</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* KPI Stats HUD Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 min-w-0">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-black shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Total Mapped</p>
            <p className="text-lg font-black text-slate-900 font-mono">{stats.totalMapped}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-black shrink-0">
            <HardHat className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Under Construction</p>
            <p className="text-lg font-black text-indigo-600 font-mono">{stats.underConstruction}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-black shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Completed</p>
            <p className="text-lg font-black text-emerald-600 font-mono">{stats.completed}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 font-black shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Safety Critical</p>
            <p className="text-lg font-black text-rose-600 font-mono">{stats.criticalSafety}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 col-span-2 sm:col-span-1 min-w-0">
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 font-black shrink-0">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Re-Visit Required</p>
            <p className="text-lg font-black text-amber-600 font-mono">{stats.reVisitRequired}</p>
          </div>
        </div>
      </div>

      {/* Advanced GIS Filters Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* 1. Search Bar */}
          <div className="relative">
            <Search className={`h-4 w-4 text-slate-400 absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 pointer-events-none`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search House ID, Owner, CNIC..."
              className={`w-full ${isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3'} py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 font-medium`}
            />
          </div>

          {/* 2. District Filter */}
          <div>
            <select
              value={districtFilter}
              onChange={(e) => handleDistrictJump(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
            >
              <option value="ALL">All Punjab Districts ({districtsList.length})</option>
              {districtsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Construction Stage Filter */}
          <div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
            >
              <option value="ALL">All 15 ACAG Stages</option>
              {ACAG_STAGES.map((stg) => (
                <option key={stg} value={stg}>
                  {stg}
                </option>
              ))}
            </select>
          </div>

          {/* 4. House Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending Application</option>
              <option value="Approved">Approved</option>
              <option value="Under Construction">Under Construction</option>
              <option value="Re-Visit">Re-Visit Required</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* 5. Safety Status Filter */}
          <div>
            <select
              value={safetyFilter}
              onChange={(e) => setSafetyFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
            >
              <option value="ALL">All Safety Levels</option>
              <option value="Safe">🟢 Safe / Compliant</option>
              <option value="Warning">🟡 Warning / Moderate</option>
              <option value="Critical">🔴 Critical Safety Hazard</option>
              <option value="Inspection Required">🟣 Inspection Required</option>
            </select>
          </div>

          {/* 6. Assigned Engineer Filter */}
          <div>
            <select
              value={engineerFilter}
              onChange={(e) => setEngineerFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
            >
              <option value="ALL">All Engineers</option>
              {engineers.map((eng) => (
                <option key={eng.id} value={eng.name}>
                  {eng.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend and Active Filter Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs font-bold">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="h-3 w-3 rounded-full bg-emerald-600 border border-emerald-200 shadow-2xs" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="h-3 w-3 rounded-full bg-blue-600 border border-blue-200 shadow-2xs" /> Under Construction
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="h-3 w-3 rounded-full bg-amber-500 border border-amber-200 shadow-2xs" /> Re-Visit / Pending
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="h-3 w-3 rounded-full bg-rose-600 border border-rose-200 shadow-2xs animate-pulse" /> Critical Safety Risk
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-900 font-mono font-black">{filteredHouses.length}</strong> of {houses.length} houses
            </span>

            {(searchQuery || districtFilter !== 'ALL' || stageFilter !== 'ALL' || statusFilter !== 'ALL' || safetyFilter !== 'ALL' || engineerFilter !== 'ALL') && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-orange-600 hover:text-orange-700 underline text-xs font-black cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Map Canvas & Collapsible House Sidebar */}
      <div className={`grid grid-cols-1 ${isSidebarOpen ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-4 items-start ${isFullscreen ? 'flex-1' : ''}`}>
        {/* Real Leaflet Map Container */}
        <div className={`${isSidebarOpen ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'} bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md relative min-h-[560px] h-[650px] flex flex-col`}>
          {/* Leaflet Div */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Quick District Jump Floating Bar */}
          <div className="absolute top-3 left-3 z-10 hidden sm:flex items-center gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-md">
            <span className="text-[10px] font-black uppercase text-slate-400 px-2">District Jump:</span>
            {['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala', 'Sargodha', 'Bahawalpur'].map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => handleDistrictJump(dist)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition cursor-pointer ${
                  districtFilter === dist ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>

          {/* Quick Zoom Preset Buttons Floating Bar */}
          <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-lg">
            <span className="text-[10px] font-black uppercase text-slate-400 px-2 flex items-center gap-1">
              <span>Zoom:</span>
            </span>
            {[
              { label: 'Punjab (7x)', zoom: 7 },
              { label: 'District (12x)', zoom: 12 },
              { label: 'Area (15x)', zoom: 15 },
              { label: '🏠 Rooftop HD (19x)', zoom: 19 },
              { label: '🔬 Ultra (21x)', zoom: 21 },
            ].map((z) => (
              <button
                key={z.zoom}
                type="button"
                onClick={() => handleZoomLevel(z.zoom)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition cursor-pointer border border-transparent hover:border-orange-200"
              >
                {z.label}
              </button>
            ))}
          </div>

          {/* Sidebar Toggle Floating Button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute bottom-4 right-4 z-10 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md text-slate-800 text-xs font-black border border-slate-200 shadow-lg hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="h-4 w-4 text-orange-600" />
            <span>{isSidebarOpen ? 'Hide House List' : 'Show House List'}</span>
          </button>
        </div>

        {/* Mapped Houses Interactive Sidebar (3 cols) */}
        {isSidebarOpen && (
          <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col h-[650px] overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-orange-600" />
                  <span>Mapped Sites ({filteredHouses.length})</span>
                </h3>
                <p className="text-[10px] text-slate-500">Click any house to pan and view details</p>
              </div>
            </div>

            {/* Scrollable House List */}
            <div className="overflow-y-auto divide-y divide-slate-100 flex-1 p-2 space-y-1.5">
              {filteredHouses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <MapPin className="h-8 w-8 mx-auto stroke-1" />
                  <p className="text-xs font-bold text-slate-600">No houses match your filters.</p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs text-orange-600 font-black underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                filteredHouses.map((h) => {
                  const isCritical = h.safetyStatus === 'Critical' || h.safetyStatus === 'Critical Issue' || h.safetyIssuesCount > 0;
                  const isCompleted = h.status === 'Completed' || h.progressPct === 100;
                  const progressValue = h.progressPct ?? h.overallProgressPct ?? 0;

                  return (
                    <div
                      key={h.id}
                      onClick={() => flyToHouse(h)}
                      className={`p-3 rounded-2xl transition cursor-pointer border hover:border-orange-300 hover:bg-orange-50/40 ${
                        selectedHouse?.id === h.id ? 'bg-orange-50/80 border-orange-400 ring-1 ring-orange-400' : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-[11px] text-orange-600">
                          {h.id || h.caseId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {h.status || 'Under Construction'}
                        </span>
                      </div>

                      <div className="mt-1">
                        <p className="text-xs font-black text-slate-900 truncate">{h.ownerName}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span>📍 {h.district}</span>
                          {h.tehsil && <span>• {h.tehsil}</span>}
                        </p>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-600 font-bold truncate">{h.stage || 'Site Prep'}</span>
                        <span className="font-black text-emerald-700">{progressValue}%</span>
                      </div>

                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                        <div className="bg-emerald-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}></div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100/80">
                        <span className="text-[10px] text-slate-400 truncate">
                          {h.engineerName || 'Engr. Assigned'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHouse(h);
                            setIsDrawerOpen(true);
                          }}
                          className="text-[10px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Details</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          HOUSE 360° DETAILS DRAWER / MODAL (SHOWS ALL 36 FIELDS)
         ========================================================================= */}
      {isDrawerOpen && selectedHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Drawer Header */}
            <div className="p-5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-tight">{selectedHouse.id || selectedHouse.caseId}</h2>
                    <span className="text-[10px] uppercase font-black bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
                      {selectedHouse.status || 'Under Construction'}
                    </span>
                  </div>
                  <p className="text-xs text-orange-100 font-medium">
                    Beneficiary: <span className="font-bold text-white">{selectedHouse.ownerName}</span> • District {selectedHouse.district}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto px-5 py-2 border-b border-slate-200 bg-slate-50 text-xs font-bold">
              {[
                { id: 'SPECS', label: 'House & Specs' },
                { id: 'OWNER', label: 'Beneficiary Info' },
                { id: 'GIS', label: 'GIS & Coordinates' },
                { id: 'PROGRESS', label: '15-Milestones' },
                { id: 'FINANCE', label: 'BOP Loan & Tranches' },
                { id: 'SAFETY', label: 'Safety & Inspection' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDrawerTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                    drawerTab === tab.id ? 'bg-orange-600 text-white font-black shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* TAB 1: SPECS */}
              {drawerTab === 'SPECS' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Plot Size</span>
                    <span className="text-sm font-black text-slate-900">{selectedHouse.plotSizeMarla || 5} Marla</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Covered Area</span>
                    <span className="text-sm font-black text-slate-900">{selectedHouse.coveredAreaSqft || 1100} sq. ft.</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Floors</span>
                    <span className="text-sm font-black text-slate-900">{selectedHouse.floors || 1} Floor(s)</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Current Construction Stage</span>
                    <span className="text-sm font-black text-slate-900">{selectedHouse.stage || 'Foundation'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Overall Progress</span>
                    <span className="text-sm font-black text-emerald-700">{selectedHouse.progressPct || 0}% Completed</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Assigned Engineer</span>
                    <span className="text-sm font-black text-slate-900">{selectedHouse.engineerName || 'Engr. Bilal Raza'}</span>
                  </div>
                </div>
              )}

              {/* TAB 2: OWNER */}
              {drawerTab === 'OWNER' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Beneficiary Name</span>
                      <span className="text-sm font-black text-slate-900">{selectedHouse.ownerName}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">CNIC (National Identity)</span>
                      <span className="text-sm font-mono font-black text-slate-900">{selectedHouse.ownerCnic || '35201-XXXXXXX-X'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Contact Phone</span>
                      <span className="text-sm font-black text-slate-900">{selectedHouse.ownerPhone || '+92 300 0000000'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Email Address</span>
                      <span className="text-sm font-medium text-slate-900">{selectedHouse.ownerEmail || 'beneficiary@acag.gov.pk'}</span>
                    </div>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Property / Site Address</span>
                    <span className="text-xs font-bold text-slate-800">{selectedHouse.address || 'Site Location, Punjab'}</span>
                  </div>
                </div>
              )}

              {/* TAB 3: GIS */}
              {drawerTab === 'GIS' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <span className="text-blue-700 font-bold block text-[10px] uppercase">Latitude Coordinate</span>
                      <span className="text-base font-mono font-black text-blue-950">{selectedHouse.lat || 31.5204}</span>
                    </div>
                    <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <span className="text-blue-700 font-bold block text-[10px] uppercase">Longitude Coordinate</span>
                      <span className="text-base font-mono font-black text-blue-950">{selectedHouse.lng || 74.3587}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Coordinates are GPS-verified and mapped directly into the ACAG Geographic Information System.
                  </p>
                </div>
              )}

              {/* TAB 4: PROGRESS */}
              {drawerTab === 'PROGRESS' && (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {ACAG_STAGES.map((stg, idx) => {
                    const stageIndex = ACAG_STAGES.indexOf(selectedHouse.stage || 'Site Preparation');
                    const isDone = idx <= stageIndex;
                    const isCurrent = idx === stageIndex;

                    return (
                      <div
                        key={stg}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          isCurrent
                            ? 'bg-orange-50 border-orange-300 font-black text-orange-950'
                            : isDone
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                            : 'bg-slate-50 border-slate-100 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                              isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs">{stg}</span>
                        </div>
                        <span className="text-[10px] font-black">
                          {isCurrent ? '⚡ IN PROGRESS' : isDone ? '✓ VERIFIED' : 'PENDING'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 5: FINANCE */}
              {drawerTab === 'FINANCE' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Approved Loan</span>
                    <span className="text-base font-black text-slate-900">PKR {(selectedHouse.loanApproved || 1500000).toLocaleString()}</span>
                  </div>
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-emerald-700 font-bold block text-[10px] uppercase">Disbursed Tranches</span>
                    <span className="text-base font-black text-emerald-700">PKR {(selectedHouse.loanDisbursed || 0).toLocaleString()}</span>
                  </div>
                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100">
                    <span className="text-amber-700 font-bold block text-[10px] uppercase">Remaining Loan</span>
                    <span className="text-base font-black text-amber-800">
                      PKR {(Math.max(0, (selectedHouse.loanApproved || 1500000) - (selectedHouse.loanDisbursed || 0))).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 6: SAFETY */}
              {drawerTab === 'SAFETY' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Site Safety Status</span>
                      <span className={`text-sm font-black ${selectedHouse.safetyStatus === 'Critical' ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {selectedHouse.safetyStatus || 'Safe'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Open Safety Issues</span>
                      <span className="text-sm font-black text-slate-900">{selectedHouse.safetyIssuesCount || selectedHouse.openSafetyIssues || 0} Issues</span>
                    </div>
                  </div>
                  {selectedHouse.safetyRemarks && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Safety Officer Observations</span>
                      <p className="text-xs font-medium text-slate-700 mt-0.5">{selectedHouse.safetyRemarks}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-white transition cursor-pointer"
              >
                Close Drawer
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate(`/houses?highlight=${selectedHouse.id}`);
                }}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Manage House in Directory</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
