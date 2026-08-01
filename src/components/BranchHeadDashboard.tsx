'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import DynamicMap from './DynamicMap';
import ActivityTimeline from './ActivityTimeline';
import { Search, Calendar, Download, Users, MapPin, Clipboard, ArrowLeft, Clock, RefreshCw, FileText, Bell, Check, X, ShieldAlert, TrendingUp } from 'lucide-react';

interface Associate {
  _id: string;
  name: string;
  email: string;
}

interface TeamDistance {
  associate: { id: string; name: string; email: string };
  hasSession: boolean;
  sessionStatus: 'started' | 'ended' | 'not_started';
  totalDistanceKm: number;
  activitiesCount: number;
  autoEnded: boolean;
}

interface Activity {
  leadId: string;
  leadName: string;
  notes: string;
  timestamp: string;
  location: { lat: number; lng: number; accuracy: number };
  distanceFromPrevKm: number;
  routeGeometryFromPrev?: string;
}

interface DaySession {
  _id?: string;
  id?: string;
  dateStr: string;
  status: 'started' | 'ended';
  startTime: string;
  endTime?: string;
  startLocation: { lat: number; lng: number; accuracy: number };
  endLocation?: { lat: number; lng: number; accuracy: number; distanceFromPrevKm?: number; routeGeometryFromPrev?: string };
  activities: Activity[];
  totalDistanceKm: number;
  autoEnded: boolean;
  associate?: { id: string; name: string; email: string };
}

