"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../utils/cn';
import { 
  Home, 
  Car, 
  BarChart, 
  Settings, 
  ChevronDown, 
  MapPin, 
  User, 
  Info,
  Sparkles
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  isPremium?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home
  },
  {
    title: "Vehicles",
    href: "/vehicles",
    icon: Car
  },
  {
    title: "Charging Stations",
    href: "/charging-stations",
    icon: MapPin
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart
  },
  {
    title: "Premium Analytics",
    href: "/premium-analytics",
    icon: Sparkles,
    isPremium: true
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User
  },
  {
    title: "Support",
    href: "/support",
    icon: Info
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings
  }
];

export function MainNav() {
  const pathname = usePathname();
  
  return (
    <nav className="flex flex-wrap gap-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
          {item.isPremium && (
            <span className="ml-1 inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-1.5 py-0.5 text-xs font-semibold text-white">
              <Sparkles className="h-3 w-3 mr-0.5" />
              Premium
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
} 