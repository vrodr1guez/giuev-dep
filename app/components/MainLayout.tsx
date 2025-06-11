import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

interface NavItemProps {
  to: string;
  children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <li className="mb-3">
      <Link 
        to={to} 
        className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${
          isActive 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        {children}
      </Link>
    </li>
  );
};

interface IconProps {
  className?: string;
}

const NotificationBellIcon: React.FC<IconProps> = ({ className = "w-6 h-6 text-gray-600" }) => (
  <span className={className} aria-hidden="true">
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  </span>
);

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-5 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">GIU EV Fleet</h2>
        <p className="text-sm text-gray-400 mt-1">Fleet Management System</p>
      </div>
      
      <nav className="flex-1">
        <ul>
          <NavItem to="/">Dashboard Overview</NavItem>
          <NavItem to="/vehicles">Vehicles</NavItem>
          <NavItem to="/charging-stations">Charging Stations</NavItem>
          <NavItem to="/route-planning">Route Planning</NavItem>
          <NavItem to="/drivers">Drivers & Coaching</NavItem>
          <NavItem to="/energy-management">Energy Management</NavItem>
          <NavItem to="/v2g">V2G Management</NavItem>
          <NavItem to="/reports">Reports & Analytics</NavItem>
          <NavItem to="/settings">Settings</NavItem>
        </ul>
      </nav>
      
      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          <p>© 2024 GIU EV Fleet</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

interface UserProfile {
  name: string;
  role: string;
  avatar: string;
}

interface NotificationButtonProps {
  count: number;
  onClick?: () => void;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ count, onClick }) => (
  <button 
    type="button"
    className="p-2 hover:bg-gray-100 rounded-full relative"
    onClick={onClick}
    aria-label={`${count} notifications`}
  >
    <NotificationBellIcon />
    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
      {count}
    </span>
  </button>
);

interface UserProfileDisplayProps {
  profile: UserProfile;
}

const UserProfileDisplay: React.FC<UserProfileDisplayProps> = ({ profile }) => (
  <div className="flex items-center space-x-3">
    <span className="w-10 h-10 rounded-full overflow-hidden">
      <img 
        src={profile.avatar} 
        alt={`${profile.name}'s avatar`}
        className="w-full h-full object-cover"
        width={40}
        height={40}
      />
    </span>
    <div className="hidden md:block">
      <p className="text-sm font-medium text-gray-700">{profile.name}</p>
      <p className="text-xs text-gray-500">{profile.role}</p>
    </div>
  </div>
);

const Header: React.FC = () => {
  const userProfile: UserProfile = {
    name: "John Doe",
    role: "Fleet Manager",
    avatar: "https://via.placeholder.com/40"
  };

  const handleNotificationClick = (): void => {
    console.log('Notifications clicked');
  };

  return (
    <header className="bg-white shadow-md px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-700">Fleet Operator Dashboard</h1>
        
        <div className="flex items-center space-x-4">
          <NotificationButton count={3} onClick={handleNotificationClick} />
          <UserProfileDisplay profile={userProfile} />
        </div>
      </div>
    </header>
  );
};

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 