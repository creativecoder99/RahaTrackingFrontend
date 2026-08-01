'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  startLocation: { lat: number; lng: number };
  endLocation?: { lat: number; lng: number; routeGeometryFromPrev?: string } | null;
  activities: Array<{
    leadName: string;
    notes: string;
    location: { lat: number; lng: number };
    routeGeometryFromPrev?: string;
  }>;
}

export const Map: React.FC<MapProps> = ({ startLocation, endLocation, activities }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!startLocation || typeof startLocation.lat !== 'number' || typeof startLocation.lng !== 'number') return;

    let map = mapInstanceRef.current;

    if (map && mapContainerRef.current && map.getContainer() !== mapContainerRef.current) {
      try {
        map.remove();
      } catch (e) {
        console.warn('Failed to remove orphaned map instance:', e);
      }
      map = null;
      mapInstanceRef.current = null;
    }

    if (!map) {
      map = L.map(mapContainerRef.current, {
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
      }).setView([startLocation.lat, startLocation.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      map.setView([startLocation.lat, startLocation.lng]);
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });
    }

    const startIcon = L.divIcon({
      className: 'custom-pin-start',
      html: `<div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg text-white font-bold text-xs animate-bounce">S</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const endIcon = L.divIcon({
      className: 'custom-pin-end',
      html: `<div class="w-8 h-8 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center shadow-lg text-white font-bold text-xs">E</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const boundsPoints: L.LatLngExpression[] = [[startLocation.lat, startLocation.lng]];

    L.marker([startLocation.lat, startLocation.lng], { icon: startIcon })
      .addTo(map)
      .bindPopup(
        `<div class="p-2">
          <h3 class="font-bold text-slate-800 text-sm">Start Point</h3>
          <p class="text-xs text-slate-500">Day started here</p>
         </div>`
      );

    activities.forEach((act, index) => {
      if (!act.location || typeof act.location.lat !== 'number' || typeof act.location.lng !== 'number') {
        return;
      }

      const actIcon = L.divIcon({
        className: 'custom-pin-act',
        html: `<div class="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center shadow-lg text-white font-bold text-xs">${index + 1}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      L.marker([act.location.lat, act.location.lng], { icon: actIcon })
        .addTo(map)
        .bindPopup(
          `<div class="p-2 max-w-[200px]">
            <h3 class="font-bold text-slate-800 text-sm">Stop #${index + 1}: ${act.leadName}</h3>
            <p class="text-xs text-slate-600 mt-1 italic">"${act.notes}"</p>
           </div>`
        );

      boundsPoints.push([act.location.lat, act.location.lng]);
    });

    if (endLocation && typeof endLocation.lat === 'number' && typeof endLocation.lng === 'number') {
      L.marker([endLocation.lat, endLocation.lng], { icon: endIcon })
        .addTo(map)
        .bindPopup(
          `<div class="p-2">
            <h3 class="font-bold text-slate-800 text-sm">End Point</h3>
            <p class="text-xs text-slate-500">Day ended here</p>
           </div>`
        );

      boundsPoints.push([endLocation.lat, endLocation.lng]);
    }

    let drawnRoute = false;

    activities.forEach((act) => {
      if (act.routeGeometryFromPrev) {
        try {
          const pathCoords = JSON.parse(act.routeGeometryFromPrev);
          if (Array.isArray(pathCoords) && pathCoords.length > 0) {
            L.polyline(pathCoords as L.LatLngExpression[], {
              color: '#6366f1',
              weight: 5,
              opacity: 0.8,
              lineJoin: 'round',
            }).addTo(map);
            drawnRoute = true;
          }
        } catch (e) {
          console.error('Failed to parse activity route geometry', e);
        }
      }
    });

    if (endLocation && typeof endLocation.lat === 'number' && typeof endLocation.lng === 'number' && endLocation.routeGeometryFromPrev) {
      try {
        const pathCoords = JSON.parse(endLocation.routeGeometryFromPrev);
        if (Array.isArray(pathCoords) && pathCoords.length > 0) {
          L.polyline(pathCoords as L.LatLngExpression[], {
            color: '#6366f1',
            weight: 5,
            opacity: 0.8,
            lineJoin: 'round',
          }).addTo(map);
          drawnRoute = true;
        }
      } catch (e) {
        console.error('Failed to parse end location route geometry', e);
      }
    }

    if (!drawnRoute && boundsPoints.length > 1) {
      L.polyline(boundsPoints, {
        color: '#a5b4fc',
        weight: 3,
        dashArray: '5, 5',
        opacity: 0.8,
      }).addTo(map);
    }

    if (boundsPoints.length > 0) {
      map.fitBounds(L.latLngBounds(boundsPoints), { padding: [40, 40], animate: false });
    }
  }, [startLocation, endLocation, activities]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Failed to remove Leaflet map instance on unmount', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[350px] md:h-[450px] rounded-2xl overflow-hidden shadow-inner border border-slate-700 bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 10 }} />
    </div>
  );
};

export default Map;
