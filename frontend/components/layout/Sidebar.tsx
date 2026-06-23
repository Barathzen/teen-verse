"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/common/Button";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  Sparkles,
  Zap,
  MessageCircle,
  BarChart3,
  Users,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Assessment", href: "/dashboard/assessment", icon: ClipboardList },
  { name: "Prediction", href: "/dashboard/prediction", icon: Sparkles },
  { name: "Simulation", href: "/dashboard/simulation", icon: Zap },
  { name: "Chatbot", href: "/dashboard/chatbot", icon: MessageCircle },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Admin Portal", href: "/dashboard/admin", icon: Users },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const filteredMenuItems = menuItems.filter((item) => {
    if (!isAdmin) {
      // Regular users can use the assessment -> prediction -> simulation flow
      return ["Assessment", "Prediction", "Simulation", "Chatbot"].includes(item.name);
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
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        {mobileOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 w-64
          bg-white dark:bg-[#1a1d2e] shadow-lg dark:shadow-black/30
          transform transition-transform duration-300 z-30
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6 flex flex-col h-full">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-8">
            TeenVerse
          </h1>

          <nav className="space-y-2 flex-1">
            {filteredMenuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${
                      pathname === item.href
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  <item.icon size={18} />
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          <div className="space-y-3 mt-auto">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                transition-colors duration-200"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>

            <hr className="border-gray-200 dark:border-gray-700" />

            <Button
              variant="danger"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
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
