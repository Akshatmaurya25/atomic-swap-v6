"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Home,
  Bot,
  BarChart3,
  Settings,
  Wallet,
  TrendingUp,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
  current?: boolean;
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Trading Bots", href: "/bots", icon: Bot },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Opportunities", href: "/opportunities", icon: TrendingUp },
  { name: "Portfolio", href: "/portfolio", icon: Wallet },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-gray-900 lg:border-r lg:border-gray-700">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-black" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">
                Yellow Bot
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    isActive
                      ? "bg-yellow-400 text-black"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-6 w-6",
                      isActive
                        ? "text-black"
                        : "text-gray-400 group-hover:text-gray-300"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Connect Wallet Button */}
          <div className="flex-shrink-0 px-4 py-4">
            <div className="flex flex-col  justify-center">
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile menu button */}
        <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-black" />
            </div>
            <span className="ml-3 text-xl font-bold text-white">
              Yellow Bot
            </span>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 h-full lg:hidden">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 h-full flex flex-col max-w-xs w-full bg-gray-900 shadow-xl">
              <div className="absolute top-0 left-0 ml-2 -mr-12 pt-2">
                <button
                  type="button"
                  className=" flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                          isActive
                            ? "bg-yellow-400 text-black"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="mr-4 flex-shrink-0 h-6 w-6" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="flex-shrink-0 flex flex-col  px-4 py-4">
                <ConnectButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
