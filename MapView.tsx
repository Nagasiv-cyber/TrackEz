import { Bus, MapPin, Navigation, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useBusTracking } from '../hooks/useBusTracking';

interface BusDisplayLocation {
  id: string;
  route: string;
  x: number;
  y: number;
  crowdLevel: 'low' | 'medium' | 'high' | undefined;
  lastSeen: number;
  isSelected: boolean;
}

export function MapView() {
  const { buses, stops, selectedBus, selectBus, isConnected, loading } = useBusTracking();

  // Convert real coordinates to screen percentages for demo
  const convertToScreenCoords = (lat: number, lng: number) => {
    // Simple mapping for demo - in real app you'd use proper map projection
    const minLat = 12.96, maxLat = 12.98;
    const minLng = 77.58, maxLng = 77.62;
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100; // Invert Y for screen coords
    
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const displayBuses: BusDisplayLocation[] = buses.map(bus => {
    const coords = convertToScreenCoords(bus.last_lat, bus.last_lng);
    return {
      id: bus.id,
      route: bus.vehicle_no || bus.id,
      x: coords.x,
      y: coords.y,
      crowdLevel: bus.crowd_level,
      lastSeen: bus.last_seen,
      isSelected: selectedBus?.id === bus.id
    };
  });

  const displayStops = stops.map(stop => {
    const coords = convertToScreenCoords(stop.lat, stop.lng);
    return {
      ...stop,
      x: coords.x,
      y: coords.y
    };
  });

  const getCrowdColor = (level: 'low' | 'medium' | 'high' | undefined) => {
    switch (level) {
      case 'low': return 'bg-green-600 hover:bg-green-700';
      case 'medium': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'high': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const isStale = (lastSeen: number) => {
    return Date.now() - lastSeen > 60000; // 1 minute
  };

  return (
    <div className="flex-1 bg-gray-50 relative overflow-hidden">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bus data...</p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <Button size="sm" className="bg-white text-gray-700 hover:bg-gray-100 shadow-lg">
          <Navigation className="w-4 h-4 mr-2" />
          Center Map
        </Button>
        <div className="bg-white rounded-lg shadow-lg p-2 space-y-1">
          <Button size="sm" variant="ghost" className="w-full justify-start text-xs">
            Zoom In
          </Button>
          <Button size="sm" variant="ghost" className="w-full justify-start text-xs">
            Zoom Out
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant={isConnected ? "default" : "secondary"} className="space-x-1">
          {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{isConnected ? 'Live' : 'Demo'}</span>
        </Badge>
      </div>

      {/* Mock Map Background */}
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-gray-100 relative">
        {/* Grid lines for map effect */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`v-${i}`} className="absolute bg-gray-300 w-px h-full" style={{ left: `${i * 5}%` }} />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`h-${i}`} className="absolute bg-gray-300 h-px w-full" style={{ top: `${i * 5}%` }} />
          ))}
        </div>

        {/* Routes (simulated as lines) */}
        <svg className="absolute inset-0 w-full h-full">
          <path
            d="M 10% 20% Q 50% 10% 90% 30%"
            stroke="#3B82F6"
            strokeWidth="3"
            fill="none"
            strokeDasharray="10,5"
            opacity="0.6"
          />
          <path
            d="M 20% 80% Q 60% 60% 80% 20%"
            stroke="#3B82F6"
            strokeWidth="3"
            fill="none"
            strokeDasharray="10,5"
            opacity="0.6"
          />
        </svg>

        {/* Bus Stops */}
        {displayStops.map(stop => (
          <div
            key={stop.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
          >
            <div className="w-3 h-3 bg-gray-600 rounded-full border-2 border-white shadow-lg group-hover:bg-blue-600 transition-colors" />
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {stop.name}
            </div>
          </div>
        ))}

        {/* Real-time Buses */}
        {displayBuses.map(bus => (
          <div
            key={bus.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${bus.x}%`, top: `${bus.y}%` }}
            onClick={() => selectBus(buses.find(b => b.id === bus.id)!)}
          >
            <div className="relative">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-lg transition-colors ${
                bus.isSelected ? 'ring-2 ring-blue-300 ring-offset-2' : ''
              } ${getCrowdColor(bus.crowdLevel)} ${
                isStale(bus.lastSeen) ? 'opacity-50' : ''
              }`}>
                <Bus className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <div>Route {bus.route}</div>
                {bus.crowdLevel && (
                  <div className="text-xs opacity-75">
                    {bus.crowdLevel} capacity
                  </div>
                )}
              </div>
              {/* Pulse effect for active buses */}
              {!isStale(bus.lastSeen) && (
                <div className={`absolute inset-0 w-6 h-6 rounded-lg animate-ping opacity-40 ${getCrowdColor(bus.crowdLevel)}`} />
              )}
            </div>
          </div>
        ))}

        {/* Enhanced Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
          <h4 className="text-sm text-gray-900">Legend</h4>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-600 rounded-lg flex items-center justify-center">
              <Bus className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs text-gray-600">Low Capacity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Bus className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs text-gray-600">Medium Capacity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded-lg flex items-center justify-center">
              <Bus className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs text-gray-600">High Capacity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-600 rounded-full" />
            <span className="text-xs text-gray-600">Bus Stop</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-600" style={{ background: 'repeating-linear-gradient(to right, #3B82F6 0, #3B82F6 5px, transparent 5px, transparent 10px)' }} />
            <span className="text-xs text-gray-600">Route</span>
          </div>
        </div>
      </div>
    </div>
  );
}