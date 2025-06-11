'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Car, 
  Zap, 
  Route, 
  FileBarChart, 
  Sparkles,
  Settings,
  Battery,
  LineChart,
  Clock,
  Calendar,
  Cpu,
  Sparkles as BrainIcon
} from 'lucide-react';
import Logo from './Logo';

const NavBar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Handle scroll events to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const navItems = [
    { href: '/dashboard/overview', label: 'Dashboard', icon: <Home size={18} />, color: 'from-blue-500 to-blue-600' },
    { href: '/vehicles', label: 'Vehicles', icon: <Car size={18} />, color: 'from-emerald-500 to-emerald-600' },
    { href: '/charging', label: 'Charging', icon: <Zap size={18} />, color: 'from-purple-500 to-purple-600' },
    { href: '/ev-management', label: 'EV Management', icon: <Battery size={18} />, color: 'from-rose-500 to-rose-600' },
    { href: '/digital-twin-dashboard', label: '🚀 Digital Twin', icon: <Cpu size={18} />, color: 'from-cyan-500 to-blue-600', isNew: true },
    { href: '/routes', label: 'Routes', icon: <Route size={18} />, color: 'from-orange-500 to-orange-600' },
    { href: '/reports', label: 'Analytics', icon: <LineChart size={18} />, color: 'from-cyan-500 to-cyan-600' },
    { href: '/ai-insights', label: 'AI Insights', icon: <Sparkles size={18} />, color: 'from-violet-500 to-violet-600' },
    { href: '/ml-dashboard', label: 'ML Dashboard', icon: <LineChart size={18} />, color: 'from-green-500 to-green-600' },
    { href: '/api-docs', label: 'API Docs', icon: <FileBarChart size={18} />, color: 'from-pink-500 to-pink-600' },
    { href: '/company', label: 'Company', icon: <Home size={18} />, color: 'from-indigo-500 to-indigo-600' },
  ];
  
  // Determine if we're on a specific main section
  const currentMainSection = navItems.find(item => 
    pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-md shadow-md text-gray-800' : 'bg-transparent text-white'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo isScrolled={scrolled} size="medium" />
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center px-4 py-2 mx-1 rounded-full transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-md` 
                      : `hover:bg-white/10 ${scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/80 hover:text-white'}`
                  } ${item.isNew ? 'animate-pulse' : ''}`}
                >
                  <span className={`flex items-center justify-center ${isActive ? '' : 'group-hover:scale-110 transition-transform duration-300'}`}>
                    {item.icon}
                    <span className="ml-2 font-medium">{item.label}</span>
                    {item.isNew && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full animate-bounce">
                        NEW
                      </span>
                    )}
                  </span>
                  
                  {!isActive && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-500 group-hover:w-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full"></span>
                  )}
                </Link>
              );
            })}
            
            {/* Schedule Demo button */}
            <Link 
              href="/schedule-demo"
              className={`group relative flex items-center px-4 py-2 mx-1 rounded-full transition-all duration-300 ${
                pathname === '/schedule-demo' 
                  ? `bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md` 
                  : `${scrolled ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-white/10 text-white hover:bg-white/20'}`
              }`}
            >
              <span className={`flex items-center justify-center ${pathname === '/schedule-demo' ? '' : 'group-hover:scale-110 transition-transform duration-300'}`}>
                <Calendar size={18} />
                <span className="ml-2 font-medium">Schedule Demo</span>
              </span>
            </Link>
            
            {/* Settings button with different styling */}
            <Link 
              href="/settings"
              className={`p-2 rounded-full transition-all duration-300 ${
                pathname === '/settings' || pathname.startsWith('/settings/') 
                  ? 'bg-gray-200 text-gray-800' 
                  : `${scrolled ? 'text-gray-600 hover:bg-gray-200' : 'text-white/80 hover:bg-white/10'}`
              }`}
              aria-label="Settings"
            >
              <Settings size={20} />
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden p-2 rounded-md focus:outline-none"
            aria-label="Open menu"
          >
            <div className={`w-6 transform transition-all duration-300 ${scrolled ? 'text-gray-800' : 'text-white'}`}>
              <span className={`block h-0.5 w-6 rounded-sm ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'} ${
                scrolled ? 'bg-gray-800' : 'bg-white'
              }`}></span>
              <span className={`block h-0.5 w-6 rounded-sm my-1 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'} ${
                scrolled ? 'bg-gray-800' : 'bg-white'
              }`}></span>
              <span className={`block h-0.5 w-6 rounded-sm ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'} ${
                scrolled ? 'bg-gray-800' : 'bg-white'
              }`}></span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-screen opacity-100 glass-effect' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 py-4 bg-white shadow-lg rounded-b-xl">
          <nav className="grid gap-2">
            {navItems.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg ${
                    isActive 
                      ? `bg-gradient-to-r ${item.color} text-white` 
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${item.isNew ? 'relative' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.isNew && (
                    <span className="ml-auto px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                      NEW
                    </span>
                  )}
                </Link>
              );
            })}
            
            {/* Schedule Demo button in mobile menu */}
            <Link 
              href="/schedule-demo"
              className={`flex items-center p-3 rounded-lg ${
                pathname === '/schedule-demo' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Calendar size={18} className="mr-3" />
              <span>Schedule Demo</span>
            </Link>
            
            <Link 
              href="/settings"
              className={`flex items-center p-3 rounded-lg ${
                pathname === '/settings' || pathname.startsWith('/settings/') 
                  ? 'bg-gray-200 text-gray-800' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings size={18} className="mr-3" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Page title bar - only shown on inner pages when scrolled */}
      {scrolled && currentMainSection && pathname !== '/' && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center h-12">
              <h1 className={`text-lg font-medium bg-gradient-to-r ${currentMainSection.color} bg-clip-text text-transparent`}>
                {currentMainSection.label}
                {currentMainSection.isNew && (
                  <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                    GAME-CHANGER
                  </span>
                )}
              </h1>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;