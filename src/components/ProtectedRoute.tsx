
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Only show the toast and redirect after loading is complete
    if (!loading && !user) {
      toast({
        title: "Acesso restrito",
        description: "Você precisa estar logado para acessar esta página",
        variant: "destructive",
      });
      setShouldRedirect(true);
    }
  }, [loading, user, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2" />
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
