"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext-new";

// Simple loader component
function Loader({ className = "" }) {
  return (
    <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary ${className}`}></div>
  );
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loadingnUser } = useAuth();
  
  if (loadingnUser) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="h-8 w-8" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be logged in to access settings.</p>
        <div className="mt-4">
          <Link 
            href="/signin" 
            className="rounded-md bg-primary py-2 px-4 text-white shadow-sm hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }
  
  const navItems = [
    { name: "Profile", href: "/settings/profile" },
    { name: "Verification", href: "/settings/verification" },
    { name: "Account Security", href: "/settings/account" },
    { name: "Wallets", href: "/settings/wallets" },
    { name: "Payment Methods", href: "/settings/payment-methods" },
    { name: "Notifications", href: "/settings/notifications" },
  ];
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Settings</h2>
          </div>
          <nav className="py-2">
            <ul>
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`px-4 py-2 flex ${
                      pathname === item.href
                        ? "text-primary font-medium bg-primary/10"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow">
          {children}
        </div>
      </div>
    </div>
  );
}