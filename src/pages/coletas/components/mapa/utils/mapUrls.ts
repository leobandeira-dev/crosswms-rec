
import { Carga } from '../../../types/coleta.types';

/**
 * Generate a Google Maps directions URL for a sequence of addresses
 * This can be used when the Maps API isn't working properly
 */
export const generateGoogleMapsDirectionsUrl = (cargas: Carga[]): string => {
  if (cargas.length === 0) return '';
  
  // Base URL for Google Maps directions
  let url = 'https://www.google.com/maps/dir/';
  
  // Add each address to the URL
  cargas.forEach((carga) => {
    const endereco = `${carga.destino}, ${carga.cep || ''}, Brasil`;
    // Replace spaces with '+' and encode the address for URL
    const encodedEndereco = encodeURIComponent(endereco);
    url += `${encodedEndereco}/`;
  });
  
  return url;
};

/**
 * Generate a Google Maps search URL for a single address
 */
export const generateGoogleMapsSearchUrl = (carga: Carga): string => {
  const address = `${carga.destino}, ${carga.cep || ''}, Brasil`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};
