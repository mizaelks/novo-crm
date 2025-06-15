
import { Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import FunnelList from "@/pages/FunnelList";
import FunnelDetail from "@/pages/FunnelDetail";
import OpportunityList from "@/pages/OpportunityList";
import WebhookManager from "@/pages/WebhookManager";
import Insights from "@/pages/Insights";
import NotFound from "@/pages/NotFound";

const Index = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="funnels" element={<FunnelList />} />
        <Route path="funnels/:id" element={<FunnelDetail />} />
        <Route path="opportunities" element={<OpportunityList />} />
        <Route path="insights" element={<Insights />} />
        <Route path="webhooks" element={<WebhookManager />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default Index;
