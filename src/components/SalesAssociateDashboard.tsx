'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest, requestPayout, getPayoutRequests } from '../utils/api';
import DynamicMap from './DynamicMap';
import ActivityTimeline from './ActivityTimeline';
import { MapPin, Play, Square, MessageSquare, Plus, History, Calendar, CheckCircle, Navigation, TrendingUp, DollarSign, Bell, AlertTriangle, RefreshCw, FileText } from 'lucide-react';

interface Lead {
  _id: string;
  name: string;
  contact: string;
  location: { lat: number; lng: number };
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
  _id: string;
  dateStr: string;
  status: 'started' | 'ended';
  startTime: string;
  endTime?: string;
  startLocation: { lat: number; lng: number; accuracy: number };
  endLocation?: { lat: number; lng: number; accuracy: number; distanceFromPrevKm?: number; routeGeometryFromPrev?: string };
  activities: Activity[];
  totalDistanceKm: number;
  autoEnded?: boolean;
}

export const SalesAssociateDashboard: React.FC = () => {
  const [activeSession, setActiveSession] = useState<DaySession | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [history, setHistory] = useState<DaySession[]>([]);
  const [selectedHistorySession, setSelectedHistorySession] = useState<DaySession | null>(null);
  
  // Tabs and payout requests states
  const [activeTab, setActiveTab] = useState<'tracking' | 'payouts' | 'analytics'>('tracking');
  const [payouts, setPayouts] = useState<any[]>([]);

  // Form states
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [notes, setNotes] = useState('');
  
  // Loading & status states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch current status
      const statusRes = await apiRequest('/api/session/status');
      if (statusRes.ok) {
        const data = await statusRes.json();
        setActiveSession(data.session);
      }

      // 2. Fetch leads
      const leadsRes = await apiRequest('/api/leads');
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.leads || []);
      }

      // 3. Fetch history
      fetchHistory();

      // 4. Fetch payout requests
      fetchPayouts();
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data from the server');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    try {
      const data = await getPayoutRequests();
      setPayouts(data.requests || []);
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
    }
  };

  const handleRequestPayout = async (dateStr: string, distanceKm: number) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await requestPayout(dateStr, distanceKm, `Fuel reimbursement for ${dateStr}`);
      if (res.error) {
        setError(res.error);
      } else {
        await fetchPayouts();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request payout');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const historyRes = await apiRequest('/api/session/history');
      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(data.sessions || []);
      }
    } catch (err) {
      console.error('History fetch failed:', err);
    }
  };

  const getBrowserLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      setLocationStatus('Acquiring GPS fix...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus(null);
          resolve(position);
        },
        (err) => {
          setLocationStatus(null);
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    });
  };

  const getLocalDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleStartDay = async () => {
    setActionLoading(true);
    setError(null);
    let coords = { lat: 17.4483, lng: 78.3915, accuracy: 999 }; // Default Office Fallback

    try {
      const pos = await getBrowserLocation();
      coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy || 10
      };
    } catch (err: any) {
      console.warn('GPS failed, starting day with fallback office location:', err);
      setError('GPS unavailable. Started day with default central office coordinates (Fallback).');
    }

    try {
      const res = await apiRequest('/api/session/start', {
        method: 'POST',
        body: JSON.stringify({
          location: coords,
          dateStr: getLocalDateStr()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to start working day');
      } else {
        setActiveSession(data.session);
        setSelectedHistorySession(null); // Clear history focus
        fetchHistory();
      }
    } catch (err) {
      setError('Network connection error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !notes.trim()) {
      setError('Please select a lead and add meeting notes');
      return;
    }

    setActionLoading(true);
    setError(null);

    const selectedLead = leads.find((l) => l._id === selectedLeadId);
    let coords = { lat: 17.4483, lng: 78.3915, accuracy: 999 }; // Default fallback

    if (selectedLead) {
      coords = {
        lat: selectedLead.location.lat,
        lng: selectedLead.location.lng,
        accuracy: 999 // Mark as lead location fallback
      };
    }

    try {
      const pos = await getBrowserLocation();
      coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy || 10
      };
    } catch (err: any) {
      console.warn('GPS failed, using Lead location as fallback:', err);
      setError('GPS connection timed out. Visit logged at target Lead Location (Fallback).');
    }

    try {
      const res = await apiRequest('/api/session/activity', {
        method: 'POST',
        body: JSON.stringify({
          leadId: selectedLeadId,
          notes,
          location: coords
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to log activity');
      } else {
        setActiveSession(data.session);
        setSelectedLeadId('');
        setNotes('');
      }
    } catch (err) {
      setError('Network connection error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndDay = async () => {
    if (!window.confirm('Are you sure you want to end your working day? This will close your tracking.')) {
      return;
    }

    setActionLoading(true);
    setError(null);
    let coords = { lat: 17.4483, lng: 78.3915, accuracy: 999 }; // Default fallback

    // Default to last activity location if GPS fails
    if (activeSession && activeSession.activities.length > 0) {
      const lastAct = activeSession.activities[activeSession.activities.length - 1];
      coords = {
        lat: lastAct.location.lat,
        lng: lastAct.location.lng,
        accuracy: 999
      };
    } else if (activeSession) {
      coords = {
        lat: activeSession.startLocation.lat,
        lng: activeSession.startLocation.lng,
        accuracy: 999
      };
    }

    try {
      const pos = await getBrowserLocation();
      coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy || 10
      };
    } catch (err) {
      console.warn('GPS failed on closure, using last recorded stop coordinates:', err);
      setError('GPS unavailable on exit. Ended day at last recorded stop (Fallback).');
    }

    try {
      const res = await apiRequest('/api/session/end', {
        method: 'POST',
        body: JSON.stringify({ location: coords })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to end working day');
      } else {
        setActiveSession(null);
        fetchHistory();
      }
    } catch (err) {
      setError('Network connection error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 font-medium animate-pulse">Loading dashboard state...</p>
      </div>
    );
  }

  // Define session to map/render
  const displayedSession = selectedHistorySession || activeSession;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-100">
      
      {/* Notifications / Errors */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold text-center">
          {error}
        </div>
      )}
      {locationStatus && (
        <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold text-center animate-pulse">
          {locationStatus}
        </div>
      )}

      {/* Modern Dashboard Header Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4 mb-8">
        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === 'tracking'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          Activity Tracking
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
          Reimbursement Payouts
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          Analytics Graphs
        </button>
      </div>

      {activeTab === 'tracking' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Logging controls */}
          <div className="space-y-8">
            {/* Active Session Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-2xl" />
              <h2 className="font-bold text-lg text-slate-200 mb-4 flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${activeSession ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                <span>{activeSession ? 'Session Active' : 'Off Duty'}</span>
              </h2>

              {activeSession ? (
                <div className="space-y-4">
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Today's Distance</p>
                    <p className="text-3xl font-extrabold text-indigo-400 mt-1">{activeSession.totalDistanceKm.toFixed(2)} km</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                    <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800/60">
                      <p className="font-semibold">Started At</p>
                      <p className="text-slate-200 font-bold mt-1">
                        {new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800/60">
                      <p className="font-semibold">Stops Visited</p>
                      <p className="text-slate-200 font-bold mt-1">{activeSession.activities.length} Stops</p>
                    </div>
                  </div>

                  <button
                    onClick={handleEndDay}
                    disabled={actionLoading}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Square className="h-4 w-4 fill-white" />
                    <span>End Working Day</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Start your work day to enable automatic location tracking, road-mileage mapping, and fuel reimbursement logs.
                  </p>
                  <button
                    onClick={handleStartDay}
                    disabled={actionLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-emerald-950/20 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    <span>Start Working Day</span>
                  </button>
                </div>
              )}
            </div>

            {/* Activity Logger Form */}
            {activeSession && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h2 className="font-bold text-lg text-slate-200 mb-4 flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-indigo-400" />
                  <span>Log Lead Visit</span>
                </h2>

                <form onSubmit={handleLogActivity} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Lead</label>
                    <select
                      value={selectedLeadId}
                      onChange={(e) => setSelectedLeadId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-slate-200 outline-none"
                      required
                    >
                      <option value="">-- Choose a Client Lead --</option>
                      {leads.map((l) => (
                        <option key={l._id} value={l._id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 font-mono">Meeting Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter short details about the visit, meeting points, follow ups..."
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-200 outline-none resize-none placeholder-slate-600"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>Log Visit & Location</span>
                  </button>
                </form>
              </div>
            )}

            {/* History Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h2 className="font-bold text-lg text-slate-200 mb-4 flex items-center space-x-2">
                <History className="h-5 w-5 text-indigo-400" />
                <span>Past Work Days</span>
              </h2>

              {history.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-4">No historical sessions recorded.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {history.map((h) => (
                    <button
                      key={h._id}
                      onClick={() => setSelectedHistorySession(selectedHistorySession?._id === h._id ? null : h)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 active:scale-95 cursor-pointer ${
                        selectedHistorySession?._id === h._id
                          ? 'bg-indigo-600/10 border-indigo-500'
                          : 'bg-slate-950/30 border-slate-800/80 hover:bg-slate-800/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                          <Calendar className="h-3 w-3" />
                          <span>{h.dateStr}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-mono">
                          {h.activities.length} stops logged
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-slate-200">{h.totalDistanceKm.toFixed(1)} km</p>
                        {h.autoEnded && (
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
          </div>

          {/* Right Side: Route Map and Timeline Details */}
          <div className="lg:col-span-2 space-y-8">
            {displayedSession ? (
              <>
                {/* Session Overview Header */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase bg-slate-800 text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-500/10">
                        {selectedHistorySession ? 'Reviewing Past Day' : 'Current Active Day'}
                      </span>
                      <span className="text-sm text-slate-400 font-semibold font-mono">{displayedSession.dateStr}</span>
                    </div>
                    <h1 className="font-extrabold text-xl text-slate-100 mt-2">
                      Route Map & Stop Timelines
                    </h1>
                  </div>
                  {selectedHistorySession && (
                    <button
                      onClick={() => setSelectedHistorySession(null)}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 bg-indigo-500/5 px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      Back to Active Day
                    </button>
                  )}
                </div>

                {/* Map */}
                <DynamicMap
                  startLocation={displayedSession.startLocation}
                  endLocation={displayedSession.endLocation}
                  activities={displayedSession.activities}
                />

                {/* Timeline */}
                <ActivityTimeline
                  startTime={displayedSession.startTime}
                  endTime={displayedSession.endTime}
                  startLocation={displayedSession.startLocation}
                  endLocation={displayedSession.endLocation}
                  activities={displayedSession.activities}
                  totalDistanceKm={displayedSession.totalDistanceKm}
                />
              </>
            ) : (
              <div className="h-full min-h-[450px] border border-dashed border-slate-800 bg-slate-900/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
                  <CheckCircle className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="font-bold text-lg text-slate-300">No active tracking session</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Tapping the 'Start Working Day' button will activate GPS logging and show your current travel timeline on the map.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cleared Payouts</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  ₹{payouts.filter(p => p.status === 'cleared').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center space-x-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending / In Process</p>
                <p className="text-2xl font-black text-amber-400 mt-1">
                  ₹{payouts.filter(p => p.status === 'pending' || p.status === 'in_process').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center space-x-4">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Blocked Claims</p>
                <p className="text-2xl font-black text-rose-400 mt-1">
                  ₹{payouts.filter(p => p.status === 'blocked').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Eligible Sessions for Payout */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-slate-200 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-400" />
                <span>Eligible Daily Sessions (Fuel Rate: ₹12/km)</span>
              </h3>

              {history.filter(h => h.status === 'ended').length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-6">No ended sessions available.</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {history
                    .filter(h => h.status === 'ended')
                    .map((h) => {
                      const request = payouts.find(p => p.dateStr === h.dateStr);
                      const amount = Math.round(h.totalDistanceKm * 12 * 100) / 100;
                      return (
                        <div key={h._id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-center justify-between">
                          <div>
                            <p className="text-sm font-extrabold text-slate-200">{h.dateStr}</p>
                            <p className="text-xs text-slate-400 mt-1 font-mono">
                              {h.totalDistanceKm.toFixed(1)} km • Estimated: ₹{amount.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            {request ? (
                              <span
                                className={`text-xs font-bold border rounded-full px-3 py-1 uppercase ${
                                  request.status === 'cleared'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : request.status === 'in_process'
                                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                    : request.status === 'blocked'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}
                              >
                                {request.status.replace('_', ' ')}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRequestPayout(h.dateStr, h.totalDistanceKm)}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                              >
                                Request Payout
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Right Column: Submitted Payout Ledger */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-slate-200 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                <span>Reimbursement Request Ledger</span>
              </h3>

              {payouts.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-6">No payout requests submitted yet.</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {payouts.map((p) => (
                    <div key={p._id} className="p-4 bg-slate-950/20 border border-slate-805 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-extrabold text-slate-300">{p.dateStr}</p>
                          <span className="text-[10px] text-slate-500 font-mono">({p.distanceKm.toFixed(1)} km)</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Submitted on {new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-200">₹{p.amount.toFixed(2)}</p>
                        <span
                          className={`inline-block text-[9px] font-extrabold border rounded-full px-2 py-0.5 mt-1 uppercase ${
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* SVG 7-Day Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-200 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-indigo-400" />
                  <span>Last 7 Days Mileage Analytics</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Graphical view of recent client visit driving logs</p>
              </div>
              <span className="text-xs font-bold bg-slate-950 text-indigo-400 border border-indigo-500/10 rounded-lg px-3 py-1 font-mono">
                ₹12/km Rate
              </span>
            </div>

            {history.length === 0 ? (
              <div className="py-12 text-center text-slate-500 italic">
                Start logging tracking sessions to populate daily distance charts.
              </div>
            ) : (
              <div className="space-y-6">
                {/* SVG Visual graph container */}
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[500px]">
                    <svg viewBox="0 0 600 180" className="w-full h-auto">
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="580" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
                      <line x1="40" y1="60" x2="580" y2="60" stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
                      <line x1="40" y1="100" x2="580" y2="100" stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
                      <line x1="40" y1="140" x2="580" y2="140" stroke="#1e293b" strokeWidth="1" />

                      {/* Y-Axis Label */}
                      <text x="30" y="24" fill="#64748b" fontSize="9" textAnchor="end">Max</text>
                      <text x="30" y="80" fill="#64748b" fontSize="9" textAnchor="end">Mid</text>
                      <text x="30" y="144" fill="#64748b" fontSize="9" textAnchor="end">0 km</text>

                      {/* Render Bars */}
                      {(() => {
                        const sorted = [...history].sort((a, b) => a.dateStr.localeCompare(b.dateStr));
                        const last7 = sorted.slice(-7);
                        const maxVal = Math.max(...last7.map(h => h.totalDistanceKm), 10);

                        return last7.map((h, i) => {
                          const barHeight = (h.totalDistanceKm / maxVal) * 110;
                          const barWidth = 36;
                          const x = 60 + i * 72;
                          const y = 140 - barHeight;

                          return (
                            <g key={h._id} className="group cursor-pointer">
                              {/* Hover Tooltip Value */}
                              <rect
                                x={x - 8}
                                y={y - 20}
                                width="52"
                                height="16"
                                rx="3"
                                fill="#0f172a"
                                stroke="#334155"
                                strokeWidth="1"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                              />
                              <text
                                x={x + 18}
                                y={y - 8}
                                fill="#f1f5f9"
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                              >
                                {h.totalDistanceKm.toFixed(1)} km
                              </text>

                              {/* Vertical Bar */}
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={Math.max(barHeight, 2)}
                                rx="4"
                                fill="url(#barGradient)"
                                className="transition-all duration-300 hover:fill-indigo-400"
                              />

                              {/* Label */}
                              <text x={x + 18} y="156" fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="semibold">
                                {h.dateStr.substring(5)}
                              </text>
                            </g>
                          );
                        });
                      })()}
                    </svg>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span><strong>Interpretation:</strong> Heights correspond to OSRM calculated actual-road mileage. Hover bars to inspect values.</span>
                  </div>
                  <span className="font-bold text-slate-200">Reimbursement accumulates at ₹12/km.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default SalesAssociateDashboard;
