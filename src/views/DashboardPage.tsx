'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import SalesAssociateDashboard from '../components/SalesAssociateDashboard';
import BranchHeadDashboard from '../components/BranchHeadDashboard';

export const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 font-medium animate-pulse">Initializing user dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <Navbar />
      {user.role === 'branch_head' ? (
        <BranchHeadDashboard />
      ) : (
        <SalesAssociateDashboard />
      )}
    </div>
  );
};

export default DashboardPage;
