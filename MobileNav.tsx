import { useState } from 'react';
import { Menu, X, Filter, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';
import { Sidebar } from './Sidebar';
import { InfoPanel } from './InfoPanel';

export function MobileNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-50">
        <div className="flex justify-around">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center space-y-1 p-2 rounded-md hover:bg-gray-100 transition-colors">
                <Filter className="w-5 h-5" />
                <span className="text-xs">Filters</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SheetHeader className="sr-only">
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Filter options for bus tracking</SheetDescription>
              </SheetHeader>
              <Sidebar />
            </SheetContent>
          </Sheet>

          <Sheet open={infoPanelOpen} onOpenChange={setInfoPanelOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center space-y-1 p-2 rounded-md hover:bg-gray-100 transition-colors">
                <Info className="w-5 h-5" />
                <span className="text-xs">Bus Info</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-80">
              <SheetHeader className="sr-only">
                <SheetTitle>Bus Information</SheetTitle>
                <SheetDescription>Detailed information about the selected bus</SheetDescription>
              </SheetHeader>
              <InfoPanel />
            </SheetContent>
          </Sheet>

          <button className="flex flex-col items-center space-y-1 p-2 rounded-md hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5" />
            <span className="text-xs">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}