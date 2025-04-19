
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AppHeader = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="text-2xl">⟁</span>
            <span>Kanban Flow</span>
          </Link>
          
          <nav className="hidden md:flex ml-8 space-x-4">
            <Link to="/" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </Link>
            <Link to="/funnels" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Funis
            </Link>
            <Link to="/opportunities" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Oportunidades
            </Link>
            <Link to="/webhooks" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Webhooks
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            Documentação API
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
