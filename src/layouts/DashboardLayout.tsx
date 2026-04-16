import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";

const backgrounds: Record<string, string> = {
  "/dashboard": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=80&fit=crop",
  "/dashboard/tasks": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1600&q=80&fit=crop",
  "/dashboard/analytics": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80&fit=crop",
  "/dashboard/study-planner": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1600&q=80&fit=crop",
  "/dashboard/test-generator": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1600&q=80&fit=crop",
  "/dashboard/pomodoro": "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=1600&q=80&fit=crop",
  "/dashboard/flashcards": "https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=1600&q=80&fit=crop",
  "/dashboard/settings": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&fit=crop",
};

const DashboardLayout = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const bg = backgrounds[location.pathname] || backgrounds["/dashboard"];

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <main
        className="flex-1 p-4 pt-18 md:p-8 md:pt-8 overflow-auto relative"
        style={{
          backgroundImage: `url('${bg}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* overlay so content stays readable */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
