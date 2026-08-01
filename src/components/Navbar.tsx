'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, MapPin } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="w-full bg-surface-base border-b border-border-default/10 text-text-secondary px-space-6 py-space-4 flex items-center justify-between shadow-md backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-space-2">
        <img src="/logo.svg" alt="Raha Logo" className="h-8 w-auto" />
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-text-secondary to-surface-strong bg-clip-text text-transparent">
          Track
        </span>
      </div>

      <div className="flex items-center gap-space-4">
        <div className="flex items-center gap-space-3 bg-text-secondary/5 px-space-4 py-space-2 rounded-xs border border-border-default/10">
          <div className="h-8 w-8 bg-surface-strong text-text-primary rounded-full flex items-center justify-center font-bold text-sm uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold leading-none">{user.name}</p>
            <p className="text-xs text-surface-strong font-medium mt-space-1 capitalize text-left">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-space-2 bg-red-600 hover:bg-red-500 active:scale-95 duration-fast focus-visible:ring-2 focus-visible:ring-focus-ring outline-hidden text-text-secondary px-space-4 py-space-2 rounded-xs text-sm font-semibold transition-all cursor-pointer shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};
export default Navbar;
