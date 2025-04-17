import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export interface UserInfo {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

interface UserProfileProps {
  user: UserInfo;
  compact?: boolean;
  showControls?: boolean;
  onSettingsClick?: () => void;
  onSignOutClick?: () => void;
}

export function UserProfile({
  user,
  compact = false,
  showControls = true,
  onSettingsClick,
  onSignOutClick
}: UserProfileProps) {
  // 获取用户名首字母作为头像
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0) + 
      nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <div className="w-full">
      <div className="flex items-center space-x-3">
        <div className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium`}>
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user?.name || "User"} 
              className="h-full w-full object-cover rounded-full"
            />
          ) : (
            <span className={compact ? 'text-xs' : 'text-sm'}>
              {getUserInitials()}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`${compact ? 'text-sm' : 'text-base'} font-medium text-slate-900 truncate`}>
            {user?.name || "User"}
          </p>
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-500 truncate`}>
            {user?.email || "user@example.com"}
          </p>
        </div>
        
        {showControls && onSettingsClick && (
          <button 
            onClick={onSettingsClick}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
          >
            <Settings size={compact ? 16 : 18} />
          </button>
        )}
      </div>
      
      {showControls && onSignOutClick && (
        <button 
          onClick={onSignOutClick}
          className="mt-3 w-full py-2 px-3 flex items-center justify-center text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded border border-red-200"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          <span>Sign out</span>
        </button>
      )}
    </div>
  );
} 