export const BranchHeadDashboard: React.FC = () => {
  // Core lists
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [teamDistances, setTeamDistances] = useState<TeamDistance[]>([]);
  const [teamActivity, setTeamActivity] = useState<DaySession[]>([]);
  
  // Tab states and payout approvals
  const [activeTab, setActiveTab] = useState<'team' | 'payouts' | 'analytics'>('team');
  const [payouts, setPayouts] = useState<any[]>([]);

  // Selection / Detail drilldown
  const [selectedAssociate, setSelectedAssociate] = useState<{ id: string; name: string; email: string } | null>(null);
  const [selectedAssociateSessions, setSelectedAssociateSessions] = useState<DaySession[]>([]);
  const [viewedSession, setViewedSession] = useState<DaySession | null>(null);

  // Filters & Actions
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [exportMonth, setExportMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [filterDate]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch managed associates
      const associatesRes = await apiRequest(`/api/branch/associates${searchQuery ? `?q=${searchQuery}` : ''}`);
      if (associatesRes.ok) {
        const data = await associatesRes.json();
        setAssociates(data.associates || []);
      }

      // 2. Fetch daily distances for selected date
      const distRes = await apiRequest(`/api/branch/distances?date=${filterDate}`);
      if (distRes.ok) {
        const data = await distRes.json();
        setTeamDistances(data.distances || []);
      }

      // 3. Fetch recent team activities
      const actRes = await apiRequest('/api/branch/team-activity');
      if (actRes.ok) {
        const data = await actRes.json();
        setTeamActivity(data.sessions || []);
      }

      // 4. Fetch team payout requests
      fetchPayouts();
    } catch (err) {
      console.error(err);
      setError('Failed to fetch branch head data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    try {
      const res = await apiRequest('/api/payouts');
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await apiRequest(`/api/payouts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchPayouts();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update status');
      }
    } catch (err) {
      setError('Network error updating payout status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiRequest(`/api/branch/associates?q=${searchQuery}`);
      if (res.ok) {
        const data = await res.json();
        setAssociates(data.associates || []);
      }
    } catch (err) {
      setError('Search failed');
    }
  };

  const handleSelectAssociate = async (assoc: Associate) => {
    setError(null);
    setHistoryLoading(true);
    setSelectedAssociate({ id: assoc._id, name: assoc.name, email: assoc.email });
    setViewedSession(null);
    try {
      const res = await apiRequest(`/api/branch/associates?associateId=${assoc._id}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to fetch associate history');
      } else {
        const data = await res.json();
        setSelectedAssociateSessions(data.sessions || []);
      }
    } catch (err) {
      setError('Network connection error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setError(null);
    setActionLoading(true);
    try {
      const res = await apiRequest(`/api/branch/export?month=${exportMonth}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to export CSV report');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fuel_reimbursement_${exportMonth}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download reimbursement sheet');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 font-medium animate-pulse">Loading Branch dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-100 space-y-8">
      
      {/* Reconciler Header with Pending Payouts Notification Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-100">Branch Management Portal</h1>
          <p className="text-xs text-slate-500 mt-1">Review active associates, reconcile mileage, and approve fuel payout requests</p>
        </div>
        <div className="flex items-center space-x-3">
          {payouts.filter(p => p.status === 'pending').length > 0 ? (
            <div
              onClick={() => setActiveTab('payouts')}
              className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-xl px-4 py-2 cursor-pointer transition active:scale-95 animate-pulse"
            >
              <Bell className="h-4 w-4" />
              <span>{payouts.filter(p => p.status === 'pending').length} Pending Payouts</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold rounded-xl px-4 py-2">
              <Bell className="h-4 w-4" />
              <span>No Pending Payouts</span>
            </div>
          )}
        </div>
      </div>

      {/* Modern Dashboard Header Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => {
            setActiveTab('team');
            setSelectedAssociate(null);
            setSelectedAssociateSessions([]);
            setViewedSession(null);
          }}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === 'team'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          Team Overview
        </button>
        <button
          onClick={() => {
            setActiveTab('payouts');
            fetchPayouts();
          }}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === 'payouts'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          Payout Approvals
        </button>
        <button
          onClick={() => {
            setActiveTab('analytics');
            fetchInitialData();
          }}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          Team Analytics
        </button>
      </div>

      {/* Top Notification / Errors */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold text-center">
          {error}
        </div>
      )}

      {activeTab === 'team' && (
        <>
          {/* Control Actions Bar (Search, Date Filter, CSV download) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            
            {/* Search */}
            <form onSubmit={handleSearch} className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Search Associates</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition"
                />
                <button type="submit" className="hidden" />
              </div>
            </form>

            {/* Date Filter for distances */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Target Date Summary</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Calendar className="h-4 w-4" />
                </span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Export Monthly Data */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Reimbursement Export</label>
              <div className="flex space-x-2">
                <input
                  type="month"
                  value={exportMonth}
                  onChange={(e) => setExportMonth(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition w-full"
                />
                <button
                  onClick={handleExportCSV}
                  disabled={actionLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer flex-shrink-0"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>CSV</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Main View Area */}
          {selectedAssociate ? (
            /* Drilldown View: Reviewing specific Associate History */
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setSelectedAssociate(null);
                      setSelectedAssociateSessions([]);
                      setViewedSession(null);
                      fetchInitialData();
                    }}
                    className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h2 className="font-extrabold text-lg text-slate-100">
                      {selectedAssociate.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedAssociate.email}</p>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase bg-slate-950 text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                  Associate Travel Logs
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Travel days list */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="font-bold text-slate-200 flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-indigo-400" />
                    <span>Recorded Work Days</span>
                  </h3>

                  {historyLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : selectedAssociateSessions.length === 0 ? (
                    <p className="text-sm text-slate-500 italic text-center py-4">No tracking history recorded for this associate.</p>
                  ) : (
                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                      {selectedAssociateSessions.map((session) => (
                        <button
                          key={session._id || session.id}
                          onClick={() => setViewedSession((viewedSession?._id || viewedSession?.id) === (session._id || session.id) ? null : session)}
                          className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 active:scale-95 cursor-pointer ${
                            (viewedSession?._id || viewedSession?.id) === (session._id || session.id)
                              ? 'bg-indigo-600/10 border-indigo-500'
                              : 'bg-slate-950/30 border-slate-800/80 hover:bg-slate-800/30'
                          }`}
                        >
                          <div>
                            <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                              <Calendar className="h-3 w-3" />
                              <span>{session.dateStr}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5 font-mono">
                              {session.activities.length} stops logged
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-extrabold text-slate-200">
                              {session.totalDistanceKm.toFixed(1)} km
                            </p>
                            {session.autoEnded && (
                              <span className="inline-block text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-1 mt-1">
                                Auto Closed
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected day timeline & map */}
                <div className="lg:col-span-2 space-y-8">
                  {viewedSession ? (
                    <>
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
                        <h3 className="font-extrabold text-md text-slate-200">
                          Day route: {viewedSession.dateStr}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          Started at {new Date(viewedSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {viewedSession.activities.length} stops • Total mileage {viewedSession.totalDistanceKm.toFixed(2)} km
                        </p>
                      </div>

                      <DynamicMap
                        startLocation={viewedSession.startLocation}
                        endLocation={viewedSession.endLocation}
                        activities={viewedSession.activities}
                      />

                      <ActivityTimeline
                        startTime={viewedSession.startTime}
                        endTime={viewedSession.endTime}
                        startLocation={viewedSession.startLocation}
                        endLocation={viewedSession.endLocation}
                        activities={viewedSession.activities}
                        totalDistanceKm={viewedSession.totalDistanceKm}
                      />
                    </>
                  ) : (
                    <div className="h-full min-h-[400px] border border-dashed border-slate-800 bg-slate-900/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4">
                      <MapPin className="h-8 w-8 text-slate-600" />
                      <h3 className="font-bold text-slate-300">Select a work day</h3>
                      <p className="text-sm text-slate-500 max-w-xs">
                        Choose a tracking session from the left column to view its interactive road route and chronological timeline.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ) : (
            /* Team Overview View: Distance table and team activity feed */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left: Associates list */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="font-bold text-slate-200 flex items-center space-x-2">
                  <Users className="h-5 w-5 text-indigo-400" />
                  <span>Sales Associates ({associates.length})</span>
                </h3>

                {associates.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">No associates found.</p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {associates.map((assoc) => (
                      <button
                        key={assoc._id}
                        onClick={() => handleSelectAssociate(assoc)}
                        className="w-full p-3.5 bg-slate-950/30 hover:bg-indigo-600/10 border border-slate-800/80 hover:border-indigo-500 rounded-2xl text-left transition duration-200 cursor-pointer flex justify-between items-center group"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition leading-none">
                            {assoc.name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">{assoc.email}</p>
                        </div>
                        <span className="text-xs text-slate-500 font-bold bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                          View Logs
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Team summary lists */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Daily Summary distances */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-2">
                    <h3 className="font-bold text-slate-200 flex items-center space-x-2">
                      <Clipboard className="h-5 w-5 text-indigo-400" />
                      <span>Team Distances ({filterDate})</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-semibold bg-slate-950 border border-slate-800 rounded px-2 py-0.5">
                      Reimbursement Ledger
                    </span>
                  </div>

                  {teamDistances.length === 0 ? (
                    <p className="text-sm text-slate-500 italic text-center py-6">No data for selected date.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px] tracking-widest">
                            <th className="py-3 px-2">Associate</th>
                            <th className="py-3 px-2">Status</th>
                            <th className="py-3 px-2">Stops</th>
                            <th className="py-3 px-2 text-right">Distance (km)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamDistances.map((dist, idx) => (
                            <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/10 transition">
                              <td className="py-3.5 px-2">
                                <p className="font-bold text-slate-200">{dist.associate.name}</p>
                                <p className="text-[10px] text-slate-500">{dist.associate.email}</p>
                              </td>
                              <td className="py-3.5 px-2">
                                <span
                                  className={`inline-block text-[10px] font-bold border rounded-full px-2.5 py-0.5 capitalize ${
                                    dist.sessionStatus === 'ended'
                                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                      : dist.sessionStatus === 'started'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : 'bg-slate-950 text-slate-500 border-slate-800'
                                  }`}
                                >
                                  {dist.sessionStatus.replace('_', ' ')}
                                </span>
                                {dist.autoEnded && (
                                  <span className="inline-block text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-1 ml-1.5">
                                    Auto Closed
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-2 font-semibold">{dist.activitiesCount} Stop(s)</td>
                              <td className="py-3.5 px-2 text-right font-extrabold text-slate-200">
                                {dist.totalDistanceKm.toFixed(1)} km
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Recent activities feed */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                  <h3 className="font-bold text-slate-200 mb-4 flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-indigo-400" />
                    <span>Recent Team Activity Logs</span>
                  </h3>

                  {teamActivity.length === 0 ? (
                    <p className="text-sm text-slate-500 italic text-center py-6">No recent activity logs.</p>
                  ) : (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {teamActivity.map((session) => (
                        <div
                          key={session._id || session.id}
                          className="p-4 bg-slate-950/20 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-200">
                              {session.associate?.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                              <span className="font-semibold text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                                {session.dateStr}
                              </span>
                              <span>Started at {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>•</span>
                              <span>{session.activities.length} Lead Stops</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-extrabold text-indigo-400">
                                {session.totalDistanceKm.toFixed(1)} km
                              </p>
                              <p className="text-[10px] text-slate-500">Total Mileage</p>
                            </div>
                            <button
                              onClick={() => {
                                if (session.associate) {
                                  const match = associates.find(a => a._id === session.associate?.id);
                                  if (match) {
                                    handleSelectAssociate(match).then(() => {
                                      setViewedSession(session);
                                    });
                                  }
                                }
                              }}
                              className="bg-slate-950 hover:bg-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer"
                            >
                              View Map
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}
        </>
      )}

      {activeTab === 'payouts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-200 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                <span>Team Fuel Payout Requests</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Review mileage requests and reconcile reimburse ledger accounts</p>
            </div>
            <span className="text-xs bg-slate-950 border border-slate-800 text-slate-400 font-mono px-3 py-1.5 rounded-xl">
              Payout Rate: ₹12/km
            </span>
          </div>

          {payouts.length === 0 ? (
            <p className="text-sm text-slate-500 italic text-center py-8">No payout requests found for your branch.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px] tracking-widest">
                    <th className="py-3 px-2">Associate</th>
                    <th className="py-3 px-2">Trip Date</th>
                    <th className="py-3 px-2">Distance (km)</th>
                    <th className="py-3 px-2">Claim Amount</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Reconcile Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p._id} className="border-b border-slate-850 hover:bg-slate-850/20 transition">
                      <td className="py-4 px-2">
                        <p className="font-extrabold text-slate-200">{p.associateName}</p>
                      </td>
                      <td className="py-4 px-2 font-mono text-slate-400">{p.dateStr}</td>
                      <td className="py-4 px-2 font-semibold text-slate-400">{p.distanceKm.toFixed(1)} km</td>
                      <td className="py-4 px-2 font-black text-indigo-400">₹{p.amount.toFixed(2)}</td>
                      <td className="py-4 px-2">
                        <span
                          className={`inline-block text-[10px] font-bold border rounded-full px-2.5 py-0.5 uppercase ${
                            p.status === 'cleared'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : p.status === 'in_process'
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              : p.status === 'blocked'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <select
                          value={p.status}
                          disabled={actionLoading}
                          onChange={(e) => handleStatusChange(p._id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-1.5 px-3 text-xs text-slate-200 outline-none cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_process">In Process</option>
                          <option value="cleared">Cleared</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Comparative Team Mileage Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="font-extrabold text-lg text-slate-200 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-indigo-400" />
                <span>Team Performance Analytics ({filterDate})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Comparing total mileage (km) driven per associate on this date</p>
            </div>

            {teamDistances.length === 0 ? (
              <div className="py-12 text-center text-slate-500 italic">
                No active tracking data available on this date to render graphs.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[500px]">
                    <svg viewBox="0 0 600 200" className="w-full h-auto">
                      <defs>
                        <linearGradient id="managerBarGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="50" y1="20" x2="570" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
                      <line x1="50" y1="75" x2="570" y2="75" stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
                      <line x1="50" y1="130" x2="570" y2="130" stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
                      <line x1="50" y1="150" x2="570" y2="150" stroke="#1e293b" strokeWidth="1" />

                      {/* Axis labels */}
                      <text x="40" y="24" fill="#64748b" fontSize="9" textAnchor="end">Max</text>
                      <text x="40" y="80" fill="#64748b" fontSize="9" textAnchor="end">Mid</text>
                      <text x="40" y="154" fill="#64748b" fontSize="9" textAnchor="end">0 km</text>

                      {/* Render team comparative bars */}
                      {(() => {
                        const maxVal = Math.max(...teamDistances.map(t => t.totalDistanceKm), 10);
                        return teamDistances.map((dist, i) => {
                          const barHeight = (dist.totalDistanceKm / maxVal) * 120;
                          const barWidth = 44;
                          const x = 70 + i * 85;
                          const y = 150 - barHeight;

                          return (
                            <g key={i} className="group cursor-pointer">
                              {/* Value label on hover */}
                              <rect
                                x={x - 6}
                                y={y - 20}
                                width="56"
                                height="16"
                                rx="3"
                                fill="#0f172a"
                                stroke="#334155"
                                strokeWidth="1"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                              />
                              <text
                                x={x + 22}
                                y={y - 8}
                                fill="#f1f5f9"
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                              >
                                {dist.totalDistanceKm.toFixed(1)} km
                              </text>

                              {/* Bar */}
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={Math.max(barHeight, 2)}
                                rx="4"
                                fill="url(#managerBarGrad)"
                                className="transition-all duration-300 hover:fill-emerald-400"
                              />

                              {/* X Axis Name */}
                              <text x={x + 22} y="166" fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="semibold">
                                {dist.associate.name.split(' ')[0]}
                              </text>
                            </g>
                          );
                        });
                      })()}
                    </svg>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl text-xs text-slate-400 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span><strong>Interpretation:</strong> Real-time distance comparison of active sales associates for the selected date. Hover to view precise mileage values.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default BranchHeadDashboard;
