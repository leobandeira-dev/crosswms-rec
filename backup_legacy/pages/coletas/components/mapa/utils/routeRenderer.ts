
import { Carga } from '../../../types/coleta.types';
import { toast } from '@/hooks/use-toast';
import { calculateDistanceMatrix } from './distanceMatrix';

/**
 * Render a route between points on the map
 */
export const renderRoute = (
  map: google.maps.Map, 
  cargasRota: Carga[],
  directionsRendererRef: React.MutableRefObject<google.maps.DirectionsRenderer | null>
): void => {
  if (cargasRota.length < 2 || !window.google || !window.google.maps) return;
  
  try {
    const directionsService = new google.maps.DirectionsService();
    
    // Clear previous renderer if it exists
    if (directionsRendererRef.current) {
      try {
        directionsRendererRef.current.setMap(null);
      } catch (e) {
        console.error("Error clearing previous renderer:", e);
      }
      directionsRendererRef.current = null;
    }
    
    // Create new renderer
    try {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // Don't show the default markers from directions
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5,
          strokeOpacity: 0.7
        }
      });
      
      // Set map on the renderer (important to do this separately)
      directionsRendererRef.current.setMap(map);
    } catch (e) {
      console.error("Error creating directions renderer:", e);
      return;
    }
    
    // Get addresses for origin and destinations
    const enderecos = cargasRota.map(carga => `${carga.destino}, ${carga.cep || ''}, Brasil`);
    
    // Configure the route with the first as origin and the last as destination
    const origin = enderecos[0];
    const destination = enderecos[enderecos.length - 1];
    
    // Intermediate points (waypoints)
    const waypoints = enderecos.slice(1, -1).map(endereco => ({
      location: endereco,
      stopover: true
    }));
    
    // Request the route
    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        optimizeWaypoints: false, // We don't optimize here as it could be already optimized
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      },
      async (response, status) => {
        // Check if directions renderer is still valid
        if (!directionsRendererRef.current) {
          console.log("Directions renderer was unmounted, skipping route display");
          return;
        }
        
        if (status === google.maps.DirectionsStatus.OK) {
          try {
            directionsRendererRef.current.setDirections(response);
          } catch (e) {
            console.error("Error setting directions:", e);
            return;
          }
          
          // Use our distance matrix to get more accurate total distance and time
          try {
            const matrixResult = await calculateDistanceMatrix(cargasRota);
            
            if (matrixResult) {
              // Display route information using the matrix calculation
              toast({
                title: "Rota calculada",
                description: `Distância total: ${matrixResult.formattedDistance}. Tempo estimado: ${matrixResult.formattedDuration}.`,
              });
              
              return; // Skip the legacy calculation below
            }
          } catch (error) {
            console.error("Error calculating distance matrix:", error);
            // Continue with legacy calculation if matrix calculation fails
          }
          
          // Legacy calculation from the route response
          try {
            let distanciaTotal = 0;
            let tempoTotal = 0;
            
            const rota = response?.routes[0];
            if (rota && rota.legs) {
              rota.legs.forEach(leg => {
                if (leg.distance) distanciaTotal += leg.distance.value;
                if (leg.duration) tempoTotal += leg.duration.value;
              });
              
              // Convert to more readable formats
              const distanciaKm = (distanciaTotal / 1000).toFixed(1);
              const tempoHoras = Math.floor(tempoTotal / 3600);
              const tempoMinutos = Math.floor((tempoTotal % 3600) / 60);
              
              // Display route information
              toast({
                title: "Rota calculada",
                description: `Distância total: ${distanciaKm} km. Tempo estimado: ${tempoHoras}h ${tempoMinutos}min.`,
              });
            }
          } catch (e) {
            console.error("Error calculating route summary:", e);
          }
        } else if (status !== "ZERO_RESULTS") {
          console.error('Erro ao calcular rota:', status);
          
          // Only show error toast if it's not a simple zero results error
          toast({
            title: "Erro ao calcular rota",
            description: "Não foi possível calcular a rota entre os pontos.",
            variant: "destructive"
          });
        }
      }
    );
  } catch (error) {
    console.error("Error in renderRoute:", error);
  }
};
