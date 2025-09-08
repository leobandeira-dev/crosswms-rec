
import React, { useEffect, useRef, useState } from 'react';
import { Carga } from '../../types/coleta.types';
import { initializeMarkers } from './utils/markerManager';
import MapLoading from './components/MapLoading';
import useGoogleMaps from './hooks/useGoogleMaps';
import { cleanupMapResources, initializeGoogleMap } from './utils/mapUtils';

interface MapaContainerProps {
  cargas: Carga[];
  selectedCardId: string | null;
  setSelectedCardId: (id: string | null) => void;
}

const MapaContainer: React.FC<MapaContainerProps> = ({ 
  cargas, 
  selectedCardId, 
  setSelectedCardId 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const mapInitializedRef = useRef(false);

  // Use the custom hook for Google Maps loading
  const { isLoading, mapLoaded, mapsLoadedRef, isMountedRef } = useGoogleMaps();

  // Function to initialize map after script is loaded
  const initMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps || !isMountedRef.current) return;
    
    try {
      // Prevent multiple initializations
      if (mapInitializedRef.current) return;
      mapInitializedRef.current = true;
      
      const newMap = initializeGoogleMap(mapRef.current, isMountedRef);
      
      if (newMap) {
        googleMapRef.current = newMap;
        
        // Add markers for each cargo
        if (cargas.length > 0) {
          initializeMarkers(newMap, cargas, markersRef, directionsRendererRef, setSelectedCardId);
        }
      }
    } catch (error) {
      console.error("Error in initMap:", error);
    }
  };

  // Effect to initialize the map when Google Maps script is loaded
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      initMap();
    }
  }, [mapLoaded]);

  // Cleanup function for component unmount
  useEffect(() => {
    return () => {
      console.log("MapaContainer unmounting");
      isMountedRef.current = false;
      
      // Make sure we run cleanup synchronously before component is fully unmounted
      if (window.google && window.google.maps) {
        cleanupMapResources(markersRef, directionsRendererRef, googleMapRef);
      }
      
      // Clear map ref without manipulating DOM
      googleMapRef.current = null;
      mapInitializedRef.current = false;
    };
  }, []);

  // Effect to update markers safely when cargas or selectedCardId change
  useEffect(() => {
    if (!isMountedRef.current) return; // Skip if not mounted
    
    if (googleMapRef.current && window.google && cargas.length > 0 && mapsLoadedRef.current) {
      console.log("Updating markers");
      
      // Clear existing markers before adding new ones
      cleanupMapResources(markersRef, directionsRendererRef, googleMapRef);
      
      // Add new markers
      try {
        initializeMarkers(googleMapRef.current, cargas, markersRef, directionsRendererRef, setSelectedCardId);
      } catch (e) {
        console.error("Error initializing markers during update:", e);
      }
    }
  }, [cargas, selectedCardId, setSelectedCardId]);

  return (
    <div ref={mapRef} className="h-[400px] rounded-md border bg-muted/20 relative">
      {isLoading && <MapLoading />}
    </div>
  );
};

export default MapaContainer;
