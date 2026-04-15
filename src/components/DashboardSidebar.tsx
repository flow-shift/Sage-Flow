import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, LayoutDashboard, CheckSquare, BarChart3, CalendarDays, FileText, Timer, Layers, Settings, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const links = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/dashboard/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/dashboard/study-planner", icon: CalendarDays, label: "Study Planner" },
  { to: "/dashboard/test-generator", icon: FileText, label: "Test Generator" },
  { to: "/dashboard/pomodoro", icon: Timer, label: "Pomodoro" },
  { to: "/dashboard/flashcards", icon: Layers, label: "Flashcards" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
];

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div className="p-6 flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-primary-foreground" />
        </div>
        <div className="text-center">
          <span className="text-xl font-bold text-sidebar-primary-foreground block">Sage Flow</span>
          <span className="text-xs text-sidebar-foreground/70 italic">Stay in touch</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sm font-bold text-sidebar-primary">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </>
  );
};

export const DashboardSidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-sidebar-border flex items-center px-4 gap-3">
        <button onClick={() => setOpen(true)} className="text-sidebar-foreground p-1">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-primary-foreground">Sage Flow</span>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-sidebar text-sidebar-foreground flex flex-col h-full shadow-xl">
            <button onClick={() => setOpen(false)} className="absolute top-3 right-3 text-sidebar-foreground/70 hover:text-sidebar-foreground">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground flex-col shrink-0 border-r border-sidebar-border sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>
    </>
  );
};
