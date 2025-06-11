'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  isScrolled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ 
  isScrolled = false,
  size = 'medium'
}) => {
  // Size mappings
  const sizes = {
    small: { width: 80, height: 30 },
    medium: { width: 120, height: 40 },
    large: { width: 160, height: 60 }
  };
  
  const { width, height } = sizes[size];
  
  return (
    <div className={`relative transition-all duration-300 ${
      isScrolled ? 'scale-95' : 'scale-100'
    }`}>
      <Image 
        src="/giu-logo.svg" 
        alt="GIU Logo"
        width={width}
        height={height}
        className="hover:opacity-90 transition-opacity"
        priority
      />
      <div className={`absolute -bottom-2 ${size === 'small' ? '-bottom-1' : '-bottom-2'} left-0 w-full h-0.5 transform scale-x-0 origin-left hover:scale-x-100 transition-transform duration-300 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full`}></div>
    </div>
  );
};

export default Logo; 