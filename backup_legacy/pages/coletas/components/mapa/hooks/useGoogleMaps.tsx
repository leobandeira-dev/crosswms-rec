
import { useEffect, useRef, useState } from 'react';

interface UseGoogleMapsProps {
  onMapLoaded?: (map: google.maps.Map) => void;
}

const useGoogleMaps = ({ onMapLoaded }: UseGoogleMapsProps = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const mapsLoadedRef = useRef<boolean>(false);
  const isMountedRef = useRef(true);
  const mapInitializedRef = useRef(false);
  
  // Function to load Google Maps script safely
  const loadGoogleMapsScript = () => {
    // Check if the script is already loaded
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      setIsLoading(false);
      mapsLoadedRef.current = true;
      return;
    }
    
    // Check if the script is already in the document
    const existingScript = document.getElementById('google-maps-script');
    
    if (!existingScript) {
      const googleMapsScript = document.createElement('script');
      googleMapsScript.id = 'google-maps-script';
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBpywkIjAfeo7YKzS85lcLxJFCAEfcQPmg&libraries=places&callback=initMap`;
      googleMapsScript.async = true;
      googleMapsScript.defer = true;
      
      // Add global callback
      window.initMap = () => {
        if (isMountedRef.current) {
          setMapLoaded(true);
          setIsLoading(false);
          mapsLoadedRef.current = true;
        }
      };
      
      document.head.appendChild(googleMapsScript);
      scriptRef.current = googleMapsScript;
    } else if (window.google && window.google.maps) {
      // Script exists and Google Maps is loaded
      setMapLoaded(true);
      setIsLoading(false);
      mapsLoadedRef.current = true;
    }
  };

  // On mount, load the script
  useEffect(() => {
    console.log("useGoogleMaps hook mounting");
    isMountedRef.current = true;
    
    // Load the Google Maps script when the component mounts
    loadGoogleMapsScript();
    
    // Cleanup function
    return () => {
      console.log("useGoogleMaps hook unmounting");
      isMountedRef.current = false;
      
      // Clear global callback but don't remove the script
      if (window.initMap) {
        window.initMap = () => {};
      }
    };
  }, []);

  return { isLoading, mapLoaded, mapsLoadedRef, isMountedRef, mapInitializedRef };
};

export default useGoogleMaps;

// Add typing for the global window object
declare global {
  interface Window {
    initMap: () => void;
  }
}
