
import { Bell, User, Settings, LogOut, BarChart3, Users, Briefcase, Zap, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertsDropdown } from "../alerts/AlertsDropdown";
import { useUserRole } from "@/hooks/useUserRole";

export const AppHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isManager } = useUserRole();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/funnels", label: "Funis", icon: Zap },
    { path: "/opportunities", label: "Oportunidades", icon: Briefcase },
    { path: "/insights", label: "Insights", icon: BarChart3 },
  ];

  // Add admin-only items
  if (isAdmin) {
    navItems.push(
      { path: "/settings", label: "Configurações", icon: Settings },
      { path: "/templates", label: "Templates", icon: Database }
    );
  }

  if (isAdmin || isManager) {
    navItems.push({ path: "/users", label: "Usuários", icon: Users });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 
            className="text-xl font-bold text-primary cursor-pointer" 
            onClick={() => navigate("/")}
          >
            FunnelFlow
          </h1>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`gap-2 ${isActive ? 'bg-primary/10 text-primary' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <AlertsDropdown />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                {user?.email?.split("@")[0]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate("/templates")}>
                  <Database className="mr-2 h-4 w-4" />
                  Templates
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
