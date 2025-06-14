
import React from "react";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
