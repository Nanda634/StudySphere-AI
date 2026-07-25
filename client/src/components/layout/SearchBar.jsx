import { useState, useRef, useEffect } from "react";
import { UserCircle, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target))
        setOpen(false);
    };

    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/student/login", { replace: true });
  };

  return (
    <div className="relative" ref={ref}>

      <button
        onClick={() => setOpen(!open)}
        className="rounded-full hover:bg-slate-800 p-1"
      >
        <UserCircle size={38} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">

          <div className="p-5 border-b border-slate-700">

            <div className="flex items-center gap-3">

              <UserCircle size={46} />

              <div>

                <h3 className="font-semibold">
                  {user?.name}
                </h3>

                <p className="text-sm text-slate-400">
                  {user?.email}
                </p>

              </div>

            </div>

          </div>

          <button
            className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-800 transition"
          >
            <User size={20} />
            My Profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full px-5 py-4 flex items-center gap-3 text-red-400 hover:bg-red-600/10 transition"
          >
            <LogOut size={20} />
            Sign Out
          </button>

        </div>
      )}

    </div>
  );
}