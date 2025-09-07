import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/MapView';
import { InfoPanel } from './components/InfoPanel';
import { MobileNav } from './components/MobileNav';

import { useBusTracking } from './hooks/useBusTracking';

export default function App() {
  const { error, isConnected } = useBusTracking();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Demo Mode Banner */}
      {error && !isConnected && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-center">
          <span className="text-blue-800 text-sm">
            📍 Demo Mode: Using sample data - Connect to backend for live tracking
          </span>
        </div>
      )}
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Desktop only */}
        <Sidebar />
        
        {/* Map View */}
        <MapView />
        
        {/* Right Info Panel - Desktop only */}
        <InfoPanel />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}