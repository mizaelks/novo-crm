
import React from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";

const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex-1 container mx-auto px-4 py-6">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default AppLayout;
