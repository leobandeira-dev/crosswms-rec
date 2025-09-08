# NSDocs API Integration - Usage Guide

## Overview

The `nsdocs.api` module provides a clean, reusable integration with the NSDocs API for retrieving Brazilian NFe (Nota Fiscal Eletrônica) documents. It replaces complex RPA automation with reliable API-based data extraction.

## Features

- **OAuth2 Authentication**: Automatic token management with fallback strategies
- **Multiple Endpoint Discovery**: Tests various API endpoints for maximum compatibility
- **Dual Format Support**: Handles both JSON and XML response formats
- **Comprehensive Data Extraction**: Extracts all form fields from NFe documents
- **Error Handling**: Specific error types for proper user feedback
- **Utility Functions**: Built-in formatting for CNPJ, CEP, and validation

## Quick Start

### Basic Usage

```typescript
import { NSDOcsAPI, fetchNFeFromNSDocs } from './nsdocs.api';

// Method 1: Using the convenience function
const result = await fetchNFeFromNSDocs(
  '35250513516247000107550010000113401146202508',
  'your-client-id',
  'your-client-secret'
);

// Method 2: Using the class directly
const api = new NSDOcsAPI('your-client-id', 'your-client-secret');
const result = await api.fetchNFeXML('35250513516247000107550010000113401146202508');
```

### Response Handling

```typescript
if (result.success) {
  console.log('NFe data extracted:', result.data);
  console.log('XML content:', result.xml_content);
  console.log('Source:', result.source);
} else {
  if (result.requires_api_key) {
    console.log('Authentication failed - check credentials');
  } else if (result.nfe_not_found) {
    console.log('NFe not found in database');
  } else if (result.api_error) {
    console.log('API communication error:', result.error);
  } else {
    console.log('General error:', result.error);
  }
}
```

## Data Structure

The API returns a comprehensive data object with all NFe fields:

```typescript
{
  // Basic NFe Information
  chave_nota_fiscal: string,
  numero_nota: string,
  serie_nota: string,
  data_hora_emissao: string,
  natureza_operacao: string,
  
  // Emitente (Issuer) Data
  emitente_cnpj: string,
  emitente_razao_social: string,
  emitente_nome_fantasia: string,
  emitente_inscricao_estadual: string,
  emitente_endereco: string,
  emitente_numero: string,
  emitente_bairro: string,
  emitente_municipio: string,
  emitente_uf: string,
  emitente_cep: string,
  
  // Destinatário (Recipient) Data
  destinatario_cnpj: string,
  destinatario_razao_social: string,
  destinatario_inscricao_estadual: string,
  destinatario_endereco: string,
  destinatario_numero: string,
  destinatario_bairro: string,
  destinatario_municipio: string,
  destinatario_uf: string,
  destinatario_cep: string,
  
  // Transport Data
  modalidade_frete: string,
  transportadora_cnpj: string,
  transportadora_razao_social: string,
  veiculo_placa: string,
  veiculo_uf: string,
  
  // Volume Data
  volume_quantidade: string,
  volume_especie: string,
  volume_peso_liquido: string,
  volume_peso_bruto: string,
  
  // Product Data (first product)
  produto_codigo: string,
  produto_descricao: string,
  produto_ncm: string,
  produto_quantidade: string,
  produto_unidade: string,
  produto_valor_unitario: string,
  
  // Financial Totals
  valor_total: string,
  valor_produtos: string,
  valor_frete: string,
  valor_seguro: string,
  valor_desconto: string
}
```

## Utility Functions

### Validation

```typescript
import { NSDOcsAPI } from './nsdocs.api';

// Validate NFe access key format
const isValid = NSDOcsAPI.validateChaveNFe('35250513516247000107550010000113401146202508');
console.log('Valid NFe key:', isValid); // true
```

### Formatting

```typescript
// Format CNPJ for display
const formattedCNPJ = NSDOcsAPI.formatCNPJ('13516247000107');
console.log(formattedCNPJ); // "13.516.247/0001-07"

// Format CEP for display
const formattedCEP = NSDOcsAPI.formatCEP('05223110');
console.log(formattedCEP); // "05223-110"
```

## Integration Examples

### Express.js Route

```typescript
import express from 'express';
import { fetchNFeFromNSDocs } from './nsdocs.api';

const app = express();

app.post('/api/xml/fetch-from-nsdocs', async (req, res) => {
  try {
    const { chaveNotaFiscal } = req.body;
    
    const result = await fetchNFeFromNSDocs(
      chaveNotaFiscal,
      process.env.NSDOCS_CLIENT_ID!,
      process.env.NSDOCS_CLIENT_SECRET!
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
```

### React Frontend Integration

```typescript
import { toast } from '@/hooks/use-toast';

const handleNSDocsSearch = async (chaveNFe: string) => {
  try {
    const response = await fetch('/api/xml/fetch-from-nsdocs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chaveNotaFiscal: chaveNFe })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Auto-fill form with extracted data
      setFormData(result.data);
      toast({
        title: "Sucesso",
        description: "Dados da NFe carregados automaticamente",
      });
    } else {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Erro",
      description: "Falha na comunicação com a API",
      variant: "destructive",
    });
  }
};
```

## Configuration

### Environment Variables

```bash
# Required for authentication
NSDOCS_CLIENT_ID=your-client-id
NSDOCS_CLIENT_SECRET=your-client-secret

# Optional: Custom API base URL
NSDOCS_API_URL=https://api-v3.nsdocs.com.br
```

### Custom Configuration

```typescript
const api = new NSDOcsAPI('client-id', 'client-secret');

// The API automatically handles:
// - Multiple authentication strategies
// - Endpoint discovery
// - Format detection (JSON/XML)
// - Data extraction and normalization
```

## Error Handling

The API provides specific error types for proper handling:

- `requires_api_key`: Authentication failed
- `nfe_not_found`: NFe not found in database
- `api_error`: Communication or API error
- `invalid_xml`: XML format issues

## Performance

- **Response Time**: Typically 500-1000ms
- **Caching**: Automatic token caching
- **Retry Logic**: Built-in endpoint fallbacks
- **Memory**: Minimal footprint with efficient parsing

## Testing

```typescript
// Test with a known NFe key
const testKey = '35250513516247000107550010000113401146202508';
const result = await fetchNFeFromNSDocs(testKey, clientId, clientSecret);

console.log('Test result:', result.success);
console.log('Extracted company:', result.data?.emitente_razao_social);
```

This module completely replaces the need for RPA automation while providing more reliable, faster, and maintainable NFe data retrieval.