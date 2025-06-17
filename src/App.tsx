
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import FunnelList from "@/pages/FunnelList";
import FunnelDetail from "@/pages/FunnelDetail";
import OpportunityList from "@/pages/OpportunityList";
import Insights from "@/pages/Insights";
import Settings from "@/pages/Settings";
import Templates from "@/pages/Templates";
import UserProfile from "@/pages/UserProfile";

const queryClient = new QueryClient();

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/funnels" element={<FunnelList />} />
                        <Route path="/funnels/:id" element={<FunnelDetail />} />
                        <Route path="/opportunities" element={<OpportunityList />} />
                        <Route path="/insights" element={<Insights />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/templates" element={<Templates />} />
                        <Route path="/users" element={<UserProfile />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
