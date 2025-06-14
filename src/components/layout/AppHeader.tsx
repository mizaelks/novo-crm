
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import AlertsDropdown from "@/components/alerts/AlertsDropdown";
import SettingsDropdown from "@/components/settings/SettingsDropdown";

const AppHeader = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    toast.success("Sessão encerrada com sucesso");
  };

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/funnels", label: "Funis" },
    { href: "/opportunities", label: "Oportunidades" },
    { href: "/webhooks", label: "Webhooks" },
    { href: "/api", label: "API" },
  ];

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          <Link to="/" className="font-semibold text-lg text-primary">
            SalesFunnel
          </Link>
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={
                  location.pathname === link.href
                    ? "text-sm font-medium transition-colors text-primary"
                    : "text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-4">
              <AlertsDropdown />
              <SettingsDropdown />
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
