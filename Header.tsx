import { useState } from 'react';
import { Search, MapPin, Wifi, WifiOff } from 'lucide-react';
import { Input } from './ui/input';
import { useBusTracking } from '../hooks/useBusTracking';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchBuses, selectBus, isConnected } = useBusTracking();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchBuses(query);
      if (results.length > 0) {
        selectBus(results[0]); // Auto-select first result
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-full">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl text-gray-900">BusTracker</h1>
            <p className="text-xs text-gray-500">Real-time tracking</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Enter bus number or route..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status Indicator */}
        <div className="hidden md:flex items-center space-x-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-blue-500" />
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Demo Mode</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}