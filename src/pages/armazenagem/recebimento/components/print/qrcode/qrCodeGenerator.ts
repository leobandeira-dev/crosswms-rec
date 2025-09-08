
import { sha1 } from './sha1';

/**
 * Generate a QR Code SVG for DANFE
 * Following MOC 7.0 specifications:
 * - Minimum size: 25mm x 25mm
 * - Error correction level: M (15%)
 * - Encoded using UTF-8
 * - Generated from proper SEFAZ URL + parameters
 * 
 * @param notaData NFe data needed for QR code generation
 * @returns SVG string with QR Code
 */
export const generateQRCode = async (notaData: any): Promise<string> => {
  // This is a placeholder implementation
  // In a real-world scenario, you would:
  // 1. Construct the proper URL with parameters as per MOC 7.0
  // 2. Generate the hash using SHA-1
  // 3. Use a proper QR code library like qrcode.js
  
  // For now, we'll create a simple SVG representing a QR code
  const size = 100; // 100px (equivalent to ~25mm) 
  
  // Create a simulated QR code pattern
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  
  // Generate a basic QR code appearance based on the NFe key
  const chave = notaData.chaveNF || '12345678901234567890123456789012345678901234';
  
  // Generate a hash which would be used in an actual implementation
  const qrCodeUrl = generateQRCodeParameters(notaData);
  // Important change: await the Promise from sha1() to get the actual string
  const hash = await sha1(qrCodeUrl);
  
  // Calculate a simple pattern based on the hash
  // In reality, you would use a proper QR code generation library
  const moduleSize = size / 25; // 25x25 modules
  
  // Create positioning squares (finder patterns)
  // Top-left
  svg += `<rect x="${moduleSize}" y="${moduleSize}" width="${7*moduleSize}" height="${7*moduleSize}" fill="black"/>`;
  svg += `<rect x="${2*moduleSize}" y="${2*moduleSize}" width="${5*moduleSize}" height="${5*moduleSize}" fill="white"/>`;
  svg += `<rect x="${3*moduleSize}" y="${3*moduleSize}" width="${3*moduleSize}" height="${3*moduleSize}" fill="black"/>`;
  
  // Top-right
  svg += `<rect x="${(25-8)*moduleSize}" y="${moduleSize}" width="${7*moduleSize}" height="${7*moduleSize}" fill="black"/>`;
  svg += `<rect x="${(25-7)*moduleSize}", y="${2*moduleSize}", width="${5*moduleSize}", height="${5*moduleSize}" fill="white"/>`;
  svg += `<rect x="${(25-6)*moduleSize}", y="${3*moduleSize}", width="${3*moduleSize}", height="${3*moduleSize}" fill="black"/>`;
  
  // Bottom-left
  svg += `<rect x="${moduleSize}", y="${(25-8)*moduleSize}", width="${7*moduleSize}", height="${7*moduleSize}" fill="black"/>`;
  svg += `<rect x="${2*moduleSize}", y="${(25-7)*moduleSize}", width="${5*moduleSize}", height="${5*moduleSize}" fill="white"/>`;
  svg += `<rect x="${3*moduleSize}", y="${(25-6)*moduleSize}", width="${3*moduleSize}", height="${3*moduleSize}" fill="black"/>`;
  
  // Add some data modules based on the hash
  for (let i = 0; i < hash.length; i++) {
    const charCode = hash.charCodeAt(i);
    const x = (9 + i % 10) * moduleSize;
    const y = (9 + Math.floor(i / 10)) * moduleSize;
    
    if (charCode % 2 === 1) {
      svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
    }
  }
  
  // Add timing patterns (the lines between finder patterns)
  for (let i = 8; i < 17; i++) {
    // Horizontal timing pattern
    if (i % 2 === 0) {
      svg += `<rect x="${i*moduleSize}" y="${6*moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
    }
    
    // Vertical timing pattern
    if (i % 2 === 0) {
      svg += `<rect x="${6*moduleSize}" y="${i*moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
    }
  }
  
  svg += '</svg>';
  return svg;
};

/**
 * Generate the QR Code parameters according to MOC 7.0
 * 
 * @param notaData NFe data
 * @returns A string with the parameters in the correct format
 */
function generateQRCodeParameters(notaData: any): string {
  // In a real implementation, this would construct the proper URL + parameters
  // according to the SEFAZ specifications
  
  const chNFe = notaData.chaveNF || '12345678901234567890123456789012345678901234';
  const nVersao = '100'; // Version 1.0
  const tpAmb = '1'; // Production environment (1) or test environment (2)
  const cDest = notaData.destinatarioCNPJ?.replace(/\D/g, '') || '';
  const dhEmi = notaData.dataHoraEmissao || new Date().toISOString();
  const vNF = notaData.valorTotal?.toString().replace(/\D/g, '') || '0';
  const vICMS = (notaData.valorIcms || '0').toString().replace(/\D/g, '');
  const digVal = 'ABCDEF0123456789ABCDEF0123456789ABCDEF01'; // Digest value of the NFe (simplified)
  const cIdToken = '000001'; // Token ID authorized by the SEFAZ
  
  // Build URL in the format specified by the SEFAZ
  const qrCodeUrl = `http://www.fazenda.xx.gov.br/nfe/qrcode?` + 
                    `chNFe=${chNFe}&` +
                    `nVersao=${nVersao}&` +
                    `tpAmb=${tpAmb}&` +
                    `cDest=${cDest}&` +
                    `dhEmi=${encodeURIComponent(dhEmi)}&` +
                    `vNF=${vNF}&` +
                    `vICMS=${vICMS}&` +
                    `digVal=${encodeURIComponent(digVal)}&` +
                    `cIdToken=${cIdToken}`;
                    
  return qrCodeUrl;
}
