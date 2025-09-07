import { MapPin, Heart, Bus, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { useBusTracking } from '../hooks/useBusTracking';
import { useUserFavorites } from '../hooks/useUserFavorites';

export function Sidebar() {
  const { stops, buses } = useBusTracking();
  const { favorites, loading: favoritesLoading } = useUserFavorites();

  const filterOptions = [
    { icon: MapPin, label: 'Nearby Stops', count: stops.length },
    { icon: Heart, label: 'Favourite Routes', count: favorites.routes?.length || 0 },
    { icon: Bus, label: 'My Bus', count: favorites.buses?.length || 0 },
  ];

  return (
    <aside className="bg-blue-600 text-white w-64 min-h-screen p-4 hidden lg:block">
      <div className="space-y-6">
        {/* Filter Header */}
        <div className="flex items-center space-x-2 pb-4 border-b border-blue-500">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg">Quick Filters</h2>
        </div>

        {/* Filter Options */}
        <div className="space-y-2">
          {filterOptions.map((option, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-white hover:bg-blue-700 hover:text-white p-3 h-auto"
            >
              <option.icon className="w-5 h-5 mr-3" />
              <div className="flex-1 text-left">
                <div>{option.label}</div>
                <div className="text-blue-200 text-xs">{option.count} available</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Favorite Buses */}
        <div className="pt-6 border-t border-blue-500">
          <h3 className="text-sm text-blue-200 mb-3">Favorite Buses</h3>
          <div className="space-y-2">
            {favoritesLoading ? (
              <div className="p-2 text-blue-200 text-sm">
                Loading favorites...
              </div>
            ) : (favorites.buses && favorites.buses.length > 0) ? (
              favorites.buses.slice(0, 3).map((busId) => {
                const bus = buses.find(b => b.id === busId);
                return (
                  <div
                    key={busId}
                    className="p-2 bg-blue-700 rounded-lg cursor-pointer hover:bg-blue-500 transition-colors"
                  >
                    <div className="text-sm">
                      {bus?.vehicle_no || busId}
                    </div>
                    <div className="text-xs text-blue-200">
                      {bus?.crowd_level || 'Unknown'} capacity
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-2 text-blue-200 text-sm">
                No favorite buses yet
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="pt-6 border-t border-blue-500">
          <Button
            variant="ghost"
            className="w-full text-blue-200 hover:bg-blue-700 hover:text-white"
          >
            Settings & Preferences
          </Button>
        </div>
      </div>
    </aside>
  );
}