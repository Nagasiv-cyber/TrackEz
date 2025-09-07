// API service for bus tracking backend
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com' 
  : 'http://localhost:3000';

const WS_URL = process.env.NODE_ENV === 'production'
  ? 'wss://your-api-domain.com/ws'
  : 'ws://localhost:3000/ws';

export interface Bus {
  id: string;
  vehicle_no?: string;
  route_id?: string;
  last_lat: number;
  last_lng: number;
  last_seen: number;
  status?: 'active' | 'inactive';
  crowd_level?: 'low' | 'medium' | 'high';
}

export interface Route {
  id: string;
  name: string;
  stops: Stop[];
}

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order?: number;
}

export interface Position {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface UserFavorites {
  routes: string[];
  stops: string[];
  buses: string[];
}

export interface ETAResponse {
  eta_minutes: number | null;
  speed_m_s: number;
  distance_m: number;
  reason?: string;
}

class ApiService {
  private ws: WebSocket | null = null;
  private wsListeners: ((data: any) => void)[] = [];

  // Bus endpoints
  async getBuses(): Promise<Bus[]> {
    const response = await fetch(`${API_BASE}/api/v1/buses`);
    if (!response.ok) throw new Error('Failed to fetch buses');
    return response.json();
  }

  async getBus(busId: string): Promise<Bus> {
    const response = await fetch(`${API_BASE}/api/v1/bus/${busId}`);
    if (!response.ok) throw new Error('Failed to fetch bus');
    return response.json();
  }

  async updateBusLocation(busId: string, lat: number, lng: number, crowdLevel?: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/v1/update-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bus_id: busId,
        lat,
        lng,
        ts: Date.now(),
        crowd_level: crowdLevel
      })
    });
    if (!response.ok) throw new Error('Failed to update location');
  }

  // Stop endpoints
  async getNearbyStops(lat: number, lng: number, radius: number = 500): Promise<Stop[]> {
    const response = await fetch(`${API_BASE}/api/v1/nearby-stops?lat=${lat}&lng=${lng}&radius=${radius}`);
    if (!response.ok) throw new Error('Failed to fetch nearby stops');
    return response.json();
  }

  async getRouteStops(routeId: string): Promise<Stop[]> {
    const response = await fetch(`${API_BASE}/api/v1/route/${routeId}/stops`);
    if (!response.ok) throw new Error('Failed to fetch route stops');
    return response.json();
  }

  // ETA endpoint
  async getETA(busId: string, stopLat: number, stopLng: number): Promise<ETAResponse> {
    const response = await fetch(`${API_BASE}/api/v1/eta?bus_id=${busId}&stop_lat=${stopLat}&stop_lng=${stopLng}`);
    if (!response.ok) throw new Error('Failed to fetch ETA');
    return response.json();
  }

  // User favorites
  async addFavorite(userId: string, type: 'route' | 'stop' | 'bus', id: string): Promise<UserFavorites> {
    const response = await fetch(`${API_BASE}/api/v1/user/${userId}/favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id })
    });
    if (!response.ok) throw new Error('Failed to add favorite');
    const result = await response.json();
    return result.favorites;
  }

  async getFavorites(userId: string): Promise<UserFavorites> {
    const response = await fetch(`${API_BASE}/api/v1/user/${userId}/favorites`);
    if (!response.ok) throw new Error('Failed to fetch favorites');
    return response.json();
  }

  // Position history
  async getPositionHistory(busId: string, limit: number = 10): Promise<Position[]> {
    const response = await fetch(`${API_BASE}/api/v1/positions?bus_id=${busId}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch position history');
    return response.json();
  }

  // WebSocket for real-time updates
  connectWebSocket(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(WS_URL);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.wsListeners.forEach(listener => listener(data));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        // Only attempt to reconnect if it wasn't a clean close
        if (event.code !== 1000) {
          setTimeout(() => this.connectWebSocket(), 3000);
        }
      };

      this.ws.onerror = (error) => {
        // WebSocket connection failed - expected in demo mode without backend
        // No need to log this as it's normal when backend isn't running
      };
    } catch (error) {
      console.warn('Failed to create WebSocket connection:', error);
    }
  }

  onWebSocketMessage(listener: (data: any) => void): () => void {
    this.wsListeners.push(listener);
    return () => {
      const index = this.wsListeners.indexOf(listener);
      if (index > -1) this.wsListeners.splice(index, 1);
    };
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.wsListeners = [];
  }
}

// Singleton instance
export const apiService = new ApiService();

// Mock data for development/demo when backend is not available
export const mockBuses: Bus[] = [
  { id: 'bus_1', vehicle_no: '42', route_id: 'route_1', last_lat: 12.9716, last_lng: 77.5946, last_seen: Date.now() - 5000, status: 'active', crowd_level: 'medium' },
  { id: 'bus_2', vehicle_no: '15A', route_id: 'route_2', last_lat: 12.9756, last_lng: 77.5986, last_seen: Date.now() - 12000, status: 'active', crowd_level: 'low' },
  { id: 'bus_3', vehicle_no: '73', route_id: 'route_3', last_lat: 12.9696, last_lng: 77.5906, last_seen: Date.now() - 8000, status: 'active', crowd_level: 'high' },
  { id: 'bus_4', vehicle_no: '28', route_id: 'route_4', last_lat: 12.9776, last_lng: 77.6026, last_seen: Date.now() - 45000, status: 'active', crowd_level: 'low' },
];

export const mockStops: Stop[] = [
  { id: 'stop_1', name: 'Central Station', lat: 12.9721, lng: 77.5951 },
  { id: 'stop_2', name: 'Mall Plaza', lat: 12.9761, lng: 77.5991 },
  { id: 'stop_3', name: 'University', lat: 12.9701, lng: 77.5911 },
  { id: 'stop_4', name: 'Airport', lat: 12.9781, lng: 77.6031 },
  { id: 'stop_5', name: 'Downtown', lat: 12.9741, lng: 77.5971 },
];