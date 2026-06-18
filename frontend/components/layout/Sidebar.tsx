"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/common/Button";
import { Menu, X, LayoutDashboard, ClipboardList, Sparkles, Zap, MessageCircle, BarChart3 } from "lucide-react";
import { useState } from "react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Assessment", href: "/dashboard/assessment", icon: ClipboardList },
  { name: "Prediction", href: "/dashboard/prediction", icon: Sparkles },
  { name: "Simulation", href: "/dashboard/simulation", icon: Zap },
  { name: "Chatbot", href: "/dashboard/chatbot", icon: MessageCircle },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const filteredMenuItems = menuItems.filter((item) => {
    if (!isAdmin) {
      // Regular users can only see their activities: Prediction, Chatbot
      return ["Prediction", "Chatbot"].includes(item.name);
    }
    return true;
  });

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md"
      >
        {mobileOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg
          transform transition-transform duration-300 z-30
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 mb-8">TeenVerse</h1>

          <nav className="space-y-2">
            {filteredMenuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${
                      pathname === item.href
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  <item.icon size={18} />
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          <hr className="my-6" />

          <Button
            variant="danger"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};
