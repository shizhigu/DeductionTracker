import React from 'react';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  href?: string;
}

export function Logo({
  size = 'md',
  showText = true,
  className = '',
  href = '/dashboard'
}: LogoProps) {
  const sizes = {
    sm: {
      container: 'h-8 w-8',
      text: 'text-lg'
    },
    md: {
      container: 'h-10 w-10',
      text: 'text-xl'
    },
    lg: {
      container: 'h-12 w-12',
      text: 'text-2xl'
    }
  };

  const logoContent = (
    <>
      <div className={`${sizes[size].container} rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center`}>
        <span className="text-white font-bold">D</span>
      </div>
      {showText && (
        <h1 className={`${sizes[size].text} ml-3 font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent`}>
          DeduX
        </h1>
      )}
    </>
  );

  return href ? (
    <Link href={href} className={`flex items-center ${className}`}>
      {logoContent}
    </Link>
  ) : (
    <div className={`flex items-center ${className}`}>
      {logoContent}
    </div>
  );
} 