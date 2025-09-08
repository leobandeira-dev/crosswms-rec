
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ocorrencia } from '@/types/ocorrencias.types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import OcorrenciaTimeline from './OcorrenciaTimeline';
import OcorrenciaComments from './OcorrenciaComments';
import { FileText, Link as LinkIcon, AlertCircle, PaperclipIcon } from 'lucide-react';
import NotaFiscalDetailCard from './NotaFiscalDetailCard';
import XmlViewer from './XmlViewer';
import { extractNotaFiscalData } from '@/utils/xmlExtractor';

// Mock XML para demonstração
const mockXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe Id="NFe35230612345678901234550010000012341000012345" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>00001234</cNF>
        <natOp>VENDA DE MERCADORIA</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>000001234</nNF>
        <dhEmi>2023-06-15T10:30:23-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>4</cDV>
        <tpAmb>1</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>0</indFinal>
        <indPres>9</indPres>
        <procEmi>0</procEmi>
        <verProc>DJPDV 1.0</verProc>
      </ide>
      <emit>
        <CNPJ>12345678901234</CNPJ>
        <xNome>EMPRESA EMITENTE LTDA</xNome>
        <xFant>EMPRESA EMITENTE</xFant>
        <enderEmit>
          <xLgr>RUA DO EXEMPLO</xLgr>
          <nro>123</nro>
          <xBairro>CENTRO</xBairro>
          <cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun>
          <UF>SP</UF>
          <CEP>01001000</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
          <fone>1132221111</fone>
        </enderEmit>
        <IE>123456789012</IE>
        <CRT>1</CRT>
      </emit>
      <dest>
        <CNPJ>98765432109876</CNPJ>
        <xNome>EMPRESA DESTINATARIA LTDA</xNome>
        <enderDest>
          <xLgr>AV DESTINATARIO</xLgr>
          <nro>456</nro>
          <xBairro>CENTRO</xBairro>
          <cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun>
          <UF>SP</UF>
          <CEP>04001000</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
          <fone>1133334444</fone>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>987654321098</IE>
      </dest>
      <total>
        <ICMSTot>
          <vBC>0.00</vBC>
          <vICMS>0.00</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCPUFDest>0.00</vFCPUFDest>
          <vICMSUFDest>0.00</vICMSUFDest>
          <vICMSUFRemet>0.00</vICMSUFRemet>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>1000.00</vProd>
          <vFrete>50.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>0.00</vPIS>
          <vCOFINS>0.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>1050.00</vNF>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>0</modFrete>
        <vol>
          <qVol>10</qVol>
          <esp>CAIXA</esp>
          <marca>MARCA</marca>
          <pesoL>100.000</pesoL>
          <pesoB>110.000</pesoB>
        </vol>
      </transp>
      <infAdic>
        <infCpl>Nota fiscal de exemplo. Pedido 12345-ABC. Informações complementares da nota fiscal.</infCpl>
      </infAdic>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>1</tpAmb>
      <verAplic>SEFAZ-SP</verAplic>
      <chNFe>35230612345678901234550010000012341000012345</chNFe>
      <dhRecbto>2023-06-15T10:30:23-03:00</dhRecbto>
      <nProt>123456789012345</nProt>
      <digVal>aB12cD34eF56gH78iJ90</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;

interface OcorrenciaDetailDialogProps {
  ocorrencia: Ocorrencia;
  onClose: () => void;
  onLinkDocument: (ocorrencia: Ocorrencia) => void;
}

