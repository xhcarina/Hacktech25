"use client";

import type { MenuItem } from "@/components/protected/Sidebar";
import Sidebar from "@/components/protected/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, MapIcon, BarChart3Icon, HeartHandshakeIcon, UserIcon, HomeIcon, Building2Icon } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // Updated menu items to reflect the AidSight app pages
  const protectedMenuItems: MenuItem[] = [
    { label: "Dashboard", href: "/protected/", section: "Main", icon: "dashboard" },
    { label: "Map View", href: "/protected/map", section: "Main", icon: "map" },
    { label: "Region Details", href: "/protected/regions", section: "Main", icon: "chart" },
    { label: "Organizations", href: "/protected/organizations", section: "Main", icon: "building" },
    { label: "Donor Contributions", href: "/protected/donate", section: "Donations", icon: "heart" },
    { label: "Account", href: "/protected/account", section: "User", icon: "user" },
    { label: "Home Page", href: "/", section: "Navigation", icon: "home" },
    { label: "Learn More", href: "https://vly.ai", section: "crack.diy" },
    { label: 'Discord', href: 'https://discord.gg/2gSmB9DxJW', section: 'crack.diy' }
  ];

  const { isLoading, isAuthenticated, user } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth?redirect=${encodeURIComponent(pathname)}`);
    }
  });

  // DO NOT TOUCH THIS SECTION. IT IS THE AUTHENTICATION LAYOUT.
  return (
    <>
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin " />
        </div>
      </Unauthenticated>
      <AuthLoading>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin " />
        </div>
      </AuthLoading>
      <Authenticated>
        <Sidebar menuItems={protectedMenuItems} userEmail={user?.email} userName={user?.name}>
          {children}
        </Sidebar>
      </Authenticated>
    </>
  );
}