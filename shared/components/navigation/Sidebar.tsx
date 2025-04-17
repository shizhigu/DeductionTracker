import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  href: string;
  isActive?: boolean;
}

export function SidebarItem({ icon, title, href, isActive = false }: SidebarItemProps) {
  return (
    <li>
      <Link
        href={href}
        className={`
          flex items-center px-4 py-3 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-blue-50 text-blue-600 shadow-sm' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
          }
        `}
      >
        <span className={`mr-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
          {icon}
        </span>
        <span className="font-medium">{title}</span>
        {isActive && (
          <span className="ml-auto">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          </span>
        )}
      </Link>
    </li>
  );
}

export interface SidebarProps {
  logo?: React.ReactNode;
  items: SidebarItemProps[];
  footer?: React.ReactNode;
  className?: string;
}

export function Sidebar({ logo, items, footer, className = '' }: SidebarProps) {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {logo && (
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-200">
          {logo}
        </div>
      )}
      
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {items.map((item, index) => (
            <SidebarItem 
              key={`${item.href}-${index}`}
              icon={item.icon}
              title={item.title}
              href={item.href}
              isActive={item.isActive}
            />
          ))}
        </ul>
      </nav>
      
      {footer && (
        <div className="px-4 py-4 border-t border-slate-200">
          {footer}
        </div>
      )}
    </div>
  );
} 