const OcorrenciaDetailDialog: React.FC<OcorrenciaDetailDialogProps> = ({ 
  ocorrencia, 
  onClose, 
  onLinkDocument
}) => {
  const [activeTab, setActiveTab] = useState('detalhes');
  const [showXml, setShowXml] = useState(false);

  // Em um sistema real, nós buscaríamos esses dados do backend
  // Usando o extractNotaFiscalData para demonstrar o funcionamento
  const mockXmlObj = {
    nfeProc: {
      NFe: {
        infNFe: {
          ide: {
            nNF: "000001234",
            serie: "1",
            dhEmi: "2023-06-15T10:30:23-03:00",
            tpNF: "1"
          },
          emit: {
            CNPJ: "12345678901234",
            xNome: "EMPRESA EMITENTE LTDA",
            enderEmit: {
              xLgr: "RUA DO EXEMPLO",
              nro: "123",
              xBairro: "CENTRO",
              xMun: "SAO PAULO",
              UF: "SP",
              CEP: "01001000",
              fone: "1132221111"
            }
          },
          dest: {
            CNPJ: "98765432109876",
            xNome: "EMPRESA DESTINATARIA LTDA",
            enderDest: {
              xLgr: "AV DESTINATARIO",
              nro: "456",
              xBairro: "CENTRO",
              xMun: "SAO PAULO",
              UF: "SP",
              CEP: "04001000",
              fone: "1133334444"
            }
          },
          total: {
            ICMSTot: {
              vNF: "1050.00"
            }
          },
          transp: {
            vol: {
              qVol: "10",
              pesoB: "110.000"
            }
          },
          infAdic: {
            infCpl: "Nota fiscal de exemplo. Pedido 12345-ABC. Informações complementares da nota fiscal."
          }
        }
      },
      protNFe: {
        infProt: {
          chNFe: "35230612345678901234550010000012341000012345"
        }
      }
    }
  };

  const notaFiscalData = {
    ...extractNotaFiscalData(mockXmlObj),
    // Dados adicionais preenchidos manualmente que não estão no XML
    numeroColeta: "COL-12345",
    valorColeta: "150.00",
    numeroCTeColeta: "57230612345678901234",
    numeroCTeViagem: "57230687654321098765",
    responsavelEntrega: "Transportadora ABC",
    motorista: "João da Silva",
    dataEmbarque: "2023-06-17T08:15:00"
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <div className="flex items-center">
            Ocorrência #{ocorrencia.id}
            <StatusBadge status={ocorrencia.status} className="ml-3" />
            <PriorityBadge priority={ocorrencia.priority} className="ml-2" />
          </div>
        </DialogTitle>
        <DialogDescription>
          {ocorrencia.title} - Registro em {new Date(ocorrencia.createdAt).toLocaleDateString()}
        </DialogDescription>
      </DialogHeader>

      {showXml ? (
        <>
          <XmlViewer xmlContent={mockXmlContent} title="XML da Nota Fiscal" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowXml(false)}>
              Voltar
            </Button>
          </DialogFooter>
        </>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              <TabsTrigger value="notafiscal">Nota Fiscal</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="comentarios">Comentários</TabsTrigger>
            </TabsList>
            
            <TabsContent value="detalhes" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Cliente</h3>
                  <p className="text-sm text-muted-foreground">{ocorrencia.client}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Tipo de Ocorrência</h3>
                  <p className="text-sm text-muted-foreground">{ocorrencia.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <StatusBadge status={ocorrencia.status} />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Prioridade</h3>
                  <PriorityBadge priority={ocorrencia.priority} />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Data de Abertura</h3>
                  <p className="text-sm text-muted-foreground">{new Date(ocorrencia.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Responsável</h3>
                  <p className="text-sm text-muted-foreground">{ocorrencia.assignedTo || 'Não atribuído'}</p>
                </div>
                {ocorrencia.documents?.length > 0 && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium">Documentos Vinculados</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {ocorrencia.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center text-sm p-1 px-3 bg-muted rounded-full">
                          <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                          {doc.type} #{doc.number}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium">Descrição</h3>
                <p className="text-sm text-muted-foreground mt-1">{ocorrencia.description}</p>
              </div>
              
              {ocorrencia.solution && (
                <div>
                  <h3 className="text-sm font-medium">Solução</h3>
                  <p className="text-sm text-muted-foreground mt-1">{ocorrencia.solution}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="notafiscal" className="py-4">
              <NotaFiscalDetailCard 
                notaFiscalData={notaFiscalData} 
                xmlContent={mockXmlContent} 
                onViewXml={() => setShowXml(true)}
                onViewDanfe={() => window.alert('Visualização do DANFE não implementada')}
                onDownload={() => window.alert('Download não implementado')}
              />
            </TabsContent>
            
            <TabsContent value="timeline" className="py-4">
              <OcorrenciaTimeline ocorrencia={ocorrencia} />
            </TabsContent>
            
            <TabsContent value="comentarios" className="py-4">
              <OcorrenciaComments ocorrenciaId={ocorrencia.id} />
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              className="flex items-center"
              onClick={() => onLinkDocument(ocorrencia)}
            >
              <LinkIcon className="mr-2 h-4 w-4" /> Vincular Documento
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Fechar</Button>
              <Button type="button" onClick={() => window.alert('Ação não implementada')}>
                Atualizar
              </Button>
            </div>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  );
};

export default OcorrenciaDetailDialog;
