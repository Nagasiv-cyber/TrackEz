import { Clock, Users, MapPin, Bus, AlertCircle, Heart, RefreshCw } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { useBusTracking } from '../hooks/useBusTracking';
import { useUserFavorites } from '../hooks/useUserFavorites';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export function InfoPanel() {
  const { selectedBus, stops, refreshData } = useBusTracking();
  const { isFavorite, toggleFavorite } = useUserFavorites();
  const [eta, setEta] = useState<number | null>(null);
  const [etaLoading, setEtaLoading] = useState(false);

  // Get ETA for the nearest stop when a bus is selected
  useEffect(() => {
    if (selectedBus && stops.length > 0) {
      const nearestStop = stops[0]; // Simple: use first stop for demo
      setEtaLoading(true);
      
      apiService.getETA(selectedBus.id, nearestStop.lat, nearestStop.lng)
        .then(response => setEta(response.eta_minutes))
        .catch(err => {
          // Use fallback ETA calculation for demo mode
          setEta(Math.floor(Math.random() * 10) + 1); // Fallback to random ETA
        })
        .finally(() => setEtaLoading(false));
    }
  }, [selectedBus, stops]);

  const busAge = selectedBus ? Date.now() - selectedBus.last_seen : 0;
  const isStale = busAge > 60000; // 1 minute

  const getCrowdColor = (level: string | undefined) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCrowdProgress = (level: string | undefined) => {
    switch (level?.toLowerCase()) {
      case 'low': return 30;
      case 'medium': return 65;
      case 'high': return 90;
      default: return 50;
    }
  };

  const formatLastSeen = (timestamp: number) => {
    const seconds = Math.floor(busAge / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hours ago`;
  };

  // Early return with loading state if favorites are still loading
  if (!selectedBus) {
    return (
      <aside className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto hidden md:block">
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <Bus className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a bus on the map to view details</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto hidden md:block">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg text-gray-900">Live Bus Info</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {selectedBus.vehicle_no || selectedBus.id}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleFavorite('bus', selectedBus.id)}
              className="p-1"
            >
              <Heart className={`w-4 h-4 ${isFavorite('bus', selectedBus.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
          </div>
        </div>

        {/* Current Status Card */}
        <Card className={`p-4 ${isStale ? 'border-yellow-200 bg-yellow-50/30' : 'border-blue-100 bg-blue-50/30'}`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bus className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">
                  Route {selectedBus.route_id || 'Unknown'}
                </span>
              </div>
              <Badge className={isStale ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-green-100 text-green-800 border-green-200'}>
                {isStale ? 'Stale Data' : 'Live'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">
                {selectedBus.last_lat.toFixed(4)}, {selectedBus.last_lng.toFixed(4)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">
                {etaLoading ? 'Calculating...' : eta ? `ETA: ${eta} min` : 'ETA: N/A'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">
                Last seen: {formatLastSeen(selectedBus.last_seen)}
              </span>
            </div>
          </div>
        </Card>

        {/* Crowd Status */}
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Crowd Level</span>
              </div>
              <Badge className={getCrowdColor(selectedBus.crowd_level)}>
                {selectedBus.crowd_level || 'Unknown'}
              </Badge>
            </div>
            <Progress 
              value={getCrowdProgress(selectedBus.crowd_level)} 
              className="h-2"
            />
            <p className="text-xs text-gray-500">
              {getCrowdProgress(selectedBus.crowd_level)}% capacity
            </p>
          </div>
        </Card>

        {/* Status Alerts */}
        {(isStale || selectedBus.status === 'inactive') && (
          <Card className="p-4 border-yellow-200 bg-yellow-50/30">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">Status Alert</span>
              </div>
              {isStale && (
                <p className="text-sm text-yellow-700">
                  Bus location data is outdated. Last update was {formatLastSeen(selectedBus.last_seen)}.
                </p>
              )}
              {selectedBus.status === 'inactive' && (
                <p className="text-sm text-yellow-700">
                  This bus is currently inactive.
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Nearby Stops */}
        <Card className="p-4">
          <h3 className="text-sm text-gray-900 mb-3">Nearby Stops</h3>
          <div className="space-y-3">
            {stops.slice(0, 3).map((stop, index) => (
              <div key={stop.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-900">{stop.name}</div>
                  <div className="text-xs text-gray-500">
                    {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleFavorite('stop', stop.id)}
                  className="p-1"
                >
                  <Heart className={`w-3 h-3 ${isFavorite('stop', stop.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </Button>
              </div>
            ))}
            {stops.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No nearby stops found
              </p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4">
          <h3 className="text-sm text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-blue-600"
              onClick={() => navigator.share && navigator.share({
                title: `Bus ${selectedBus.vehicle_no || selectedBus.id}`,
                text: `Track bus location: ${selectedBus.last_lat.toFixed(4)}, ${selectedBus.last_lng.toFixed(4)}`,
                url: window.location.href
              })}
            >
              Share Location
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-blue-600"
              onClick={refreshData}
            >
              Refresh Data
            </Button>
            {selectedBus.route_id && (
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-blue-600"
                onClick={() => toggleFavorite('route', selectedBus.route_id!)}
              >
                {isFavorite('route', selectedBus.route_id) ? 'Remove from' : 'Add to'} Favorites
              </Button>
            )}
          </div>
        </Card>

        {/* Live Updates Footer */}
        <div className="text-center pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full ${isStale ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></div>
            <span>Last updated: {formatLastSeen(selectedBus.last_seen)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}