"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShieldCheck, Users, Sliders, FileSpreadsheet, CreditCard, LogOut, Crown } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [orgName, setOrgName] = useState("My Company");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("subshield_org_name");
      if (stored) setOrgName(stored);
      const email = localStorage.getItem("subshield_user_email");
      if (email && email.toLowerCase() === "amadouourydiallo596@gmail.com") {
        setIsAdmin(true);
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("subshield_token");
      localStorage.removeItem("subshield_org_name");
      localStorage.removeItem("subshield_user_email");
    }
    router.push("/login");
  };

  const navItems = [
    { name: "Subcontractors", href: "/dashboard", icon: Users },
    { name: "Compliance Rules", href: "/dashboard/rules", icon: Sliders },
    { name: "Audit Report", href: "/dashboard/audit", icon: FileSpreadsheet },
    { name: "Billing & Plans", href: "/dashboard/billing", icon: CreditCard },
    ...(isAdmin ? [{ name: "Admin Panel", href: "/dashboard/admin", icon: Crown }] : []),
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Org Name */}
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Sub<span className="text-blue-600">Shield</span>
              </span>
            </Link>

            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 max-w-[200px] truncate">
              {orgName}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-red-600 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
