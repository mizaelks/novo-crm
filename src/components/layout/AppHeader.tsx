
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import AlertsDropdown from "@/components/alerts/AlertsDropdown";
import SettingsDropdown from "@/components/settings/SettingsDropdown";
import UserProfileInfo from "./UserProfileInfo";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGate } from "@/components/ui/permission-gate";

const AppHeader = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { canViewReports, canSystemSettings } = usePermissions();
  
  const handleSignOut = async () => {
    await signOut();
    toast.success("Sessão encerrada com sucesso");
  };

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/funnels", label: "Funis" },
    { href: "/opportunities", label: "Oportunidades" },
  ];

  // Add insights link only for users with permission
  if (canViewReports) {
    links.push({ href: "/insights", label: "Insights" });
  }

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
              <PermissionGate permission="system_settings">
                <SettingsDropdown />
              </PermissionGate>
              <UserProfileInfo />
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
