import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* Top Navbar */}
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Body */}
     <div className="flex">

    <Sidebar sidebarOpen={sidebarOpen} />

    <main
        className={`
            flex-1
            transition-all
            duration-300
            ${
                sidebarOpen
                    ? "lg:ml-64"
                    : "lg:ml-20"
            }
        `}
    >
        <Outlet />
    </main>



      </div>

    </div>
  );
}