import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { useEffect, useState } from "react";
import Dashboard from "../pages/dashboard";
import Chats from "../pages/chats";
import { Route, Routes } from "react-router-dom";
import RegisterScreen from "@/pages/auth/register";
import LoginScreen from "@/pages/auth/login";
import { ProtectedRoute } from "@/context/protectedRoutes";
export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const sidebarState = getCookie("sidebar:state");

    setIsSidebarOpen(() => {
      return Boolean(sidebarState);
    });
  }, []);

  const getCookie = (name: string): string | null => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  };

  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <AppSidebar />

      <main className="flex flex-col bg-gray-100 dark:bg-gray-950 w-full">
        <div className="flex justify-between rounded-md shadow-md m-4 bg-white/30 dark:bg-black backdrop-blur-md border border-white/20">
          <SidebarTrigger />
          <ModeToggle />
        </div>

        <div className="mx-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/chats" element={<Chats />} />
            </Route>
          </Routes>
        </div>
      </main>
    </SidebarProvider>
  );
}
