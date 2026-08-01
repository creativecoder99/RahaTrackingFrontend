import React from 'react';
import { MapPin, Briefcase, Flag, Clock } from 'lucide-react';

interface Activity {
  leadName: string;
  notes: string;
  timestamp: string | Date;
  location: { lat: number; lng: number; accuracy: number };
  distanceFromPrevKm: number;
}

interface TimelineProps {
  startTime: string | Date;
  endTime?: string | Date | null;
  startLocation: { lat: number; lng: number; accuracy: number };
  endLocation?: { lat: number; lng: number; accuracy: number; distanceFromPrevKm?: number } | null;
  activities: Activity[];
  totalDistanceKm: number;
}

export const ActivityTimeline: React.FC<TimelineProps> = ({
  startTime,
  endTime,
  startLocation,
  endLocation,
  activities,
  totalDistanceKm,
}) => {
  const formatTime = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <h2 className="font-bold text-lg text-indigo-400">Day Timeline</h2>
        <div className="bg-indigo-600 bg-opacity-20 text-indigo-400 font-semibold px-3 py-1 rounded-full text-sm border border-indigo-500 border-opacity-30">
          Total: {totalDistanceKm.toFixed(2)} km
        </div>
      </div>

      <div className="relative border-l border-slate-800 ml-4 pl-8 space-y-8">
        <div className="relative">
          <span className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 shadow-md">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <h3 className="font-bold text-slate-200">Start Day</h3>
              <span className="text-xs font-semibold bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center space-x-1 w-fit">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(startTime)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Location: {startLocation.lat.toFixed(5)}, {startLocation.lng.toFixed(5)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Accuracy radius: {startLocation.accuracy.toFixed(0)}m
            </p>
          </div>
        </div>

        {activities.map((act, index) => (
          <div key={index} className="relative">
            <span className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500 text-indigo-400 shadow-md">
              <Briefcase className="h-4 w-4" />
            </span>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <h3 className="font-bold text-slate-200">
                  Stop #{index + 1}: {act.leadName}
                </h3>
                <span className="text-xs font-semibold bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center space-x-1 w-fit">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(act.timestamp)}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 italic text-left">
                "{act.notes}"
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                <span>Location: {act.location.lat.toFixed(5)}, {act.location.lng.toFixed(5)}</span>
                <span>Accuracy: {act.location.accuracy.toFixed(0)}m</span>
                <span className="text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  +{act.distanceFromPrevKm.toFixed(2)} km
                </span>
              </div>
            </div>
          </div>
        ))}

        {endLocation && typeof endLocation.lat === 'number' && typeof endLocation.lng === 'number' && endTime ? (
          <div className="relative">
            <span className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 border border-rose-500 text-rose-400 shadow-md">
              <Flag className="h-4 w-4" />
            </span>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <h3 className="font-bold text-slate-200">End Day</h3>
                <span className="text-xs font-semibold bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center space-x-1 w-fit">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(endTime)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Location: {endLocation.lat.toFixed(5)}, {endLocation.lng.toFixed(5)}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                <span>Accuracy: {endLocation.accuracy.toFixed(0)}m</span>
                {endLocation.distanceFromPrevKm !== undefined && (
                  <span className="text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    +{endLocation.distanceFromPrevKm.toFixed(2)} km
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          !endTime && (
            <div className="relative">
              <span className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400/70 border-dashed animate-pulse">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-400 text-left">Day in progress...</h3>
                <p className="text-xs text-slate-500 mt-0.5 text-left">
                  Awaiting day closure or activity updates
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
