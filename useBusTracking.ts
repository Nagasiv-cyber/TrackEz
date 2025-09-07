import { useState, useEffect, useCallback } from 'react';
import { apiService, Bus, Stop, mockBuses, mockStops } from '../services/api';

export function useBusTracking() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Load initial data
  const loadBuses = useCallback(async () => {
    try {
      setLoading(true);
      const busData = await apiService.getBuses();
      setBuses(busData);
      if (busData.length > 0 && !selectedBus) {
        setSelectedBus(busData[0]);
      }
      setError(null);
    } catch (err) {
      // Use mock data as fallback - this is expected in demo mode
      setBuses(mockBuses);
      if (!selectedBus) setSelectedBus(mockBuses[0]);
      setError('Using demo data - backend not connected');
    } finally {
      setLoading(false);
    }
  }, [selectedBus]);

  const loadNearbyStops = useCallback(async (lat: number, lng: number, radius: number = 500) => {
    try {
      const stopData = await apiService.getNearbyStops(lat, lng, radius);
      setStops(stopData);
    } catch (err) {
      // Use mock data as fallback - this is expected in demo mode
      setStops(mockStops);
    }
  }, []);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    apiService.connectWebSocket();
    
    const unsubscribe = apiService.onWebSocketMessage((data) => {
      setIsConnected(true);
      
      if (data.type === 'position' && data.data) {
        const { bus_id, lat, lng, ts, crowd_level } = data.data;
        
        setBuses(prevBuses => 
          prevBuses.map(bus => 
            bus.id === bus_id 
              ? { ...bus, last_lat: lat, last_lng: lng, last_seen: ts, crowd_level }
              : bus
          )
        );

        // Update selected bus if it matches
        setSelectedBus(prevSelected => 
          prevSelected?.id === bus_id
            ? { ...prevSelected, last_lat: lat, last_lng: lng, last_seen: ts, crowd_level }
            : prevSelected
        );
      }
    });

    // Load initial data
    loadBuses();
    
    // Load stops around a default location (can be updated based on user location)
    loadNearbyStops(12.9716, 77.5946);

    // Set connection timeout
    const connectionTimeout = setTimeout(() => {
      if (!isConnected) {
        console.log('WebSocket connection timeout - using offline mode');
      }
    }, 5000);

    // Simulate bus movement in demo mode
    const simulateMovement = setInterval(() => {
      if (!isConnected) {
        setBuses(prevBuses => 
          prevBuses.map(bus => ({
            ...bus,
            last_lat: bus.last_lat + (Math.random() - 0.5) * 0.001, // Small random movement
            last_lng: bus.last_lng + (Math.random() - 0.5) * 0.001,
            last_seen: Date.now() - Math.floor(Math.random() * 30000) // Random freshness
          }))
        );
      }
    }, 5000); // Update every 5 seconds

    return () => {
      unsubscribe();
      apiService.disconnectWebSocket();
      clearTimeout(connectionTimeout);
      clearInterval(simulateMovement);
    };
  }, [loadBuses, loadNearbyStops]);

  const selectBus = useCallback((bus: Bus) => {
    setSelectedBus(bus);
  }, []);

  const refreshData = useCallback(() => {
    loadBuses();
  }, [loadBuses]);

  const searchBuses = useCallback((query: string) => {
    if (!query.trim()) return buses;
    
    return buses.filter(bus => 
      bus.vehicle_no?.toLowerCase().includes(query.toLowerCase()) ||
      bus.route_id?.toLowerCase().includes(query.toLowerCase())
    );
  }, [buses]);

  return {
    buses,
    stops,
    selectedBus,
    loading,
    error,
    isConnected,
    selectBus,
    refreshData,
    searchBuses,
    loadNearbyStops
  };
}