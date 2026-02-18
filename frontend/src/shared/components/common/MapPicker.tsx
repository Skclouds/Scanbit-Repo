import React, { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
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

interface MapPickerProps {
  position: { lat: number; lng: number } | null;
  onPositionChange: (position: { lat: number; lng: number }) => void;
  height?: string;
}

function LocationMarker({ 
  onPositionChange, 
  initialPosition 
}: { 
  onPositionChange: (pos: { lat: number; lng: number }) => void; 
  initialPosition: { lat: number; lng: number } | null;
}) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialPosition);

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  const map = useMapEvents({
    click(e) {
      const newPosition = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };
      setPosition(newPosition);
      onPositionChange(newPosition);
    },
  });

  useEffect(() => {
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, [map, position]);

  return position === null ? null : <Marker position={position} icon={icon} />;
}

// Error fallback component
function MapErrorFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-secondary rounded-lg">
      <div className="text-center p-4">
        <p className="text-sm text-muted-foreground mb-2">Map could not load</p>
        <p className="text-xs text-muted-foreground">Please refresh the page or try again later</p>
      </div>
    </div>
  );
}

const MapPicker = ({ position, onPositionChange, height = "400px" }: MapPickerProps) => {
  const [isReady, setIsReady] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderKeyRef = useRef(0);
  
  const defaultCenter: [number, number] = useMemo(() => 
    position ? [position.lat, position.lng] : [28.6139, 77.2090], 
    [position]
  );

  const defaultZoom = useMemo(() => position ? 15 : 10, [position]);

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;
    let checkCount = 0;
    const maxChecks = 50;
    
    // Critical: Wait for Dialog portal to be fully mounted and React context to be stable
    const initialize = () => {
      checkCount++;
      
      if (!mounted || checkCount > maxChecks) {
        if (mounted && !isReady) {
          renderKeyRef.current += 1;
          setIsReady(true);
        }
        return;
      }
      
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // Container is visible, wait for React to finish all portal renders
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (mounted && !isReady) {
                  timeoutId = setTimeout(() => {
                    if (mounted && !isReady) {
                      renderKeyRef.current += 1;
                      setIsReady(true);
                    }
                  }, 2000);
                }
              });
            });
          });
          return;
        }
      }
      
      timeoutId = setTimeout(initialize, 200);
    };
    
    const initialTimeout = setTimeout(initialize, 2000);
    const fallbackTimeout = setTimeout(() => {
      if (mounted && !isReady) {
        renderKeyRef.current += 1;
        setIsReady(true);
      }
    }, 8000);

    return () => {
      mounted = false;
      clearTimeout(initialTimeout);
      clearTimeout(fallbackTimeout);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isReady]);

  useEffect(() => {
    if (mapInstance && isReady) {
      const timers = [
        setTimeout(() => {
          try {
            mapInstance.invalidateSize();
          } catch (e) {
            // Ignore
          }
        }, 500),
        setTimeout(() => {
          try {
            mapInstance.invalidateSize();
          } catch (e) {
            // Ignore
          }
        }, 1000),
        setTimeout(() => {
          try {
            mapInstance.invalidateSize();
          } catch (e) {
            // Ignore
          }
        }, 2000),
      ];
      return () => timers.forEach(t => clearTimeout(t));
    }
  }, [mapInstance, isReady]);

  if (!isReady) {
    return (
      <div 
        ref={containerRef}
        style={{ height, width: "100%" }} 
        className="rounded-lg overflow-hidden border border-border w-full flex items-center justify-center bg-secondary"
      >
        <div className="text-muted-foreground text-sm">Loading map...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{ height, width: "100%" }} 
      className="rounded-lg overflow-hidden border border-border w-full"
      key={`map-wrapper-${renderKeyRef.current}`}
    >
      <MapErrorBoundary fallback={<MapErrorFallback />}>
        <MapContainer
          key={`map-container-${renderKeyRef.current}`}
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
          whenCreated={(instance: any) => {
            setMapInstance(instance);
            setTimeout(() => {
              try {
                instance.invalidateSize();
              } catch (e) {
                // Ignore
              }
            }, 100);
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onPositionChange={onPositionChange} initialPosition={position} />
        </MapContainer>
      </MapErrorBoundary>
    </div>
  );
};

// React Error Boundary class component
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {

  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }
    return this.props.children;
  }
}

export default MapPicker;
