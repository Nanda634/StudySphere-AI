import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import MobileDrawer from "../components/layout/MobileDrawer";
import BottomNavigation from "../components/layout/BottomNavigation";

export default function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Main Area */}
      <div className="lg:ml-72">
        <Navbar
          onMenuClick={() => setDrawerOpen(true)}
        />

        <main className="min-h-[calc(100vh-64px)] px-5 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <BottomNavigation />
    </div>
  );
}