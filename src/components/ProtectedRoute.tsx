
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2" />
      </div>
    );
  }

  if (!user) {
    toast({
      title: "Acesso restrito",
      description: "Você precisa estar logado para acessar esta página",
      variant: "destructive",
    });
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
