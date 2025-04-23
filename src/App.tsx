
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import WebhookManager from "./pages/webhook/WebhookManager";
import ApiDocs from "./pages/api/ApiDocs";
import ApiTokenManager from "./pages/ApiTokenManager";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute />}>
              <Route index element={<Index />} />
              <Route path="/webhooks" element={<WebhookManager />} />
              <Route path="/api" element={<ApiDocs />} />
              <Route path="/api/tokens" element={<ApiTokenManager />} />
              <Route path="/*" element={<Index />} />
            </Route>
            <Route path="/api-docs" element={
              <Navigate to="/api" replace />
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
