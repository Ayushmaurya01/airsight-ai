"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Report } from "@/lib/db";
import { formatTimeAgo } from "@/lib/utils";

interface InteractiveMapProps {
  mode: "picker" | "viewer";
  reports?: Report[];
  selectedLocation?: [number, number];
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  filterType?: string;
  filterSeverity?: string;
}

// Custom markers generator for futuristic glowing pins
function createGlowingIcon(severity: string) {
  const colorMap: Record<string, string> = {
    Low: "#10b981",     // Emerald
    Medium: "#f59e0b",  // Amber
    High: "#f97316",    // Orange
    Critical: "#ef4444" // Red
  };
  const color = colorMap[severity] || "#3b82f6"; // Default Blue

  return L.divIcon({
    className: "custom-glowing-marker",
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
        animation: markerPulse 2s infinite ease-in-out;
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

// Picker events handler
const MapPickerEvents = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Pan map to location component
const MapPanTo = ({ center }: { center?: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
};

export default function InteractiveMap({
  mode,
  reports = [],
  selectedLocation,
  onLocationSelect,
  filterType = "all",
  filterSeverity = "all",
}: InteractiveMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]); // SF Default

  // Cleanup Leaflet instances on unmount to prevent "Map container is already initialized"
  useEffect(() => {
    return () => {
      const container = document.querySelector(".leaflet-container");
      if (container) {
        (container as any)._leaflet_id = null;
      }
    };
  }, []);
  
  useEffect(() => {
    // Attempt to get user current location if in picker mode
    if (mode === "picker" && !selectedLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setMapCenter([lat, lng]);
          if (onLocationSelect) {
            onLocationSelect(lat, lng, "Current Detected Location");
          }
        },
        () => {}
      );
    }
  }, [mode, selectedLocation, onLocationSelect]);

  const handleMapClickSelect = async (lat: number, lng: number) => {
    if (onLocationSelect) {
      let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      try {
        // Simple client-side reverse geocoding using OSM Nominatim (works out-of-the-box!)
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
          headers: { "User-Agent": "AirSightAI-App" }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            address = data.display_name.split(",").slice(0, 3).join(",");
          }
        }
      } catch (err) {
        console.error("Reverse geocode failed: ", err);
      }
      onLocationSelect(lat, lng, address);
    }
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const matchesType = filterType === "all" || r.pollution_type.toLowerCase().includes(filterType.toLowerCase());
    const matchesSeverity = filterSeverity === "all" || r.severity === filterSeverity;
    return matchesType && matchesSeverity;
  });

  const mapKey = `${mode}-${selectedLocation ? selectedLocation.join(",") : "none"}-${reports.length}`;

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <MapContainer
        key={mapKey}
        center={selectedLocation || mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full dark-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapPanTo center={selectedLocation || mapCenter} />

        {mode === "picker" && (
          <>
            <MapPickerEvents onSelect={handleMapClickSelect} />
            {selectedLocation && (
              <Marker position={selectedLocation} icon={createGlowingIcon("Medium")}>
                <Popup>
                  <div className="text-xs font-semibold p-1">Selected Report Coordinates</div>
                </Popup>
              </Marker>
            )}
          </>
        )}

        {mode === "viewer" &&
          filteredReports.map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={createGlowingIcon(report.severity)}
            >
              <Popup>
                <div className="text-slate-900 dark:text-white p-2 max-w-xs text-xs font-sans">
                  {report.image_url && (
                    <img
                      src={report.image_url}
                      alt={report.title}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  )}
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-slate-800">{report.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        report.severity === "Critical"
                          ? "bg-red-100 text-red-700"
                          : report.severity === "High"
                          ? "bg-orange-100 text-orange-700"
                          : report.severity === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {report.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-2 leading-tight">{report.description}</p>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 border-t border-slate-100 pt-2">
                    <div>
                      <strong>Type:</strong> {report.pollution_type}
                    </div>
                    <div>
                      <strong>Status:</strong> {report.status}
                    </div>
                    <div>
                      <strong>Reported:</strong> {formatTimeAgo(report.created_at)}
                    </div>
                    <div>
                      <strong>Citizen:</strong> {report.citizen_name || "Elena Rostova"}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
