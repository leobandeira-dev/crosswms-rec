import * as XLSX from 'xlsx';

export interface DangerousGoodsRecord {
  numeroONU: string;
  nomeShipping: string;
  nomeTecnico: string;
  classeRisco: string;
  numeroRisco: string;
  grupoEmbalagem: string;
  quantidadeIsenta: string;
  observacoes: string;
  categoria: string;
}

export class ExcelService {
  // Create and download Excel template with comprehensive dangerous goods data
  static downloadTemplate() {
    const templateData = [
      [
        'Número ONU',
        'Nome Shipping', 
        'Nome Técnico',
        'Classe de Risco',
        'Número de Risco',
        'Grupo Embalagem',
        'Quantidade Isenta',
        'Observações',
        'Categoria'
      ],
      // Comprehensive dangerous goods database
      ['1090', 'ACETONE', 'Acetona', '3', '30', 'II', '5L', 'Líquido inflamável', 'Solvente'],
      ['1203', 'GASOLINE', 'Gasolina', '3', '33', 'II', '1L', 'Motor spirit, Petrol', 'Combustível'],
      ['1219', 'ISOPROPANOL', 'Álcool isopropílico', '3', '30', 'II', '1L', 'Solução', 'Álcool'],
      ['1230', 'METHANOL', 'Metanol', '3', '336', 'II', '1L', 'Álcool metílico', 'Álcool'],
      ['1263', 'PAINT', 'Tinta', '3', '30', 'II', '5L', 'Tinta para pintura', 'Tinta'],
      ['1267', 'PETROLEUM CRUDE OIL', 'Petróleo bruto', '3', '30', 'I', '0L', 'Óleo cru', 'Petróleo'],
      ['1760', 'CORROSIVE LIQUID, N.O.S.', 'Líquido corrosivo N.E.', '8', '80', 'III', '5L', 'Contém ácidos diversos', 'Corrosivo'],
      ['1789', 'HYDROCHLORIC ACID', 'Ácido clorídrico', '8', '80', 'II', '1L', 'Solução ácida', 'Ácido'],
      ['1791', 'HYPOCHLORITE SOLUTION', 'Solução de hipoclorito', '8', '80', 'III', '5L', 'Agente branqueador', 'Oxidante'],
      ['1824', 'SODIUM HYDROXIDE SOLUTION', 'Solução de hidróxido de sódio', '8', '80', 'II', '1L', 'Soda cáustica', 'Base'],
      ['1830', 'SULPHURIC ACID', 'Ácido sulfúrico', '8', '80', 'II', '1L', 'Ácido concentrado', 'Ácido'],
      ['1888', 'CHLOROFORM', 'Clorofórmio', '6.1', '60', 'III', '5L', 'Solvente halogenado', 'Solvente'],
      ['1993', 'FLAMMABLE LIQUID, N.O.S.', 'Líquido inflamável N.E.', '3', '30', 'III', '5L', 'Líquido combustível', 'Inflamável'],
      ['2024', 'MERCURY COMPOUND, LIQUID, N.O.S.', 'Composto de mercúrio líquido', '6.1', '60', 'III', '5L', 'Contém mercúrio', 'Tóxico'],
      ['2031', 'NITRIC ACID', 'Ácido nítrico', '8', '856', 'II', '1L', 'Ácido oxidante', 'Ácido'],
      ['2209', 'FORMALDEHYDE SOLUTION', 'Solução de formaldeído', '8', '80', 'III', '5L', 'Conservante', 'Aldeído'],
      ['2218', 'ACRYLIC ACID', 'Ácido acrílico', '8', '89', 'II', '1L', 'Monômero', 'Ácido'],
      ['2319', 'TERPENE HYDROCARBONS, N.O.S.', 'Hidrocarbonetos terpênicos', '3', '30', 'III', '5L', 'Derivados de pinho', 'Hidrocarboneto'],
      ['2336', 'ALLYL FORMATE', 'Formiato de alila', '3', '336', 'I', '0L', 'Éster alílico', 'Éster'],
      ['2357', 'CYCLOHEXYLAMINE', 'Ciclo-hexilamina', '8', '83', 'II', '1L', 'Amina cíclica', 'Amina'],
      ['2617', 'METHYLCYCLOHEXANOLS', 'Metilciclo-hexanóis', '3', '30', 'III', '5L', 'Álcool cíclico', 'Álcool'],
      ['2735', 'AMINES, LIQUID, CORROSIVE, N.O.S.', 'Aminas líquidas corrosivas', '8', '83', 'II', '1L', 'Aminas diversas', 'Amina'],
      ['2789', 'ACETIC ACID, GLACIAL', 'Ácido acético glacial', '8', '80', 'II', '1L', 'Ácido concentrado', 'Ácido'],
      ['2810', 'TOXIC LIQUID, ORGANIC, N.O.S.', 'Líquido tóxico orgânico', '6.1', '60', 'III', '5L', 'Substância orgânica tóxica', 'Tóxico'],
      ['2924', 'FLAMMABLE LIQUID, CORROSIVE, N.O.S.', 'Líquido inflamável corrosivo', '3', '83', 'II', '1L', 'Duplo risco', 'Misto'],
      ['3082', 'ENVIRONMENTALLY HAZARDOUS SUBSTANCE, LIQUID, N.O.S.', 'Substância perigosa ao meio ambiente', '9', '90', 'III', '5L', 'Poluente marinho', 'Ambiental'],
      ['3264', 'CORROSIVE LIQUID, ACIDIC, INORGANIC, N.O.S.', 'Líquido corrosivo ácido inorgânico', '8', '80', 'II', '1L', 'Ácido inorgânico', 'Ácido'],
      ['3265', 'CORROSIVE LIQUID, ACIDIC, ORGANIC, N.O.S.', 'Líquido corrosivo ácido orgânico', '8', '80', 'III', '5L', 'Ácido orgânico', 'Ácido'],
      ['3266', 'CORROSIVE LIQUID, BASIC, INORGANIC, N.O.S.', 'Líquido corrosivo básico inorgânico', '8', '80', 'II', '1L', 'Base inorgânica', 'Base'],
      ['3267', 'CORROSIVE LIQUID, BASIC, ORGANIC, N.O.S.', 'Líquido corrosivo básico orgânico', '8', '80', 'III', '5L', 'Base orgânica', 'Base'],
      ['3289', 'TOXIC LIQUID, INORGANIC, N.O.S.', 'Líquido tóxico inorgânico', '6.1', '60', 'II', '1L', 'Substância inorgânica tóxica', 'Tóxico'],
      ['3290', 'TOXIC SOLID, INORGANIC, N.O.S.', 'Sólido tóxico inorgânico', '6.1', '60', 'III', '5kg', 'Substância sólida tóxica', 'Tóxico'],
      ['3291', 'CLINICAL WASTE, UNSPECIFIED, N.O.S.', 'Resíduo clínico não especificado', '6.2', '60', 'II', '0kg', 'Material infectante', 'Biológico'],
      ['3316', 'CHEMICAL KIT', 'Kit químico', '9', '90', 'II', '1L', 'Conjunto de produtos químicos', 'Misto'],
      ['3334', 'AVIATION REGULATED LIQUID, N.O.S.', 'Líquido regulamentado para aviação', '9', '90', 'III', '0.5L', 'Restrito para transporte aéreo', 'Regulamentado'],
      ['3335', 'AVIATION REGULATED SOLID, N.O.S.', 'Sólido regulamentado para aviação', '9', '90', 'III', '1kg', 'Restrito para transporte aéreo', 'Regulamentado'],
      ['3429', 'CHLORATES, INORGANIC, N.O.S.', 'Cloratos inorgânicos', '5.1', '50', 'II', '1kg', 'Agente oxidante', 'Oxidante'],
      ['3480', 'LITHIUM ION BATTERIES', 'Baterias de íon lítio', '9', '90', 'II', '0kg', 'Bateria recarregável', 'Eletrônico'],
      ['3481', 'LITHIUM ION BATTERIES CONTAINED IN EQUIPMENT', 'Baterias de íon lítio em equipamentos', '9', '90', 'II', '0kg', 'Bateria em dispositivo', 'Eletrônico'],
      ['3507', 'URANIUM HEXAFLUORIDE, RADIOACTIVE MATERIAL', 'Hexafluoreto de urânio radioativo', '8', '885', 'I', '0kg', 'Material radioativo corrosivo', 'Radioativo'],
      ['3509', 'PACKAGINGS, DISCARDED, EMPTY, UNCLEANED', 'Embalagens vazias não limpas', '9', '90', 'III', '0kg', 'Embalagens contaminadas', 'Resíduo']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Número ONU
      { wch: 30 }, // Nome Shipping
      { wch: 25 }, // Nome Técnico
      { wch: 15 }, // Classe de Risco
      { wch: 15 }, // Número de Risco
      { wch: 15 }, // Grupo Embalagem
      { wch: 15 }, // Quantidade Isenta
      { wch: 30 }, // Observações
      { wch: 15 }  // Categoria
    ];

    // Style header row
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1:I1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "FFCCCCCC" } },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" }
        }
      };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produtos Perigosos');

    // Download file
    XLSX.writeFile(wb, 'template_produtos_perigosos.xlsx');
  }

  // Export current database to Excel
  static exportDatabase(data: DangerousGoodsRecord[]) {
    const exportData = [
      [
        'Número ONU',
        'Nome Shipping', 
        'Nome Técnico',
        'Classe de Risco',
        'Número de Risco',
        'Grupo Embalagem',
        'Quantidade Isenta',
        'Observações',
        'Categoria'
      ],
      ...data.map(record => [
        record.numeroONU,
        record.nomeShipping,
        record.nomeTecnico,
        record.classeRisco,
        record.numeroRisco,
        record.grupoEmbalagem,
        record.quantidadeIsenta,
        record.observacoes,
        record.categoria
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(exportData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 15 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Base Produtos Perigosos');

    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `base_produtos_perigosos_${today}.xlsx`);
  }

  // Parse uploaded Excel file
  static async parseExcelFile(file: File): Promise<DangerousGoodsRecord[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Skip header row and map to our interface
          const records: DangerousGoodsRecord[] = [];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            
            if (row.length >= 6 && row[0]) { // Ensure we have data and ONU number
              records.push({
                numeroONU: String(row[0] || '').trim(),
                nomeShipping: String(row[1] || '').trim(),
                nomeTecnico: String(row[2] || '').trim(),
                classeRisco: String(row[3] || '').trim(),
                numeroRisco: String(row[4] || '').trim(),
                grupoEmbalagem: String(row[5] || '').trim(),
                quantidadeIsenta: String(row[6] || '').trim(),
                observacoes: String(row[7] || '').trim(),
                categoria: String(row[8] || '').trim()
              });
            }
          }
          
          resolve(records);
        } catch (error) {
          console.error('Excel parse error:', error);
          reject(new Error('Erro ao processar arquivo Excel: ' + error));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  // Validate dangerous goods record
  static validateRecord(record: DangerousGoodsRecord): string[] {
    const errors: string[] = [];
    
    if (!record.numeroONU) {
      errors.push('Número ONU é obrigatório');
    } else if (!/^\d{4}$/.test(record.numeroONU)) {
      errors.push('Número ONU deve ter 4 dígitos');
    }
    
    if (!record.nomeShipping) {
      errors.push('Nome Shipping é obrigatório');
    }
    
    if (!record.nomeTecnico) {
      errors.push('Nome Técnico é obrigatório');
    }
    
    if (!record.classeRisco) {
      errors.push('Classe de Risco é obrigatória');
    } else if (!/^[1-9](\.\d)?$/.test(record.classeRisco)) {
      errors.push('Classe de Risco deve ser entre 1-9 (ex: 3, 4.1, 6.1)');
    }
    
    return errors;
  }

  // Generate shipment report
  static exportShipmentReport(shipments: any[]) {
    const reportData = [
      [
        'Nota Fiscal',
        'Data Embarque',
        'Remetente CNPJ',
        'Remetente Razão Social',
        'Remetente Endereço',
        'Destinatário CNPJ',
        'Destinatário Razão Social',
        'Destinatário Endereço',
        'ONU',
        'Produto',
        'Classe Risco',
        'Número Risco',
        'Quantidade',
        'Peso',
        'Status',
        'Transportadora'
      ]
    ];

    shipments.forEach(shipment => {
      shipment.produtos.forEach((produto: any) => {
        reportData.push([
          shipment.notaFiscal,
          shipment.dataEmbarque,
          shipment.remetente.cnpj,
          shipment.remetente.razaoSocial,
          shipment.remetente.endereco,
          shipment.destinatario.cnpj,
          shipment.destinatario.razaoSocial,
          shipment.destinatario.endereco,
          produto.numeroONU,
          produto.nomeTecnico,
          produto.classeRisco,
          produto.numeroRisco,
          produto.quantidade,
          produto.peso,
          shipment.status,
          shipment.transportadora
        ]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(reportData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 25 }, { wch: 35 },
      { wch: 18 }, { wch: 25 }, { wch: 35 }, { wch: 8 }, { wch: 25 },
      { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 20 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Embarques Produtos Perigosos');

    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `relatorio_embarques_produtos_perigosos_${today}.xlsx`);
  }
}