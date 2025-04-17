import React from 'react';
import Link from 'next/link';
import { Menu, X, Search, Bell, User } from 'lucide-react';

export interface MobileNavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

export interface MobileHeaderProps {
  logo: React.ReactNode;
  onMenuClick: () => void;
  onProfileClick: () => void;
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
}

export function MobileHeader({
  logo,
  onMenuClick,
  onProfileClick,
  title,
  showSearch = true,
  showNotifications = true
}: MobileHeaderProps) {
  return (
    <div className="h-16 flex items-center justify-between px-4 w-full">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-700 focus:outline-none"
          aria-label="打开菜单"
        >
          <Menu size={24} />
        </button>
        <div className="ml-2">
          {logo}
        </div>
        {title && <h1 className="ml-3 text-lg font-semibold truncate">{title}</h1>}
      </div>
      
      <div className="flex items-center space-x-1">
        {showSearch && (
          <button className="p-2 text-slate-500 hover:text-slate-700 focus:outline-none" aria-label="搜索">
            <Search size={20} />
          </button>
        )}
        {showNotifications && (
          <button className="p-2 text-slate-500 hover:text-slate-700 focus:outline-none" aria-label="通知">
            <Bell size={20} />
          </button>
        )}
        <button 
          onClick={onProfileClick}
          className="p-2 text-slate-500 hover:text-slate-700 focus:outline-none"
          aria-label="用户资料"
        >
          <User size={20} />
        </button>
      </div>
    </div>
  );
}

export interface MobileFooterProps {
  items: MobileNavItemProps[];
  fabButton?: React.ReactNode;
}

export function MobileFooter({ items, fabButton }: MobileFooterProps) {
  return (
    <div className="h-16 flex items-center justify-around w-full relative">
      {items.map((item, index) => {
        // 如果有悬浮按钮，则平均分配除中间位置外的空间
        const isCenterItem = fabButton && items.length % 2 === 0 && index === items.length / 2 - 1;
        
        return (
          <Link 
            key={`mobile-nav-${index}`}
            href={item.href}
            className={`
              flex flex-col items-center justify-center flex-1 py-1
              ${item.isActive ? 'text-primary' : 'text-slate-400'}
              ${isCenterItem ? 'mr-8' : ''}
            `}
          >
            <div className="h-6 w-6 mb-1">{item.icon}</div>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
      
      {fabButton && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {fabButton}
        </div>
      )}
    </div>
  );
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  logo: React.ReactNode;
  menuItems: MobileNavItemProps[];
  footerContent?: React.ReactNode;
}

export function MobileMenu({ isOpen, onClose, logo, menuItems, footerContent }: MobileMenuProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>{logo}</div>
        <button 
          onClick={onClose}
          className="p-2 -mr-2 text-slate-500 hover:text-slate-700 focus:outline-none"
          aria-label="关闭菜单"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-4">
          {menuItems.map((item, index) => (
            <li key={`side-menu-${index}`}>
              <Link
                href={item.href}
                className={`
                  flex items-center px-4 py-3 rounded-lg
                  ${item.isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-700 hover:bg-slate-100'
                  }
                `}
                onClick={onClose}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {footerContent && (
        <div className="p-4 border-t">
          {footerContent}
        </div>
      )}
    </div>
  );
} 