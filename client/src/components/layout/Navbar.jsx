import { Bell, Search, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import { useState } from "react";
import GlobalSearch from "../search/GlobalSearch";
export default function Navbar({ sidebarOpen, setSidebarOpen }) {

  const navigate = useNavigate();   // ✅ Inside the component
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-slate-700 bg-slate-900/90 backdrop-blur">
      <div className="h-full px-6 flex items-center justify-between">

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-800"
          >
            <Menu size={26} />
          </button>

         <h1 className="
hidden sm:block
font-bold
text-xl
">
StudySphere AI
</h1>
        </div>

        <div className="flex items-center gap-4">

        <button
  onClick={() => setSearchOpen(true)}
  className="p-2 rounded-lg hover:bg-slate-800 transition"
>
  <Search size={24} />
</button>

<GlobalSearch
  open={searchOpen}
  onClose={() => setSearchOpen(false)}
/>
          

          <button
            onClick={() => alert("No new notifications")}
            className="p-2 rounded-lg hover:bg-slate-800"
          >
            <Bell size={24} />
          </button>

          <ProfileDropdown />

        </div>

      </div>
    </header>
  );
}