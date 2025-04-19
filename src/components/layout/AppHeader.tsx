
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const AppHeader = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="text-2xl">⟁</span>
            <span>Kanban Flow</span>
          </Link>
          
          <nav className="hidden md:flex ml-8 space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/') && !isActive('/funnels') && !isActive('/opportunities') && !isActive('/webhooks') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/funnels" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/funnels') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
            >
              Funis
            </Link>
            <Link 
              to="/opportunities" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/opportunities') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
            >
              Oportunidades
            </Link>
            <Link 
              to="/webhooks" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/webhooks') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
            >
              Webhooks
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <a href="/api-docs" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              Documentação API
              <ExternalLink size={14} />
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
