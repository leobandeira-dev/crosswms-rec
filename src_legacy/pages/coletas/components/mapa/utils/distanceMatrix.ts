import { Carga } from '../../../types/coleta.types';
import { toast } from '@/hooks/use-toast';

interface DistanceMatrixResponseElement {
  distance?: {
    text: string;
    value: number;
  };
  duration?: {
    text: string;
    value: number;
  };
  status: string;
}

interface DistanceMatrixResult {
  totalDistance: number;
  totalDuration: number;
  formattedDistance: string;
  formattedDuration: string;
  elements: DistanceMatrixResponseElement[];
}

/**
 * Calculate distance and duration between a sequence of cargo points
 * @param cargas Array of cargo objects with destination addresses
 * @returns Promise with distance matrix results
 */
export const calculateDistanceMatrix = async (cargas: Carga[]): Promise<DistanceMatrixResult | null> => {
  if (!window.google || !window.google.maps || cargas.length < 2) {
    return null;
  }

  try {
    const service = new google.maps.DistanceMatrixService();
    
    // Get addresses for origins and destinations
    const addresses = cargas.map(carga => `${carga.destino}, ${carga.cep || ''}, Brasil`);
    
    // For sequential points, we need each point as both origin and destination (except first and last)
    const origins = addresses.slice(0, addresses.length - 1);
    const destinations = addresses.slice(1);
    
    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins,
          destinations,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
        },
        (response, status) => {
          if (status !== 'OK' || !response) {
            console.error('Error calculating distance matrix:', status);
            reject(new Error(`Erro no cálculo da matriz de distância: ${status}`));
            return;
          }
          
          try {
            // Process the results
            let totalDistance = 0;
            let totalDuration = 0;
            const elements: DistanceMatrixResponseElement[] = [];
            
            // For each origin-destination pair, sum up the distances
            for (let i = 0; i < response.rows.length; i++) {
              const row = response.rows[i];
              
              // We only need one destination per origin for sequential routing
              const element = row.elements[0];
              elements.push(element);
              
              if (element.status === 'OK') {
                if (element.distance) totalDistance += element.distance.value;
                if (element.duration) totalDuration += element.duration.value;
              }
            }
            
            // Format the total distance and duration
            const formattedDistance = (totalDistance / 1000).toFixed(1) + ' km';
            const hours = Math.floor(totalDuration / 3600);
            const minutes = Math.floor((totalDuration % 3600) / 60);
            const formattedDuration = `${hours}h ${minutes}min`;
            
            resolve({
              totalDistance,
              totalDuration,
              formattedDistance,
              formattedDuration,
              elements
            });
          } catch (error) {
            console.error('Error processing distance matrix results:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in calculateDistanceMatrix:', error);
    toast({
      title: "Erro no cálculo de distâncias",
      description: "Não foi possível calcular as distâncias entre os pontos.",
      variant: "destructive"
    });
    return null;
  }
};

/**
 * Get optimized sequence of cargas based on distance matrix
 * @param cargas Array of cargo objects to optimize
 * @returns Promise with optimized cargas array
 */
export const getOptimizedRoute = async (cargas: Carga[]): Promise<Carga[]> => {
  if (cargas.length <= 2) return cargas; // No need to optimize with 2 or fewer points
  
  try {
    const service = new google.maps.DirectionsService();
    const addresses = cargas.map(carga => `${carga.destino}, ${carga.cep || ''}, Brasil`);
    
    // Request directions with waypoint optimization
    const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
      service.route(
        {
          origin: addresses[0],
          destination: addresses[addresses.length - 1],
          waypoints: addresses.slice(1, addresses.length - 1).map(address => ({
            location: address,
            stopover: true,
          })),
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === google.maps.DirectionsStatus.OK && response) {
            resolve(response);
          } else {
            reject(new Error(`Erro na otimização de rota: ${status}`));
          }
        }
      );
    });
    
    // Use the optimized waypoint order to reorder cargas
    // First point and last point remain the same, only waypoints are reordered
    if (result.routes && result.routes[0] && result.routes[0].waypoint_order) {
      const waypoint_order = result.routes[0].waypoint_order;
      
      // Keep first and last points fixed
      const optimizedCargas: Carga[] = [cargas[0]];
      
      // Add the middle points in optimized order
      for (const index of waypoint_order) {
        optimizedCargas.push(cargas[index + 1]); // +1 because waypoint_order is 0-indexed for waypoints only
      }
      
      // Add the last point
      optimizedCargas.push(cargas[cargas.length - 1]);
      
      return optimizedCargas;
    }
    
    return cargas; // Return original order if optimization fails
  } catch (error) {
    console.error('Error in getOptimizedRoute:', error);
    toast({
      title: "Erro na otimização de rota",
      description: "Não foi possível otimizar a ordem dos pontos na rota.",
      variant: "destructive"
    });
    return cargas; // Return original order if optimization fails
  }
};
