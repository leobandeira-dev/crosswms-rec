
import { Carga } from '../../../types/coleta.types';
import { renderRoute } from './routeRenderer';

const MARKER_COLORS = {
  origin: 'green',
  destination: 'red',
  waypoint: 'blue'
};

/**
 * Initialize map markers for each cargo
 */
export const initializeMarkers = (
  map: google.maps.Map,
  cargas: Carga[],
  markersRef: React.MutableRefObject<google.maps.Marker[]>,
  directionsRendererRef: React.MutableRefObject<google.maps.DirectionsRenderer | null>,
  setSelectedCardId: (id: string | null) => void
): void => {
  if (!map || !window.google || !window.google.maps) return;

  try {
    const geocoder = new google.maps.Geocoder();
    
    // Clear existing markers first (safety check)
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        if (marker) {
          try {
            google.maps.event.clearInstanceListeners(marker);
            marker.setMap(null);
          } catch (e) {
            console.error("Error cleaning existing marker:", e);
          }
        }
      });
      markersRef.current = [];
    }

    // Bounds to adjust map view
    const bounds = new google.maps.LatLngBounds();
    let successfulGeocodes = 0;
    
    // Create markers for each cargo
    cargas.forEach((carga, index) => {
      const endereco = `${carga.destino}, ${carga.cep || ''}, Brasil`;
      
      geocoder.geocode({ address: endereco }, (results, status) => {
        // Check if component is still active - we use a simple check against map
        if (!map) return;
        
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const position = results[0].geometry.location;
          
          // Extend bounds to include this location
          bounds.extend(position);
          successfulGeocodes++;
          
          // Determine marker color based on position in array
          let markerColor = MARKER_COLORS.waypoint;
          if (index === 0) markerColor = MARKER_COLORS.origin;
          if (index === cargas.length - 1) markerColor = MARKER_COLORS.destination;
          
          // Create custom marker label with the cargo order
          const label = {
            text: (index + 1).toString(),
            color: 'white',
            fontWeight: 'bold'
          };

          try {
            // Create marker
            const marker = new google.maps.Marker({
              position,
              map,
              title: carga.destino,
              label: label,
              icon: {
                url: `http://maps.google.com/mapfiles/ms/icons/${markerColor}-dot.png`,
                labelOrigin: new google.maps.Point(15, 10)
              }
            });
            
            // Store marker reference
            markersRef.current.push(marker);
            
            // Create info window
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="max-width: 200px;">
                  <h3 style="margin: 0; font-size: 16px;">${carga.id}</h3>
                  <p style="margin: 5px 0;"><strong>Destino:</strong> ${carga.destino}</p>
                  <p style="margin: 5px 0;"><strong>Volumes:</strong> ${carga.volumes || '0'}</p>
                  <p style="margin: 5px 0;"><strong>Peso:</strong> ${carga.peso || 'N/A'}</p>
                </div>
              `
            });
            
            // Add click listener
            marker.addListener('click', () => {
              // Update selected card ID
              setSelectedCardId(carga.id);
              
              // Open info window at marker's position
              infoWindow.open(map);
              infoWindow.setPosition(marker.getPosition());
            });
          } catch (e) {
            console.error("Error creating marker:", e);
          }
          
          // Fit map to markers after all have been added
          if (successfulGeocodes === cargas.length) {
            fitMapToBounds(map, bounds, cargas, directionsRendererRef);
          }
        } else {
          console.error(`Geocode failed for address ${endereco}:`, status);
          successfulGeocodes++;
          
          // Even with failure, try to fit map when all geocodes are processed
          if (successfulGeocodes === cargas.length && markersRef.current.length > 0) {
            fitMapToBounds(map, bounds, cargas, directionsRendererRef);
          }
        }
      });
    });
  } catch (error) {
    console.error('Error initializing markers:', error);
  }
};

// Extracted function to fit map to bounds and render route
const fitMapToBounds = (
  map: google.maps.Map, 
  bounds: google.maps.LatLngBounds,
  cargas: Carga[],
  directionsRendererRef: React.MutableRefObject<google.maps.DirectionsRenderer | null>
) => {
  // Check if the map is still valid before fitting bounds
  try {
    // A safer way to determine if the map is still valid
    const center = map.getCenter(); // This will throw if map is not valid
    
    map.fitBounds(bounds);
    
    // Set minimum zoom to prevent excessive zoom on single markers
    const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
      if (map.getZoom() && map.getZoom() > 15) {
        map.setZoom(15);
      }
    });
    
    // If more than one cargo, draw a route
    if (cargas.length > 1) {
      try {
        renderRoute(map, cargas, directionsRendererRef);
      } catch (e) {
        console.error("Error rendering route:", e);
      }
    }
  } catch (e) {
    console.error("Map is no longer valid:", e);
  }
};
