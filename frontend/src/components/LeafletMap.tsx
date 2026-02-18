import React, { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LeafletMapProps {
  position: { lat: number; lng: number } | null;
  address?: string;
  businessName?: string;
  height?: string;
}

const LeafletMap = ({ position, address, businessName, height = "100%" }: LeafletMapProps) => {
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const defaultCenter: [number, number] = useMemo(() => 
    position ? [position.lat, position.lng] : [28.6139, 77.2090], 
    [position]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady || !position) {
    return (
      <div 
        ref={containerRef}
        style={{ height, width: "100%" }} 
        className="w-full flex items-center justify-center bg-slate-800/50 rounded-[2rem]"
      >
        <div className="text-slate-400 text-sm animate-pulse flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Initializing Map...
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ height, width: "100%" }} 
      className="rounded-[2.5rem] overflow-hidden border border-white/10 w-full"
    >
      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={defaultCenter} icon={icon}>
          <Popup>
            <div className="p-2">
              <p className="font-black text-slate-900 leading-none mb-1">{businessName || 'Business Location'}</p>
              <p className="text-xs text-slate-500 leading-tight">{address}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
