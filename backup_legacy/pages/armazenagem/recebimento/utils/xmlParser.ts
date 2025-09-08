/**
 * Utility functions for parsing XML files
 */

/**
 * Parse an XML file into a JavaScript object
 */
export const parseXmlFile = async (file: File): Promise<Record<string, any> | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        try {
          // Using a more simple approach to parse the XML
          const xmlContent = e.target.result as string;
          
          // Parse XML manually
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
          
          if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            console.error("Erro ao fazer parse do XML: Formato inválido");
            reject(new Error("Formato de XML inválido"));
            return;
          }
          
          console.log("XML parseado com sucesso usando DOMParser");
          const result = xmlToJson(xmlDoc);
          console.log("Convertido para objeto:", result);
          resolve(result);
        } catch (error) {
          console.error("Erro ao processar o XML:", error);
          reject(error);
        }
      } else {
        reject(new Error("Não foi possível ler o conteúdo do arquivo"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Erro na leitura do arquivo"));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Convert an XML document to a JavaScript object
 */
export const xmlToJson = (xml: Document): Record<string, any> => {
  // Create a function to transform an XML node into a JSON object
  const convertNodeToJson = (node: Node): any => {
    // Basic element
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue?.trim();
      return text ? text : null;
    }
    
    // If it's an element
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const obj: Record<string, any> = {};
      
      // Add attributes
      if (element.attributes && element.attributes.length > 0) {
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          obj[attr.name] = attr.value;
        }
      }
      
      // Process child nodes
      for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];
        
        // Skip empty text nodes
        if (child.nodeType === Node.TEXT_NODE && (!child.nodeValue || !child.nodeValue.trim())) {
          continue;
        }
        
        if (child.nodeType === Node.ELEMENT_NODE) {
          const childElement = child as Element;
          const tagName = childElement.tagName.toLowerCase();
          
          // If the node already exists, transform it into an array
          if (obj[tagName]) {
            if (!Array.isArray(obj[tagName])) {
              obj[tagName] = [obj[tagName]];
            }
            obj[tagName].push(convertNodeToJson(child));
          } else {
            // Otherwise, add it normally
            obj[tagName] = convertNodeToJson(child);
          }
        } else if (child.nodeType === Node.TEXT_NODE && child.nodeValue && child.nodeValue.trim()) {
          // If there's only text, use the value directly
          if (element.childNodes.length === 1) {
            return child.nodeValue.trim();
          }
        }
      }
      
      return obj;
    }
    
    return null;
  };
  
  // Start with the root element
  const rootElement = xml.documentElement;
  const result: Record<string, any> = {};
  result[rootElement.tagName.toLowerCase()] = convertNodeToJson(rootElement);
  
  return result;
};
