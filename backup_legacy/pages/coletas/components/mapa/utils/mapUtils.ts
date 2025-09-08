
import { MutableRefObject } from 'react';

// Cleanup function to safely remove elements and listeners
export const cleanupMapResources = (
  markersRef: MutableRefObject<google.maps.Marker[]>,
  directionsRendererRef: MutableRefObject<google.maps.DirectionsRenderer | null>,
  googleMapRef: MutableRefObject<google.maps.Map | null>
) => {
  // Clear markers
  if (markersRef.current && markersRef.current.length > 0) {
    markersRef.current.forEach(marker => {
      if (marker) {
        try {
          google.maps.event.clearInstanceListeners(marker);
          marker.setMap(null);
        } catch (e) {
          console.error("Error cleaning up marker:", e);
        }
      }
    });
    markersRef.current = [];
  }
  
  // Clear directions renderer
  if (directionsRendererRef.current) {
    try {
      directionsRendererRef.current.setMap(null);
    } catch (e) {
      console.error("Error cleaning directions renderer:", e);
    }
    directionsRendererRef.current = null;
  }
  
  // Clear map
  if (googleMapRef.current) {
    try {
      google.maps.event.clearInstanceListeners(googleMapRef.current);
    } catch (e) {
      console.error("Error cleaning map listeners:", e);
    }
  }
};

// Function to initialize the Google Map
export const initializeGoogleMap = (
  mapElement: HTMLDivElement,
  isMountedRef: MutableRefObject<boolean>
): google.maps.Map | null => {
  if (!mapElement || !window.google || !window.google.maps || !isMountedRef.current) return null;
  
  try {
    console.log("Initializing Google Map");
    
    // Create map
    return new google.maps.Map(mapElement, {
      center: { lat: -23.5505, lng: -46.6333 }, // São Paulo como centro inicial
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
  } catch (error) {
    console.error("Error initializing map:", error);
    return null;
  }
};
