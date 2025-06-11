import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  ChartBarIcon,
  BoltIcon,
  TruckIcon,
  Cog6ToothIcon,
  MapIcon,
  BoltSlashIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import AuthService from '../../services/auth.service';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Vehicles', href: '/vehicles', icon: TruckIcon },
  { name: 'Charging Stations', href: '/charging-stations', icon: BoltIcon },
  { name: 'Charging Sessions', href: '/charging-sessions', icon: BoltSlashIcon },
  { name: 'Map', href: '/map', icon: MapIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Users', href: '/users', icon: UserGroupIcon, roles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

const Sidebar: React.FC = () => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleLogout = () => {
    AuthService.logout();
    router.push('/login');
  };
  
  return (
    <div
      className={`bg-gray-900 text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      } min-h-screen fixed top-0 left-0 z-40`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!isCollapsed && (
          <span className="text-xl font-semibold">EV Charging</span>
        )}
        <button
          className="p-1 rounded-md hover:bg-gray-800"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          )}
        </button>
      </div>
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = router.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center' : 'justify-start'
                } px-2 py-2 rounded-md ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon
                  className="h-6 w-6 flex-shrink-0"
                  aria-hidden="true"
                />
                {!isCollapsed && (
                  <span className="ml-3">{item.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="absolute bottom-0 w-full px-2 pb-5">
        <button
          onClick={handleLogout}
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-start'
          } w-full px-2 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white`}
        >
          <ArrowLeftOnRectangleIcon
            className="h-6 w-6 flex-shrink-0"
            aria-hidden="true"
          />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 