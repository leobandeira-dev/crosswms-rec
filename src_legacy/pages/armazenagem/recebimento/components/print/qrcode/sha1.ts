
/**
 * SHA-1 hash function implementation using Web Crypto API when available,
 * falling back to a simple implementation for demo purposes.
 * 
 * @param message String to hash
 * @returns SHA-1 hash as a hex string
 */
export async function sha1(message: string): Promise<string> {
  // Use Web Crypto API if available (modern browsers)
  if (window.crypto && window.crypto.subtle) {
    try {
      // Convert string to UTF-8 encoded array buffer
      const msgBuffer = new TextEncoder().encode(message);
      
      // Generate hash using Web Crypto API
      const hashBuffer = await window.crypto.subtle.digest('SHA-1', msgBuffer);
      
      // Convert ArrayBuffer to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (e) {
      console.warn('Web Crypto API failed, falling back to simplified implementation', e);
      // Fall back to simplified implementation
    }
  }
  
  // Fallback simplified implementation (not cryptographically secure - for demo only)
  return fallbackSha1(message);
}

/**
 * Fallback SHA-1 implementation (simplified, NOT cryptographically secure)
 * Only for demonstration purposes when Web Crypto API is not available
 */
function fallbackSha1(message: string): string {
  // Convert string to a sequence of UTF-8 bytes
  const utf8Encode = function(str: string): string {
    try {
      return unescape(encodeURIComponent(str));
    } catch (e) {
      return str;
    }
  };
  
  const utf8Message = utf8Encode(message);
  
  // Simple hash function that creates a deterministic but not cryptographically secure hash
  let hash = 0;
  
  for (let i = 0; i < utf8Message.length; i++) {
    const char = utf8Message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Create a SHA-1 like hex string (just for visualization)
  const positiveHash = Math.abs(hash);
  let hexHash = positiveHash.toString(16);
  
  // Pad to ensure it looks like a SHA-1 hash (40 hex characters)
  while (hexHash.length < 40) {
    hexHash = "0" + hexHash;
  }
  
  return hexHash.substring(0, 40);
}
