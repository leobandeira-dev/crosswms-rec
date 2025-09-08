import { useState, useRef, useEffect, useCallback } from 'react'
import QRCode from 'qrcode'
import { useLocation } from 'wouter'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { useToast } from '@/hooks/use-toast'
import EnhancedButton from '@/components/ui/enhanced-button'
import { EnhancedInput } from '@/components/ui/enhanced-input'
import TransulLogo from '@/components/TransulLogo'
import TopNavbar from '@/components/layout/TopNavbar'
import { 
  Package, 
  QrCode, 
  Printer, 
  Filter, 
  Search, 
  MoreHorizontal,
  Eye,
  FileText,
  Trash2,
  Settings,
  Download,
  RefreshCw,
  Link
} from 'lucide-react'

interface VolumeData {
  codigo: string
  notaFiscal: string
  volume: string
  numeroVolume?: number
  totalVolumes?: number
  tipo: string
  area: string
  quantidade: number
  status: 'Pendente' | 'Gerada' | 'Impressa' | 'Processada'
  dataGeracao: string
  numeroONU?: string
  classeRisco?: string
  numeroRisco?: string
  grupoEmbalagem?: string
  nomeProdutoPerigoso?: string
}

interface EtiquetaTemplate {
  id: string
  nome: string
  formato: string
  layout: string
  preview: string
}

const GeracaoEtiquetas = () => {
  const [location, setLocation] = useLocation()
  const { toast: toastHook } = useToast()
  const [activeTab, setActiveTab] = useState('volumes')
  const [selectedArea, setSelectedArea] = useState('Área 01')
  const [selectedTipo, setSelectedTipo] = useState('Carga Geral')
  const [selectedFormato, setSelectedFormato] = useState('100x150mm')
  const [selectedLayout, setSelectedLayout] = useState('alta-legibilidade-contraste')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [volumesStatus, setVolumesStatus] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [codigoONU, setCodigoONU] = useState('')
  const [codigoRisco, setCodigoRisco] = useState('')
  const [classificacao, setClassificacao] = useState('cargas-nao-classificadas')
  const [produtoPerigoso, setProdutoPerigoso] = useState<any>(null)
  const [nomeTecnico, setNomeTecnico] = useState('')
  const [classe, setClasse] = useState('')
  const [notaFiscal, setNotaFiscal] = useState('')
  const [numeroVolume, setNumeroVolume] = useState('001')
  const [qrCodeDataURL, setQrCodeDataURL] = useState('')
  const [xmlData, setXmlData] = useState<any>(null)
  const [currentNotaVolumes, setCurrentNotaVolumes] = useState<any[]>([])
  const [notaFiscalData, setNotaFiscalData] = useState<any>(null)
  
  // Individual volume classification state
  const [classificationDialogOpen, setClassificationDialogOpen] = useState(false)
  const [selectedVolumeForClassification, setSelectedVolumeForClassification] = useState<string>('')
  const [volumeClassifications, setVolumeClassifications] = useState<Record<string, {
    tipo: string
    codigoONU?: string
    codigoRisco?: string
    nomeTecnico?: string
    classe?: string
    classificacao?: string
  }>>({})
  
  // Individual volume classification form state
  const [volumeTipo, setVolumeTipo] = useState('')
  const [volumeCodigoONU, setVolumeCodigoONU] = useState('')
  const [volumeCodigoRisco, setVolumeCodigoRisco] = useState('')
  const [volumeNomeTecnico, setVolumeNomeTecnico] = useState('')
  const [volumeClasse, setVolumeClasse] = useState('')
  const [volumeClassificacao, setVolumeClassificacao] = useState('')
  
  // Editable fields for peso total and quantidade de volumes
  const [pesoTotal, setPesoTotal] = useState('')
  const [quantidadeVolumes, setQuantidadeVolumes] = useState('')

  // Mix tab state variables
  const [mixEtiquetaConfig, setMixEtiquetaConfig] = useState({
    descricao: '',
    tipo: 'Geral (Volumes)',
    layout: 'Etiqueta 50x100mm',
    formato: 'Etiqueta 50x100mm',
    previewLayout: 'Alta Legibilidade (Texto Grande)',
    numeroEtiqueta: '123456'
  })
  
  const [mixSearchTerm, setMixSearchTerm] = useState('')
  const [mixEtiquetasList, setMixEtiquetasList] = useState([
    {
      id: 'ETQM-174960020959',
      descricao: 'Etiqueta Mãe',
      tipo: 'Geral',
      volumes: 3,
      pesoTotal: '48.600',
      cidadeDestino: 'SÃO PAULO',
      ufDestino: 'SP',
      volumesVinculados: ['NF001-001-001', 'NF001-002-001', 'NF001-003-001'],
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      status: 'Ativa'
    },
    {
      id: 'ETQM-174960020958',
      descricao: 'Etiqueta Mãe Palete',
      tipo: 'Palete',
      volumes: 5,
      pesoTotal: '120.350',
      cidadeDestino: 'RIO DE JANEIRO',
      ufDestino: 'RJ',
      volumesVinculados: ['NF002-001-001', 'NF002-002-001', 'NF002-003-001', 'NF002-004-001', 'NF002-005-001'],
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      status: 'Ativa'
    }
  ])

  // Dialog states for Mix actions
  const [viewMixDialogOpen, setViewMixDialogOpen] = useState(false)
  const [linkVolumesDialogOpen, setLinkVolumesDialogOpen] = useState(false)
  const [selectedMixEtiqueta, setSelectedMixEtiqueta] = useState<any>(null)
  const [availableVolumesForLink, setAvailableVolumesForLink] = useState<VolumeData[]>([])
  const [selectedVolumesForLink, setSelectedVolumesForLink] = useState<string[]>([])

  // Function to generate volumes based on current settings
  const generateVolumes = (numeroNota: string, quantidade: number) => {
    const volumes = []
    
    for (let i = 1; i <= quantidade; i++) {
      // Use the same format as generateVolumeId for consistency
      const volumeCode = generateVolumeId(numeroNota, i, quantidade)
      volumes.push({
        codigo: volumeCode,
        notaFiscal: numeroNota,
        volume: `${i}/${quantidade}`,
        numeroVolume: i,
        totalVolumes: quantidade,
        tipo: 'Carga Geral',
        area: '01',
        quantidade: 1,
        status: 'Pendente',
        dataGeracao: new Date().toLocaleDateString('pt-BR')
      })
    }
    
    console.log('GeracaoEtiquetas: Volumes gerados:', volumes)
    return volumes
  }

  // Save volumes to database
  const saveVolumesToDatabase = async (volumes: any[], notaFiscalData: any) => {
    try {
      console.log('Salvando volumes na base de dados:', volumes.length)
      
      // First ensure the nota fiscal exists in database
      const notaFiscalPayload = {
        chave_nota_fiscal: notaFiscalData?.chave_nota_fiscal || notaFiscalData?.chave_acesso,
        numero_nota: notaFiscalData?.numero_nota || volumes[0]?.notaFiscal,
        emitente_razao_social: notaFiscalData?.emitente_razao_social || 'EMITENTE',
        destinatario_razao_social: notaFiscalData?.destinatario_razao_social || 'DESTINATÁRIO',
        valor_nota_fiscal: notaFiscalData?.valor_total || '0',
        peso_bruto: notaFiscalData?.peso_bruto || pesoTotal || '0',
        quantidade_volumes: volumes.length.toString(),
        empresa_id: JSON.parse(localStorage.getItem('user') || '{}')?.empresa_id
      }

      const notaResponse = await fetch('/api/notas-fiscais', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(notaFiscalPayload)
      })

      const notaResult = await notaResponse.json()
      console.log('Nota fiscal salva/verificada:', notaResult)

      // Now save volumes with the nota fiscal ID
      const volumesPayload = {
        nota_fiscal_id: notaResult.id,
        empresa_id: notaFiscalPayload.empresa_id,
        volumes: volumes.map(vol => ({
          codigo_etiqueta: vol.codigo,
          altura: vol.altura || 0,
          largura: vol.largura || 0,
          comprimento: vol.comprimento || 0,
          peso: vol.peso || parseFloat(pesoTotal || '0') / volumes.length,
          volume_m3: vol.volume_m3 || 0,
          descricao: `Volume ${vol.numeroVolume}`,
          status: 'recebido',
          fragil: vol.fragil || false,
          perigoso: vol.perigoso || selectedTipo === 'Produto Perigoso'
        }))
      }

      const volumesResponse = await fetch('/api/volumes/dimensoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(volumesPayload)
      })

      const volumesResult = await volumesResponse.json()
      console.log('Volumes salvos na base de dados:', volumesResult)

      return volumesResult.success
    } catch (error) {
      console.error('Erro ao salvar volumes na base de dados:', error)
      return false
    }
  }

  // Check and update existing volumes from database
  const checkAndUpdateExistingVolumes = async (numeroNota: string, generatedVolumes: any[]) => {
    try {
      const response = await fetch(`/api/volumes/nota/${numeroNota}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.volumes && data.volumes.rows && data.volumes.rows.length > 0) {
          console.log('Volumes existentes encontrados na base:', data.volumes.rows)
          
          // Update generated volumes with existing codes from database
          const updatedVolumes = generatedVolumes.map((vol, index) => {
            const existingVolume = data.volumes.rows[index]
            if (existingVolume) {
              return {
                ...vol,
                codigo: existingVolume.codigo_etiqueta, // Use existing code from database
                status: existingVolume.status || 'Pendente'
              }
            }
            return vol
          })
          
          setCurrentNotaVolumes(updatedVolumes)
          console.log('Volumes atualizados com códigos da base:', updatedVolumes)
        }
      }
    } catch (error) {
      console.error('Erro ao verificar volumes existentes:', error)
    }
  }

  // Load nota fiscal data from URL parameters or sessionStorage on component mount
  useEffect(() => {
    console.log('GeracaoEtiquetas: useEffect executado')
    console.log('GeracaoEtiquetas: window.location.search:', window.location.search)
    
    // Primeiro priorizar parâmetros URL (vindos do botão "Etiqueta" na ordem de carregamento)
    const urlParams = new URLSearchParams(window.location.search)
    console.log('GeracaoEtiquetas: URLSearchParams criado:', urlParams.toString())
    
    const chaveNota = urlParams.get('chave_nota')
    const numeroNota = urlParams.get('numero_nota')
    const emitente = urlParams.get('emitente')
    const destinatario = urlParams.get('destinatario')
    const volumes = urlParams.get('volumes')
    const numeroPedido = urlParams.get('numero_pedido')
    const pesoTotal = urlParams.get('peso_total')

    console.log('GeracaoEtiquetas: Parâmetros extraídos:', {
      chaveNota, numeroNota, emitente, destinatario, volumes, numeroPedido, pesoTotal
    })

    if (numeroNota) { // Mudança: só precisa do numero_nota, chave_nota é opcional
      console.log('GeracaoEtiquetas: Processando dados da URL')
      
      // Criar objeto com dados dos parâmetros URL
      const dataFromURL = {
        chave_nota_fiscal: chaveNota,
        numero_nota: numeroNota,
        emitente_razao_social: emitente,
        destinatario_razao_social: destinatario,
        quantidade_volumes: volumes || '1',
        numero_pedido: numeroPedido || numeroNota,
        peso_bruto: pesoTotal || '0'
      }
      
      console.log('GeracaoEtiquetas: Dados estruturados da URL:', dataFromURL)
      
      setNotaFiscalData(dataFromURL)
      setNotaFiscal(numeroNota)
      setPesoTotal(pesoTotal || '0')
      setQuantidadeVolumes(volumes || '1')
      
      // Generate initial volumes
      const quantidadeVolumes = parseInt(volumes || '1')
      const volumesGerados = generateVolumes(numeroNota, quantidadeVolumes)
      setCurrentNotaVolumes(volumesGerados)
      
      // Check if volumes exist in database and update codes accordingly
      checkAndUpdateExistingVolumes(numeroNota, volumesGerados)
      
      console.log('GeracaoEtiquetas: Dados carregados via URL:', dataFromURL)
      console.log('GeracaoEtiquetas: Volumes gerados:', volumesGerados)
      return
    } else {
      console.log('GeracaoEtiquetas: Parâmetros URL incompletos, tentando sessionStorage')
    }

    // Fallback para sessionStorage se não houver parâmetros URL
    const storedData = sessionStorage.getItem('notaFiscalData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setNotaFiscalData(data)
        setNotaFiscal(data.numero_nota || '')
        setPesoTotal(data.peso_bruto || '')
        setQuantidadeVolumes(data.quantidade_volumes || '')
        
        // Generate initial volumes
        const quantidadeVolumes = parseInt(data.quantidade_volumes) || 1
        const volumes = generateVolumes(data.numero_nota, quantidadeVolumes)
        setCurrentNotaVolumes(volumes)
        
        // Check if volumes exist in database and update codes accordingly
        checkAndUpdateExistingVolumes(data.numero_nota, volumes)
        
        console.log('Dados carregados via sessionStorage:', data)
      } catch (error) {
        console.error('Error parsing nota fiscal data:', error)
      }
    }
  }, [])

  // Watch for changes in quantidade de volumes and regenerate volumes
  useEffect(() => {
    if (notaFiscalData && quantidadeVolumes && parseInt(quantidadeVolumes) > 0) {
      const quantidade = parseInt(quantidadeVolumes)
      // Only generate new volumes if none exist yet
      if (currentNotaVolumes.length === 0) {
        const volumes = generateVolumes(notaFiscalData.numero_nota, quantidade)
        setCurrentNotaVolumes(volumes)
        // Check if volumes exist in database and update codes accordingly
        checkAndUpdateExistingVolumes(notaFiscalData.numero_nota, volumes)
      }
      // Clear selected volumes when regenerating
      setSelectedVolumes([])
    }
  }, [quantidadeVolumes, notaFiscalData])
  
  // Function to generate volume ID with new format: NF{NUMERO_NOTA}-VOLUME-DATA-HORA+MINUTOS (São Paulo time)
  const generateVolumeId = (baseId: string, volumeNumber: number, totalVolumes: number) => {
    // Usar Intl API para horário correto de São Paulo
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    
    const parts = formatter.formatToParts(now)
    const day = parts.find(p => p.type === 'day')?.value || '01'
    const month = parts.find(p => p.type === 'month')?.value || '01'
    const year = parts.find(p => p.type === 'year')?.value || '2025'
    const hours = parts.find(p => p.type === 'hour')?.value || '00'
    const minutes = parts.find(p => p.type === 'minute')?.value || '00'
    
    const volumeStr = String(volumeNumber).padStart(3, '0')
    const dateTimeStr = `${day}${month}${year}-${hours}${minutes}`
    
    // New format: NF{NUMERO_NOTA}-VOLUME-DATA-HORA+MINUTOS (São Paulo time)
    // Example: NF111007-001-11082025-2313
    return `NF${baseId}-${volumeStr}-${dateTimeStr}`
  }

  // Base de dados de produtos perigosos - atualizada conforme ANTT
  const produtosPerigososBD = [
    { onu: '0103', produto: 'ACENDEDOR DE ESTOPIM, tubular, com revestimento metálico', classeRisco: '1.4G', numeroRisco: '', grupoEmbalagem: '', quantidadeIsenta: 500 },
    { onu: '0121', produto: 'ACENDEDORES', classeRisco: '1.1G', numeroRisco: '', grupoEmbalagem: '', quantidadeIsenta: 50 },
    { onu: '0131', produto: 'ACENDEDOR DE ESTOPIM', classeRisco: '1.4S', numeroRisco: '', grupoEmbalagem: '', quantidadeIsenta: 1000 },
    { onu: '0314', produto: 'ACENDEDORES', classeRisco: '1.2G', numeroRisco: '', grupoEmbalagem: '', quantidadeIsenta: 50 },
    { onu: '0315', produto: 'ACENDEDORES', classeRisco: '1.3G', numeroRisco: '', grupoEmbalagem: '', quantidadeIsenta: 50 },
    { onu: '0325', produto: 'ACENDEDORES', classeRisco: '1.4G', numeroRisco: '', grupoEmbalagem: '', quantidadeIsenta: 500 },
    { onu: '0454', produto: 'ACENDEDORES', classeRisco: '1.4S', numeroRisco: '', grupoEmbalagem: '', quantidadeIsenta: 1000 },
    { onu: '1001', produto: 'ACETILENO, DISSOLVIDO', classeRisco: '2.1', numeroRisco: '', grupoEmbalagem: '', quantidadeIsenta: 333 },
    { onu: '1088', produto: 'ACETAL', classeRisco: '3', numeroRisco: '33', grupoEmbalagem: 'II', quantidadeIsenta: 333 },
    { onu: '1089', produto: 'ACETALDEÍDO', classeRisco: '3', numeroRisco: '33', grupoEmbalagem: 'I', quantidadeIsenta: 333 },
    { onu: '1090', produto: 'ACETONA', classeRisco: '3', numeroRisco: '33', grupoEmbalagem: 'II', quantidadeIsenta: 50 },
    { onu: '1104', produto: 'ACETATO(S) DE AMILA', classeRisco: '3', numeroRisco: '30', grupoEmbalagem: 'III', quantidadeIsenta: 500 },
    { onu: '1123', produto: 'ACETATO(S) DE BUTILA', classeRisco: '3', numeroRisco: '33', grupoEmbalagem: 'II', quantidadeIsenta: 333 },
    { onu: '1172', produto: 'ACETATO DE ÉTER MONOETÍLICO DE ETILENOGLICOL', classeRisco: '3', numeroRisco: '30', grupoEmbalagem: 'III', quantidadeIsenta: 500 },
    { onu: '1173', produto: 'ACETATO DE ETILA', classeRisco: '3', numeroRisco: '33', grupoEmbalagem: 'II', quantidadeIsenta: 333 },
    { onu: '1177', produto: 'ACETATO DE ETILBUTILA', classeRisco: '3', numeroRisco: '30', grupoEmbalagem: 'III', quantidadeIsenta: 500 },
    { onu: '1189', produto: 'ACETATO DE ÉTER MONOMETÍLICO DE ETILENOGLICOL', classeRisco: '3', numeroRisco: '30', grupoEmbalagem: 'III', quantidadeIsenta: 500 },
    { onu: '1213', produto: 'ACETATO DE ISOBUTILA', classeRisco: '3', numeroRisco: '33', grupoEmbalagem: 'II', quantidadeIsenta: 333 },
    { onu: '1220', produto: 'ACETATO DE ISOPROPILA', classeRisco: '3', numeroRisco: '33', grupoEmbalagem: 'II', quantidadeIsenta: 333 },
    { onu: '1231', produto: 'ACETATO DE METILA', classeRisco: '3', numeroRisco: '33', grupoEmbalagem: 'II', quantidadeIsenta: 333 },
    { onu: '1233', produto: 'ACETATO DE METILAMILA', classeRisco: '3', numeroRisco: '30', grupoEmbalagem: 'III', quantidadeIsenta: 500 },
    { onu: '1276', produto: 'ACETATO DE n-PROPILA', classeRisco: '3', numeroRisco: '33', grupoEmbalagem: 'II', quantidadeIsenta: 333 },
    { onu: '1301', produto: 'ACETATO DE VINILA, INIBIDO', classeRisco: '3', numeroRisco: '339', grupoEmbalagem: 'II', quantidadeIsenta: 333 },
    { onu: '1541', produto: 'ACETONA-CIANIDRINA, ESTABILIZADA', classeRisco: '6.1', numeroRisco: '66', grupoEmbalagem: 'I', quantidadeIsenta: 5 },
    { onu: '1551', produto: 'ÁCIDO ARSÊNICO, LÍQUIDO', classeRisco: '6.1', numeroRisco: '66', grupoEmbalagem: 'I', quantidadeIsenta: 5 },
    { onu: '1554', produto: 'ÁCIDO ARSÊNICO, SÓLIDO', classeRisco: '6.1', numeroRisco: '60', grupoEmbalagem: 'II', quantidadeIsenta: 50 },
    { onu: '1603', produto: 'ACETATO DE BROMOETILA', classeRisco: '6.1', numeroRisco: '63', grupoEmbalagem: 'II', quantidadeIsenta: 50 },
    { onu: '1616', produto: 'ACETATO DE CHUMBO', classeRisco: '6.1', numeroRisco: '60', grupoEmbalagem: 'III', quantidadeIsenta: 100 },
    { onu: '1629', produto: 'ACETATO DE MERCÚRIO', classeRisco: '6.1', numeroRisco: '60', grupoEmbalagem: 'II', quantidadeIsenta: 50 },
    { onu: '1674', produto: 'ACETATO DE FENILMERCÚRIO', classeRisco: '6.1', numeroRisco: '', grupoEmbalagem: 'II', quantidadeIsenta: 50 },
    { onu: '1754', produto: 'ÁCIDO CLOROSSULFÔNICO (com ou sem trióxido de enxofre)', classeRisco: '8', numeroRisco: '88', grupoEmbalagem: 'I', quantidadeIsenta: 20 },
    { onu: '1755', produto: 'ÁCIDO CRÔMICO, SOLUÇÃO', classeRisco: '8', numeroRisco: '80', grupoEmbalagem: '', quantidadeIsenta: 100 },
    { onu: '1788', produto: 'ÁCIDO BROMÍDRICO, SOLUÇÃO', classeRisco: '8', numeroRisco: '80', grupoEmbalagem: '', quantidadeIsenta: 100 },
    { onu: '1789', produto: 'ÁCIDO CLORÍDRICO, SOLUÇÃO', classeRisco: '8', numeroRisco: '80', grupoEmbalagem: '', quantidadeIsenta: 100 },
    { onu: '1790', produto: 'ÁCIDO FLUORÍDRICO, SOLUÇÃO', classeRisco: '8', numeroRisco: '886', grupoEmbalagem: '', quantidadeIsenta: 20 },
    { onu: '1841', produto: 'ACETALDEÍDO AMÔNIA', classeRisco: '9', numeroRisco: '', grupoEmbalagem: 'III', quantidadeIsenta: 0 },
    { onu: '2218', produto: 'ÁCIDO ACRÍLICO, INIBIDO', classeRisco: '8', numeroRisco: '89', grupoEmbalagem: 'II', quantidadeIsenta: 100 },
    { onu: '2243', produto: 'ACETATO DE CICLO-HEXILA', classeRisco: '3', numeroRisco: '30', grupoEmbalagem: 'III', quantidadeIsenta: 1000 },
    { onu: '2332', produto: 'ACETALDEÍDO OXIMA', classeRisco: '3', numeroRisco: '', grupoEmbalagem: 'II', quantidadeIsenta: 333 },
    { onu: '2333', produto: 'ACETATO DE ALILA', classeRisco: '3', numeroRisco: '336', grupoEmbalagem: 'II', quantidadeIsenta: 100 },
    { onu: '2403', produto: 'ACETATO DE ISOPROPENILA', classeRisco: '3', numeroRisco: '33', grupoEmbalagem: 'II', quantidadeIsenta: 333 },
    { onu: '2621', produto: 'ACETILMETILCARBINOL', classeRisco: '3', numeroRisco: '30', grupoEmbalagem: 'III', quantidadeIsenta: 500 },
    { onu: '2623', produto: 'ACENDEDORES, SÓLIDOS, com líquido inflamável', classeRisco: '4.1', numeroRisco: '', grupoEmbalagem: 'II', quantidadeIsenta: 50 },
    { onu: '2643', produto: 'ACETATO DE BROMOMETILA', classeRisco: '6.1', numeroRisco: '63', grupoEmbalagem: 'II', quantidadeIsenta: 50 }
  ]

  // Import comprehensive dangerous goods database
  const produtosPerigososCompleto = [
    { onu: '1090', produto: 'Acetona', classeRisco: '3', numeroRisco: '30', grupoEmbalagem: 'II', quantidadeIsenta: '5L', categoria: 'Solvente' },
    { onu: '1203', produto: 'Gasolina', classeRisco: '3', numeroRisco: '33', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Combustível' },
    { onu: '1219', produto: 'Álcool isopropílico', classeRisco: '3', numeroRisco: '30', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Álcool' },
    { onu: '1230', produto: 'Metanol', classeRisco: '3', numeroRisco: '336', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Álcool' },
    { onu: '1263', produto: 'Tinta', classeRisco: '3', numeroRisco: '30', grupoEmbalagem: 'II', quantidadeIsenta: '5L', categoria: 'Tinta' },
    { onu: '1267', produto: 'Petróleo bruto', classeRisco: '3', numeroRisco: '30', grupoEmbalagem: 'I', quantidadeIsenta: '0L', categoria: 'Petróleo' },
    { onu: '1760', produto: 'Líquido corrosivo N.E.', classeRisco: '8', numeroRisco: '80', grupoEmbalagem: 'III', quantidadeIsenta: '5L', categoria: 'Corrosivo' },
    { onu: '1789', produto: 'Ácido clorídrico', classeRisco: '8', numeroRisco: '80', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Ácido' },
    { onu: '1791', produto: 'Solução de hipoclorito', classeRisco: '8', numeroRisco: '80', grupoEmbalagem: 'III', quantidadeIsenta: '5L', categoria: 'Oxidante' },
    { onu: '1824', produto: 'Solução de hidróxido de sódio', classeRisco: '8', numeroRisco: '80', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Base' },
    { onu: '1830', produto: 'Ácido sulfúrico', classeRisco: '8', numeroRisco: '80', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Ácido' },
    { onu: '1888', produto: 'Clorofórmio', classeRisco: '6.1', numeroRisco: '60', grupoEmbalagem: 'III', quantidadeIsenta: '5L', categoria: 'Solvente' },
    { onu: '1993', produto: 'Líquido inflamável N.E.', classeRisco: '3', numeroRisco: '30', grupoEmbalagem: 'III', quantidadeIsenta: '5L', categoria: 'Inflamável' },
    { onu: '2024', produto: 'Composto de mercúrio líquido', classeRisco: '6.1', numeroRisco: '60', grupoEmbalagem: 'III', quantidadeIsenta: '5L', categoria: 'Tóxico' },
    { onu: '2031', produto: 'Ácido nítrico', classeRisco: '8', numeroRisco: '856', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Ácido' },
    { onu: '2209', produto: 'Solução de formaldeído', classeRisco: '8', numeroRisco: '80', grupoEmbalagem: 'III', quantidadeIsenta: '5L', categoria: 'Aldeído' },
    { onu: '2218', produto: 'Ácido acrílico', classeRisco: '8', numeroRisco: '89', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Ácido' },
    { onu: '2319', produto: 'Hidrocarbonetos terpênicos', classeRisco: '3', numeroRisco: '30', grupoEmbalagem: 'III', quantidadeIsenta: '5L', categoria: 'Hidrocarboneto' },
    { onu: '2336', produto: 'Formiato de alila', classeRisco: '3', numeroRisco: '336', grupoEmbalagem: 'I', quantidadeIsenta: '0L', categoria: 'Éster' },
    { onu: '2357', produto: 'Ciclo-hexilamina', classeRisco: '8', numeroRisco: '83', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Amina' },
    { onu: '2617', produto: 'Metilciclo-hexanóis', classeRisco: '3', numeroRisco: '30', grupoEmbalagem: 'III', quantidadeIsenta: '5L', categoria: 'Álcool' },
    { onu: '2735', produto: 'Aminas líquidas corrosivas', classeRisco: '8', numeroRisco: '83', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Amina' },
    { onu: '2789', produto: 'Ácido acético glacial', classeRisco: '8', numeroRisco: '80', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Ácido' },
    { onu: '2810', produto: 'Líquido tóxico orgânico', classeRisco: '6.1', numeroRisco: '60', grupoEmbalagem: 'III', quantidadeIsenta: '5L', categoria: 'Tóxico' },
    { onu: '2924', produto: 'Líquido inflamável corrosivo', classeRisco: '3', numeroRisco: '83', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Misto' },
    { onu: '3082', produto: 'Substância perigosa ao meio ambiente', classeRisco: '9', numeroRisco: '90', grupoEmbalagem: 'III', quantidadeIsenta: '5L', categoria: 'Ambiental' },
    { onu: '3264', produto: 'Líquido corrosivo ácido inorgânico', classeRisco: '8', numeroRisco: '80', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Ácido' },
    { onu: '3265', produto: 'Líquido corrosivo ácido orgânico', classeRisco: '8', numeroRisco: '80', grupoEmbalagem: 'III', quantidadeIsenta: '5L', categoria: 'Ácido' },
    { onu: '3266', produto: 'Líquido corrosivo básico inorgânico', classeRisco: '8', numeroRisco: '80', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Base' },
    { onu: '3267', produto: 'Líquido corrosivo básico orgânico', classeRisco: '8', numeroRisco: '80', grupoEmbalagem: 'III', quantidadeIsenta: '5L', categoria: 'Base' },
    { onu: '3289', produto: 'Líquido tóxico inorgânico', classeRisco: '6.1', numeroRisco: '60', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Tóxico' },
    { onu: '3290', produto: 'Sólido tóxico inorgânico', classeRisco: '6.1', numeroRisco: '60', grupoEmbalagem: 'III', quantidadeIsenta: '5kg', categoria: 'Tóxico' },
    { onu: '3291', produto: 'Resíduo clínico não especificado', classeRisco: '6.2', numeroRisco: '60', grupoEmbalagem: 'II', quantidadeIsenta: '0kg', categoria: 'Biológico' },
    { onu: '3316', produto: 'Kit químico', classeRisco: '9', numeroRisco: '90', grupoEmbalagem: 'II', quantidadeIsenta: '1L', categoria: 'Misto' },
    { onu: '3334', produto: 'Líquido regulamentado para aviação', classeRisco: '9', numeroRisco: '90', grupoEmbalagem: 'III', quantidadeIsenta: '0.5L', categoria: 'Regulamentado' },
    { onu: '3335', produto: 'Sólido regulamentado para aviação', classeRisco: '9', numeroRisco: '90', grupoEmbalagem: 'III', quantidadeIsenta: '1kg', categoria: 'Regulamentado' },
    { onu: '3429', produto: 'Cloratos inorgânicos', classeRisco: '5.1', numeroRisco: '50', grupoEmbalagem: 'II', quantidadeIsenta: '1kg', categoria: 'Oxidante' },
    { onu: '3480', produto: 'Baterias de íon lítio', classeRisco: '9', numeroRisco: '90', grupoEmbalagem: 'II', quantidadeIsenta: '0kg', categoria: 'Eletrônico' },
    { onu: '3481', produto: 'Baterias de íon lítio em equipamentos', classeRisco: '9', numeroRisco: '90', grupoEmbalagem: 'II', quantidadeIsenta: '0kg', categoria: 'Eletrônico' },
    { onu: '3507', produto: 'Hexafluoreto de urânio radioativo', classeRisco: '8', numeroRisco: '885', grupoEmbalagem: 'I', quantidadeIsenta: '0kg', categoria: 'Radioativo' },
    { onu: '3509', produto: 'Embalagens vazias não limpas', classeRisco: '9', numeroRisco: '90', grupoEmbalagem: 'III', quantidadeIsenta: '0kg', categoria: 'Resíduo' },
    ...produtosPerigososBD
  ];

  // Função para buscar produto por ONU
  const buscarProdutoPorONU = (numeroONU: string) => {
    return produtosPerigososCompleto.find(produto => produto.onu === numeroONU)
  }

  // Efeito para auto-preenchimento quando ONU é digitado
  useEffect(() => {
    if (codigoONU && codigoONU.length >= 4) {
      const produto = buscarProdutoPorONU(codigoONU)
      if (produto) {
        setProdutoPerigoso(produto)
        setCodigoRisco(produto.numeroRisco)
        // Notificar que os campos foram preenchidos automaticamente
        toast.success(`Produto Perigoso Identificado: ${produto.produto} - Classe ${produto.classeRisco}`)
      } else {
        setProdutoPerigoso(null)
        setCodigoRisco('')
      }
    }
  }, [codigoONU])

  // Handle incoming XML data from nota fiscal entry
  useEffect(() => {
    // Check if we have state data from navigation (wouter doesn't support state directly)
    // We'll use sessionStorage as a workaround for state transfer
    const xmlDataFromSession = sessionStorage.getItem('xmlData')
    if (xmlDataFromSession) {
      try {
        const data = JSON.parse(xmlDataFromSession)
        setXmlData(data)
        
        // Pre-populate form fields with XML data
        if (data.numero_nota) {
          setNotaFiscal(data.numero_nota)
        }
        
        // Generate volumes for current nota fiscal
        const volumes = []
        const quantidadeVolumes = parseInt(data.quantidade_volumes || '1')
        for (let i = 1; i <= quantidadeVolumes; i++) {
          volumes.push({
            codigo: `${data.numero_nota}-001-${String(i).padStart(3, '0')}`,
            volume: `${i}/${quantidadeVolumes}`,
            tipo: 'Carga Geral',
            area: '01',
            quantidade: 1,
            status: 'Pendente'
          })
        }
        setCurrentNotaVolumes(volumes)
        
        // Auto-enable preview when coming from XML
        setShowPreview(true)
        
        toast.success('Dados da Nota Fiscal carregados com sucesso!')
      } catch (error) {
        console.error('Error parsing XML data:', error)
      }
    }
  }, [])

  // Generate QR code when volume ID changes
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const volumeId = generateVolumeId(notaFiscal || '111007', 1, parseInt(quantidadeVolumes?.toString() || '1'))
        const qrDataURL = await QRCode.toDataURL(volumeId, {
          width: 64,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeDataURL(qrDataURL)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    generateQRCode()
    // Update QR code every minute to keep timestamp current
    const interval = setInterval(generateQRCode, 60000)
    
    return () => clearInterval(interval)
  }, [notaFiscal, numeroVolume])

  // Extract and format creation date from volume ID
  const formatCreationDate = useCallback((volumeId: string) => {
    // Extract date from ID format: NOTA-VOL-DDMMYYYY-HHMM
    const parts = volumeId.split('-')
    if (parts.length >= 4) {
      const datePart = parts[2] // DDMMYYYY
      const timePart = parts[3] // HHMM
      
      if (datePart.length === 8 && timePart.length === 4) {
        const day = datePart.substring(0, 2)
        const month = datePart.substring(2, 4)
        const year = datePart.substring(4, 8)
        const hour = timePart.substring(0, 2)
        const minute = timePart.substring(2, 4)
        
        return `${day}/${month}/${year} ${hour}:${minute}`
      }
    }
    
    // Fallback para data/hora atual se não conseguir extrair
    const now = new Date()
    return now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  // Load volumes status from database
  useEffect(() => {
    const loadVolumesStatus = async () => {
      if (!notaFiscal || currentNotaVolumes.length === 0) return

      try {

        
        const response = await fetch(`/api/volumes/nota/${notaFiscal}/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          
          // Criar um objeto com o status de cada volume baseado no código da etiqueta
          const statusMap: Record<string, string> = {}
          if (data.volumes && data.volumes.rows) {
            data.volumes.rows.forEach((volume: any) => {
              const codigoOriginal = volume.codigo_etiqueta
              statusMap[codigoOriginal] = volume.status || 'Pendente'
              
              // Criar mapeamento adicional para códigos temporais
              // Se o código for no formato "2227-VOL-1", mapear também para "2227-001-*"
              if (codigoOriginal && codigoOriginal.includes('-VOL-')) {
                const [notaFiscal, , numeroVolume] = codigoOriginal.split('-')
                const numeroFormatado = numeroVolume.padStart(3, '0')
                
                // Buscar códigos temporais correspondentes nos volumes atuais usando apenas NF e número
                currentNotaVolumes.forEach(volAtual => {
                  // Extrair parte base do código temporal: NF-XXX
                  const parteBase = volAtual.codigo.split('-').slice(0, 2).join('-') // Ex: "2227-001"
                  const esperado = `${notaFiscal}-${numeroFormatado}` // Ex: "2227-001"
                  
                  if (parteBase === esperado) {
                    statusMap[volAtual.codigo] = volume.status || 'Pendente'
                  }
                })
              }
              
              // Se o código for temporal "2227-001-*", mapear também para formato VOL
              if (codigoOriginal && /^\d+-\d{3}-\d{8}-\d{4}$/.test(codigoOriginal)) {
                const [notaFiscal, numeroVolume] = codigoOriginal.split('-')
                const numeroVol = parseInt(numeroVolume).toString()
                const codigoVol = `${notaFiscal}-VOL-${numeroVol}`
                statusMap[codigoVol] = volume.status || 'Pendente'
              }
            })
          }
          

          
          setVolumesStatus(statusMap)
        } else {
          console.error('Erro ao carregar status das etiquetas:', response.status)
        }
      } catch (error) {
        console.error('Erro ao carregar status das etiquetas:', error)
      }
    }

    loadVolumesStatus()
  }, [notaFiscal, currentNotaVolumes])
  


  // Mock data - em produção virá da API
  const volumesData: VolumeData[] = [
    {
      codigo: '352-001-001-20250609-22',
      notaFiscal: '352',
      volume: '1/1',
      tipo: 'Produto Químico',
      area: '01',
      quantidade: 1,
      status: 'Pendente',
      dataGeracao: '09/06/2025'
    },
    {
      codigo: '11348-062-562-20250609-12',
      notaFiscal: '11348',
      volume: '62/62',
      tipo: 'Carga Geral',
      area: '02',
      quantidade: 1,
      status: 'Gerada',
      dataGeracao: '09/06/2025'
    },
    {
      codigo: '11348-061-562-20250609-12',
      notaFiscal: '11348',
      volume: '61/62',
      tipo: 'Carga Geral',
      area: '02',
      quantidade: 1,
      status: 'Impressa',
      dataGeracao: '09/06/2025'
    }
  ]

  const areas = [
    ...Array.from({length: 10}, (_, i) => `Área ${String(i + 1).padStart(2, '0')}`),
    'Área IMP',
    'Área REC', 
    'Área SLZ',
    'Área FOR',
    'Área GYN'
  ]
  
  const tiposVolume = [
    'Carga Geral',
    'Produto Perigoso',
    'Produto Frágil',
    'Produto Perecível'
  ]

  const classificacoes = [
    { value: 'cargas-nao-classificadas', label: 'Cargas Não Classificadas' },
    { value: 'classe-1', label: 'Classe 1 - Explosivos' },
    { value: 'classe-2', label: 'Classe 2 - Gases' },
    { value: 'classe-3', label: 'Classe 3 - Líquidos Inflamáveis' },
    { value: 'classe-4', label: 'Classe 4 - Sólidos Inflamáveis' },
    { value: 'classe-5', label: 'Classe 5 - Substâncias Oxidantes' },
    { value: 'classe-6', label: 'Classe 6 - Substâncias Tóxicas' },
    { value: 'classe-7', label: 'Classe 7 - Material Radioativo' },
    { value: 'classe-8', label: 'Classe 8 - Substâncias Corrosivas' },
    { value: 'classe-9', label: 'Classe 9 - Substâncias Perigosas Diversas' }
  ]

  const formatosImpressao = [
    { value: '50x100mm', label: 'Etiqueta 50x100mm' },
    { value: '100x150mm', label: 'Etiqueta 100x150mm (Retrato)' },
    { value: 'a4', label: 'Folha A4' }
  ]

  const layoutsEtiqueta = [
    { value: 'alta-legibilidade', label: 'Alta Legibilidade (Texto Grande)' },
    { value: 'alta-legibilidade-contraste', label: 'Alta Legibilidade Contraste (Texto Grande)' }
  ]


  // Combinar volumes gerados dinamicamente com dados mock para filtrar
  const allVolumes = [...currentNotaVolumes, ...volumesData]
  
  const filteredVolumes = allVolumes.filter(volume => {
    const matchesSearch = volume.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volume.notaFiscal.includes(searchTerm)
    const matchesArea = !selectedArea || volume.area === selectedArea.replace('Área ', '')
    const matchesTipo = !selectedTipo || volume.tipo === selectedTipo
    
    return matchesSearch && matchesArea && matchesTipo
  })

  const handleSelectVolume = (codigo: string) => {
    setSelectedVolumes(prev => 
      prev.includes(codigo) 
        ? prev.filter(c => c !== codigo)
        : [...prev, codigo]
    )
  }

  const handleSelectAll = () => {
    if (selectedVolumes.length === filteredVolumes.length) {
      setSelectedVolumes([])
    } else {
      setSelectedVolumes(filteredVolumes.map(v => v.codigo))
    }
  }

  const handleGenerateLabels = async () => {
    if (selectedVolumes.length === 0) return
    
    setIsGenerating(true)
    
    try {
      // Preparar dados das etiquetas com informações de produtos perigosos
      const etiquetasData = selectedVolumes.map(volumeId => {
        const volume = currentNotaVolumes.find(v => v.codigo === volumeId) || volumesData.find(v => v.codigo === volumeId)
        
        const etiquetaData = {
          codigo: volume?.codigo,
          notaFiscal: volume?.notaFiscal,
          volume: volume?.volume,
          tipo: selectedTipo,
          area: selectedArea,
          quantidade: volume?.quantidade,
          // Dados de produtos perigosos se aplicável
          ...(selectedTipo === 'Produto Perigoso' && {
            numeroONU: codigoONU,
            classeRisco: produtoPerigoso?.classeRisco || '',
            numeroRisco: produtoPerigoso?.numeroRisco || codigoRisco,
            grupoEmbalagem: produtoPerigoso?.grupoEmbalagem || '',
            nomeProdutoPerigoso: produtoPerigoso?.produto || '',
            nomeTecnico: produtoPerigoso?.produto || '',
            classe: produtoPerigoso?.classeRisco || '',
            quantidadeIsenta: produtoPerigoso?.quantidadeIsenta || null,
            classificacao: classificacao
          })
        }
        
        return etiquetaData
      })
      
      // Simular envio para API
      console.log('Dados das etiquetas com produtos perigosos:', etiquetasData)
      
      // First ensure volumes are saved to database
      const saved = await saveVolumesToDatabase(currentNotaVolumes, notaFiscalData)
      if (!saved) {
        console.warn('Volumes não puderam ser salvos na base, mas continuando com geração')
      }

      // Simular geração de etiquetas
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update status to "Impressa" for selected volumes via API
      for (const volumeId of selectedVolumes) {
        try {
          const response = await fetch(`/api/volumes/etiqueta/${volumeId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: 'impressa' })
          })
          
          if (response.ok) {
            // Update local status state
            setVolumesStatus(prev => ({
              ...prev,
              [volumeId]: 'impressa'
            }))
          } else {
            console.error(`Erro na resposta da API para volume ${volumeId}:`, response.status)
          }
        } catch (error) {
          console.error(`Erro ao atualizar status do volume ${volumeId}:`, error)
        }
      }
      
      // Notificar sucesso
      toast.success(`${selectedVolumes.length} etiqueta(s) gerada(s) com sucesso!`)
      
      setIsGenerating(false)
      setShowPreview(true)
      setSelectedVolumes([])
      
    } catch (error) {
      console.error('Erro ao gerar etiquetas:', error)
      toast.error('Erro ao gerar etiquetas. Tente novamente.')
      setIsGenerating(false)
    }
  }

  // Handle viewing individual volume label
  const handleViewVolume = (codigo: string) => {
    const volume = currentNotaVolumes.find(v => v.codigo === codigo)
    if (volume) {
      setNumeroVolume(volume.volume.split('/')[0].padStart(3, '0'))
      setShowPreview(true)
      toast.info(`Visualizando etiqueta do volume ${volume.volume}`)
    }
  }

  // Handle printing individual volume
  const handlePrintVolume = async (codigo: string) => {
    const volume = currentNotaVolumes.find(v => v.codigo === codigo)
    if (volume) {
      try {
        // First ensure volumes are saved to database
        const saved = await saveVolumesToDatabase(currentNotaVolumes, notaFiscalData)
        if (!saved) {
          console.warn('Volumes não puderam ser salvos na base, mas continuando com impressão')
        }

        await generateLabelPDF([volume], 'print')
        
        // Update status to "impressa" in database via API
        try {
          const response = await fetch(`/api/volumes/etiqueta/${codigo}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: 'impressa' })
          })
          
          if (response.ok) {
            // Update local status state
            setVolumesStatus(prev => ({
              ...prev,
              [codigo]: 'impressa'
            }))
            
            console.log(`Status do volume ${codigo} atualizado para impressa`)
            toast.success('Etiqueta impressa e status atualizado!')
          } else {
            console.error('Erro na resposta da API de status:', response.status)
            toast.warning('Etiqueta impressa, mas status não foi atualizado')
          }
        } catch (error) {
          console.error('Erro ao atualizar status do volume:', error)
          toast.warning('Etiqueta impressa, mas status não foi atualizado')
        }
      } catch (error) {
        console.error('Erro ao imprimir etiqueta:', error)
        toast.error('Erro ao imprimir etiqueta')
      }
    }
  }

  // Generate PDF for selected volumes
  const generateLabelPDF = async (volumes: any[], action: 'download' | 'print') => {
    try {
      toast.info(`${action === 'download' ? 'Gerando PDF' : 'Preparando para impressão'}...`)
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: selectedFormato === '50x100mm' ? [50, 100] : 
                selectedFormato === '100x150mm' ? [100, 150] : 'a4'
      })

      let isFirstPage = true

      for (const volume of volumes) {
        if (!isFirstPage) {
          pdf.addPage()
        }
        isFirstPage = false

        // Generate QR Code for this volume
        const qrData = `${volume.notaFiscal}-${volume.volume.split('/')[0]}-${new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }).replace(/\//g, '')}-${new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        }).replace(':', '')}`
        
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
          width: 64,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        })

        // Add content to PDF using the selected layout
        if (selectedLayout === 'alta-legibilidade-contraste') {
          await addAltaLegibilidadeContrasteToPDF(pdf, volume, qrCodeDataURL)
        } else {
          await addA4LabelToPDF(pdf, volume, qrCodeDataURL)
        }
      }

      const fileName = `etiquetas_NF_${notaFiscal}_${new Date().toISOString().slice(0, 10)}.pdf`
      
      if (action === 'download') {
        pdf.save(fileName)
        toast.success('PDF das etiquetas baixado com sucesso')
      } else {
        // For printing, generate multiple labels based on quantity
        const quantidadeVolumes = notaFiscalData?.quantidade_volumes || 1
        const printPdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: selectedFormato === '50x100mm' ? [50, 100] : 
                  selectedFormato === '100x150mm' ? [100, 150] : 'a4'
        })

        let printFirstPage = true
        let totalLabels = 0

        // Generate individual labels for each volume with proper numbering
        for (const volume of volumes) {
          for (let i = 1; i <= quantidadeVolumes; i++) {
            if (!printFirstPage) {
              printPdf.addPage()
            }
            printFirstPage = false
            totalLabels++

            // Create volume data with dynamic numbering
            const volumeData = {
              ...volume,
              volume: `${i}/${quantidadeVolumes}`,
              codigo: `${volume.codigo}-${String(i).padStart(3, '0')}`
            }

            // Generate QR code for this specific label
            const labelQrData = `${volume.notaFiscal}-${volumeData.codigo}-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}`
            const labelQrCodeDataURL = await QRCode.toDataURL(labelQrData, {
              width: 64,
              margin: 1,
              color: { dark: '#000000', light: '#FFFFFF' }
            })

            // Add label using the selected layout
            if (selectedLayout === 'alta-legibilidade-contraste') {
              await addAltaLegibilidadeContrasteToPDF(printPdf, volumeData, labelQrCodeDataURL)
            } else {
              await addA4LabelToPDF(printPdf, volumeData, labelQrCodeDataURL)
            }
          }
        }

        // Open print dialog in new window
        const pdfBlob = printPdf.output('blob')
        const url = URL.createObjectURL(pdfBlob)
        const printWindow = window.open(url, '_blank')
        
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print()
            // Clean up URL after printing
            setTimeout(() => URL.revokeObjectURL(url), 1000)
          }
        }

        toast.success(`${totalLabels} etiquetas preparadas para impressão`)
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error(`Erro ao ${action === 'download' ? 'gerar PDF' : 'imprimir'}`)
    }
  }

  // Print functionality for multiple selected volumes
  const handlePrintLabels = async () => {
    if (selectedVolumes.length === 0) {
      toast.error('Selecione pelo menos um volume para imprimir')
      return
    }
    
    const selectedVolumeData = currentNotaVolumes.filter(v => selectedVolumes.includes(v.codigo))
    await generateLabelPDF(selectedVolumeData, 'print')
    
    // Update status to "Impressa"
    const updatedVolumes = currentNotaVolumes.map(volume => {
      if (selectedVolumes.includes(volume.codigo)) {
        return { ...volume, status: 'Impressa' as const }
      }
      return volume
    })
    setCurrentNotaVolumes(updatedVolumes)
    setSelectedVolumes([])
  }

  // Handle individual volume classification
  const handleClassifyVolume = (codigo: string) => {
    const volume = currentNotaVolumes.find(v => v.codigo === codigo)
    if (volume) {
      setSelectedVolumeForClassification(codigo)
      
      // Load existing classification if available
      const existingClassification = volumeClassifications[codigo]
      if (existingClassification) {
        setVolumeTipo(existingClassification.tipo)
        setVolumeCodigoONU(existingClassification.codigoONU || '')
        setVolumeCodigoRisco(existingClassification.codigoRisco || '')
        setVolumeNomeTecnico(existingClassification.nomeTecnico || '')
        setVolumeClasse(existingClassification.classe || '')
        setVolumeClassificacao(existingClassification.classificacao || '')
      } else {
        // Reset form for new classification
        setVolumeTipo('')
        setVolumeCodigoONU('')
        setVolumeCodigoRisco('')
        setVolumeNomeTecnico('')
        setVolumeClasse('')
        setVolumeClassificacao('')
      }
      
      setClassificationDialogOpen(true)
    }
  }

  // Save individual volume classification
  const saveVolumeClassification = () => {
    if (!selectedVolumeForClassification || !volumeTipo) {
      toast.error('Selecione um tipo de volume')
      return
    }

    const newClassification = {
      tipo: volumeTipo,
      codigoONU: volumeCodigoONU,
      codigoRisco: volumeCodigoRisco,
      nomeTecnico: volumeNomeTecnico,
      classe: volumeClasse,
      classificacao: volumeClassificacao
    }

    // Update volume classifications
    setVolumeClassifications(prev => ({
      ...prev,
      [selectedVolumeForClassification]: newClassification
    }))

    // Update the volume in currentNotaVolumes with new classification
    const updatedVolumes = currentNotaVolumes.map(volume => {
      if (volume.codigo === selectedVolumeForClassification) {
        return {
          ...volume,
          tipo: volumeTipo,
          numeroONU: volumeCodigoONU,
          classeRisco: volumeClasse,
          numeroRisco: volumeCodigoRisco,
          nomeProdutoPerigoso: volumeNomeTecnico,
          nomeTecnico: volumeNomeTecnico,
          classificacao: volumeClassificacao
        }
      }
      return volume
    })
    setCurrentNotaVolumes(updatedVolumes)

    toast.success('Classificação do volume salva com sucesso!')
    setClassificationDialogOpen(false)
  }



  // High-contrast label PDF function for "Alta Legibilidade Contraste" layout
  const addAltaLegibilidadeContrasteToPDF = async (pdf: jsPDF, volume: any, qrCodeDataURL: string) => {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const isSmallFormat = selectedFormato === '50x100mm'
    const margin = isSmallFormat ? 2 : 3
    let currentY = margin + 2

    // Header - Client logo detection and transportadora
    const headerHeight = isSmallFormat ? 8 : 12
    // No visible border - transparent container
    pdf.setDrawColor(255, 255, 255) // Transparent/white border
    pdf.setLineWidth(0)
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(isSmallFormat ? 10 : 14)
    pdf.setFont('helvetica', 'bold')
    
    // Client logo detection - check logged user's company
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const userCompany = currentUser?.empresa || volume.transportadora || 'Transportadora não especificada'
    
    let transportadoraText = userCompany
    
    // Check for specific clients with logos
    if (userCompany.toLowerCase().includes('transul') || userCompany.includes('Transportadora não especificada')) {
      transportadoraText = 'TRANSUL TRANSPORTE'
      
      // Create framed and centered Transul logo in PDF header
      pdf.setFillColor(0, 0, 0)
      pdf.setFont('helvetica', 'bold')
      
      // Logo positioning with 2mm spacing from top (no border frame)
      const spacingFromTop = 2 // 2mm spacing
      const logoAreaY = margin + spacingFromTop
      const logoAreaHeight = headerHeight - spacingFromTop
      
      // Center the logo text within the area
      const logoScale = isSmallFormat ? 0.8 : 1.0
      const logoX = margin + ((pageWidth - (margin * 2)) / 2)
      const logoY = logoAreaY + (logoAreaHeight / 2)
      
      // Main "Transul" text - centered
      pdf.setFontSize(isSmallFormat ? 12 : 16)
      pdf.text('Transul', logoX, logoY - (1 * logoScale), { align: 'center' })
      
      // Subtitle "TRANSPORTE" - centered below
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(isSmallFormat ? 5 : 7)
      pdf.text('TRANSPORTE', logoX, logoY + (2 * logoScale), { align: 'center' })
      
      currentY = margin + headerHeight + 3
      
    } else if (userCompany.toLowerCase().includes('cross')) {
      transportadoraText = 'CROSS LOGISTICS'
      const transportadoraX = margin + ((pageWidth - (margin * 2)) / 2)
      pdf.text(transportadoraText, transportadoraX, margin + (headerHeight * 0.6), { align: 'center' })
      currentY = margin + headerHeight + 3
    } else {
      const transportadoraX = margin + ((pageWidth - (margin * 2)) / 2)
      pdf.text(transportadoraText, transportadoraX, margin + (headerHeight * 0.6), { align: 'center' })
      currentY = margin + headerHeight + 3
    }

    // QR Code positioning (right side, aligned with ID)
    const qrSize = isSmallFormat ? 12 : 16
    const qrX = pageWidth - margin - qrSize - 2
    const qrY = currentY
    
    if (qrCodeDataURL) {
      pdf.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSize, qrSize)
      
      // QR Code label below
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(isSmallFormat ? 5 : 7)
      pdf.setFont('helvetica', 'normal')
      pdf.text(volume.codigo, qrX + (qrSize / 2), qrY + qrSize + 2, { align: 'center' })
    }

    // ID Section (left side, aligned with QR code)
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(isSmallFormat ? 7 : 9)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`ID: ${volume.codigo}`, margin + 2, currentY + 3)
    currentY += isSmallFormat ? 4 : 5
    
    // Data de Entrada - extraída do código temporal (alta legibilidade)
    const formatEntryDateHiLeg = (codigo: string): string => {
      // Extrai data do formato: NOTA-VOL-DDMMYYYY-HHMM
      const parts = codigo.split('-')
      if (parts.length >= 4) {
        const datePart = parts[2] // DDMMYYYY
        const timePart = parts[3] // HHMM
        
        if (datePart.length === 8 && timePart.length === 4) {
          const day = datePart.substring(0, 2)
          const month = datePart.substring(2, 4)
          const year = datePart.substring(4, 8)
          const hour = timePart.substring(0, 2)
          const minute = timePart.substring(2, 4)
          
          return `${day}/${month}/${year} ${hour}:${minute}`
        }
      }
      
      // Fallback para data/hora atual
      return new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    pdf.setFontSize(isSmallFormat ? 12 : 16) // Aumentado 100%
    pdf.setFont('helvetica', 'bold') // Negrito
    pdf.setTextColor(40, 40, 40) // Dark gray for readability in high contrast
    const entryDateHiLeg = formatEntryDateHiLeg(volume.codigo)
    pdf.text(`Entrada: ${entryDateHiLeg}`, margin + 2, currentY + 3)
    currentY += isSmallFormat ? 4 : 5

    // NF - Black background with white text
    const nfWidth = pageWidth - qrSize - 8 - margin
    const nfHeight = isSmallFormat ? 6 : 8
    pdf.setFillColor(0, 0, 0) // Black background
    pdf.rect(margin + 2, currentY, nfWidth, nfHeight, 'F')
    
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFontSize(isSmallFormat ? 11 : 16)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`NF: ${volume.notaFiscal}`, margin + 4, currentY + (nfHeight * 0.65))
    currentY += nfHeight + 2

    // Número do Pedido - Black background with white text (same format as Remetente)
    const pedidoHeight = isSmallFormat ? 6 : 8
    pdf.setFillColor(0, 0, 0) // Black background
    pdf.rect(margin + 2, currentY, pageWidth - (margin * 2) - 4, pedidoHeight, 'F')
    
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFontSize(isSmallFormat ? 7 : 10)
    pdf.setFont('helvetica', 'bold')
    const numeroPedido = notaFiscalData?.numero_pedido || 'N/A'
    pdf.text(`Pedido: ${numeroPedido}`, margin + 4, currentY + (pedidoHeight * 0.65))
    currentY += pedidoHeight + 2

    // Remetente - Black background with white text
    const remetenteHeight = isSmallFormat ? 6 : 8
    pdf.setFillColor(0, 0, 0) // Black background
    pdf.rect(margin + 2, currentY, pageWidth - (margin * 2) - 4, remetenteHeight, 'F')
    
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFontSize(isSmallFormat ? 7 : 10)
    pdf.setFont('helvetica', 'bold')
    const remetenteText = `Remetente: ${notaFiscalData?.emitente_razao_social || volume.remetente || 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA'}`
    pdf.text(remetenteText, margin + 4, currentY + (remetenteHeight * 0.65))
    currentY += remetenteHeight + 3

    // Destinatário and Address section
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(isSmallFormat ? 7 : 9)
    pdf.setFont('helvetica', 'normal')
    
    const destinatarioText = `Destinatário: ${notaFiscalData?.destinatario_razao_social || volume.destinatario || 'CONSORCIO DE ALUMINIO DO MARANHAO'}`
    pdf.text(destinatarioText, margin + 2, currentY)
    currentY += isSmallFormat ? 3 : 4
    
    // Complete address with city, state and CEP
    const enderecoCompleto = notaFiscalData ? 
      `${notaFiscalData.destinatario_endereco || 'RODOVIA BR 135'}, ${notaFiscalData.destinatario_cidade || 'IMPERATRIZ'} - ${notaFiscalData.destinatario_uf || 'MA'}, CEP: ${notaFiscalData.destinatario_cep || '65900-000'}` :
      volume.enderecoDestino || 'RODOVIA BR 135, IMPERATRIZ - MA, CEP: 65900-000'
    
    const enderecoText = `Endereço: ${enderecoCompleto}`
    pdf.text(enderecoText, margin + 2, currentY)
    currentY += isSmallFormat ? 4 : 5

    // Dangerous goods section - prioritize volume object properties over global settings
    const volumeClassification = volumeClassifications[volume.codigo]
    const isVolumePerigoso = volume.tipo === 'Produto Perigoso' || volumeClassification?.tipo === 'Produto Perigoso' || selectedTipo === 'Produto Perigoso'
    const volumeONU = volume.numeroONU || volumeClassification?.codigoONU || codigoONU
    const volumeRisco = volume.numeroRisco || volumeClassification?.codigoRisco || codigoRisco
    const volumeNomeTec = volume.nomeTecnico || volumeClassification?.nomeTecnico || nomeTecnico
    const volumeClassif = volume.classificacao || volumeClassification?.classificacao || classificacao
    
    // Check if dangerous goods section should be shown
    const shouldShowDangerousGoods = isVolumePerigoso && (volumeONU || produtoPerigoso)
    
    if (shouldShowDangerousGoods) {
      const containerX = margin + 2
      const containerWidth = pageWidth - (margin * 2) - 4
      const headerHeight = isSmallFormat ? 8 : 9
      const rowHeight = isSmallFormat ? 8 : 9
      const containerHeight = headerHeight + (rowHeight * 3) + 1 // Header + 3 data rows + minimal padding
      const textPadding = 2 // 2mm padding for text from field borders
      
      // Red header background only - no outer black border
      pdf.setFillColor(220, 38, 38)
      pdf.rect(containerX, currentY, containerWidth, headerHeight, 'F')
      
      // Header text - cleaner look
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(isSmallFormat ? 8 : 10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('PRODUTO PERIGOSO', containerX + textPadding, currentY + (headerHeight * 0.65))
      
      // Class badge (black box on right)
      const classBadgeWidth = isSmallFormat ? 22 : 26
      pdf.setFillColor(0, 0, 0)
      pdf.rect(containerX + containerWidth - classBadgeWidth, currentY, classBadgeWidth, headerHeight, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(isSmallFormat ? 6 : 8)
      pdf.text(`CLASSE ${volumeONU || '321'}`, containerX + containerWidth - classBadgeWidth + 2, currentY + (headerHeight * 0.65))
      
      let dataY = currentY + headerHeight
      
      // First row: ONU and RISCO side by side - only red borders with 2mm text padding
      const halfWidth = (containerWidth - 2) / 2 // 2mm gap between fields
      
      // ONU field - transparent borders
      pdf.setFillColor(255, 255, 255)
      pdf.setDrawColor(255, 255, 255)
      pdf.setLineWidth(0)
      pdf.rect(containerX, dataY, halfWidth, rowHeight, 'F')
      pdf.setTextColor(220, 38, 38)
      pdf.setFontSize(isSmallFormat ? 7 : 9)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ONU:', containerX + textPadding, dataY + textPadding + 1) // 2mm from top border
      pdf.setFontSize(isSmallFormat ? 8 : 10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(volumeONU || '321', containerX + textPadding, dataY + (rowHeight - textPadding))
      
      // RISCO field - transparent borders
      pdf.setFillColor(255, 255, 255)
      pdf.setDrawColor(255, 255, 255)
      pdf.setLineWidth(0)
      pdf.rect(containerX + halfWidth + 2, dataY, halfWidth, rowHeight, 'F')
      pdf.setFontSize(isSmallFormat ? 7 : 9)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RISCO:', containerX + halfWidth + 2 + textPadding, dataY + textPadding + 1) // 2mm from top border
      pdf.setFontSize(isSmallFormat ? 8 : 10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(produtoPerigoso?.numeroRisco || volumeRisco || '321', containerX + halfWidth + 2 + textPadding, dataY + (rowHeight - textPadding))
      
      dataY += rowHeight
      
      // Second row: NOME TÉCNICO - transparent borders
      pdf.setFillColor(255, 255, 255)
      pdf.setDrawColor(255, 255, 255)
      pdf.setLineWidth(0)
      pdf.rect(containerX, dataY, containerWidth, rowHeight, 'F')
      pdf.setFontSize(isSmallFormat ? 7 : 9)
      pdf.setFont('helvetica', 'bold')
      pdf.text('NOME TÉCNICO:', containerX + textPadding, dataY + textPadding + 1) // 2mm from top border
      pdf.setFontSize(isSmallFormat ? 7 : 9)
      pdf.setFont('helvetica', 'normal')
      const nomeText = (produtoPerigoso?.produto || volumeNomeTec || '321').substring(0, isSmallFormat ? 32 : 48)
      pdf.text(nomeText, containerX + textPadding, dataY + (rowHeight - textPadding))
      
      dataY += rowHeight
      
      // Third row: CLASSIFICAÇÃO - transparent borders
      pdf.setFillColor(255, 255, 255)
      pdf.setDrawColor(255, 255, 255)
      pdf.setLineWidth(0)
      pdf.rect(containerX, dataY, containerWidth, rowHeight, 'F')
      pdf.setFontSize(isSmallFormat ? 7 : 9)
      pdf.setFont('helvetica', 'bold')
      pdf.text('CLASSIFICAÇÃO:', containerX + textPadding, dataY + textPadding + 1) // 2mm from top border
      pdf.setFontSize(isSmallFormat ? 7 : 9)
      pdf.setFont('helvetica', 'normal')
      
      // Get full classification text - use individual volume classification
      const getFullClassificationText = () => {
        if (volumeClassif === 'cargas-nao-classificadas') return 'Cargas Não Classificadas'
        const classif = classificacoes.find(c => c.value === volumeClassif)
        return classif ? classif.label : (volumeClassif || classificacao || 'Classe 1 - Explosivos')
      }
      
      const fullClassText = getFullClassificationText()
      const truncatedClassText = isSmallFormat ? fullClassText.substring(0, 38) : fullClassText.substring(0, 52)
      pdf.text(truncatedClassText, containerX + textPadding, dataY + (rowHeight - textPadding))
      
      currentY += containerHeight + 3
    }

    // Cidade/UF - Black background with white text
    const cidadeHeight = isSmallFormat ? 6 : 8
    pdf.setFillColor(0, 0, 0) // Black background
    pdf.rect(margin + 2, currentY, pageWidth - (margin * 2) - 4, cidadeHeight, 'F')
    
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFontSize(isSmallFormat ? 8 : 12)
    pdf.setFont('helvetica', 'bold')
    const cidadeText = `Cidade/UF: ${notaFiscalData?.destinatario_cidade || volume.cidadeDestino || 'SAO LUIS'} ${notaFiscalData?.destinatario_uf || volume.ufDestino || 'MA'}`
    pdf.text(cidadeText, margin + 4, currentY + (cidadeHeight * 0.65))
    currentY += cidadeHeight + 4

    // Bottom section details with highlighted peso and volume
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(isSmallFormat ? 7 : 9)
    pdf.setFont('helvetica', 'normal')
    
    // Peso - Black background with white text like Cidade/UF
    const pesoHeight = isSmallFormat ? 4 : 5
    const pesoWidth = isSmallFormat ? 25 : 35
    pdf.setFillColor(0, 0, 0) // Black background
    pdf.rect(margin + 2, currentY - 1, pesoWidth, pesoHeight, 'F')
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Peso: ${pesoTotal || volume.peso || '16.200'}`, margin + 4, currentY + (pesoHeight * 0.6))
    currentY += pesoHeight + 2
    
    pdf.setTextColor(0, 0, 0) // Reset to black
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Transportadora: ${transportadoraText}`, margin + 2, currentY)
    currentY += isSmallFormat ? 3 : 4
    
    // Volume - Black background with white text like Cidade/UF
    const volumeHeight = isSmallFormat ? 4 : 5
    const volumeWidth = isSmallFormat ? 20 : 30
    pdf.setFillColor(0, 0, 0) // Black background
    pdf.rect(margin + 2, currentY - 1, volumeWidth, volumeHeight, 'F')
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Volume: ${volume.volume || '1/2'}`, margin + 4, currentY + (volumeHeight * 0.6))

    // ÁREA - Large black box with white text (bottom right)
    const areaBoxSize = isSmallFormat ? 18 : 24
    const areaBoxX = pageWidth - margin - areaBoxSize - 2
    const areaBoxY = pageHeight - margin - areaBoxSize - 2
    
    pdf.setFillColor(0, 0, 0) // Black background
    pdf.rect(areaBoxX, areaBoxY, areaBoxSize, areaBoxSize, 'F')
    
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFontSize(isSmallFormat ? 6 : 8)
    pdf.setFont('helvetica', 'bold')
    pdf.text('ÁREA', areaBoxX + (areaBoxSize * 0.5), areaBoxY + (areaBoxSize * 0.3), { align: 'center' })
    
    pdf.setFontSize(isSmallFormat ? 12 : 16)
    pdf.setFont('helvetica', 'bold')
    const areaNumber = selectedArea ? selectedArea.replace('Área ', '') : '01'
    pdf.text(areaNumber, areaBoxX + (areaBoxSize * 0.5), areaBoxY + (areaBoxSize * 0.7), { align: 'center' })
    
    // CROSS WMS watermark at footer - subtle and discreet
    pdf.setTextColor(128, 128, 128) // Gray for watermark effect
    pdf.setFontSize(isSmallFormat ? 4 : 6)
    pdf.setFont('helvetica', 'normal')
    pdf.text('CROSS WMS', margin + 2, pageHeight - margin - 1)
    
    // Reset text color
    pdf.setTextColor(0, 0, 0)
  }

  // Universal label PDF function - exact 99.99% match to preview layout
  const addA4LabelToPDF = async (pdf: jsPDF, volume: any, qrCodeDataURL: string) => {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Calculate scaling factors based on format
    const isSmallFormat = selectedFormato !== 'a4'
    const margin = isSmallFormat ? 2 : 3
    let currentY = margin + 15
    
    // Add transparent border around entire label
    pdf.setDrawColor(255, 255, 255) // Transparent border
    pdf.setLineWidth(0)
    
    // Client logo detection for A4 format
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const userCompany = currentUser?.empresa || volume.transportadora || 'Transportadora não especificada'
    
    let transportadoraText = userCompany
    
    // Check for specific clients with logos
    if (userCompany.toLowerCase().includes('transul') || transportadoraText.includes('Transportadora não especificada')) {
      transportadoraText = 'TRANSUL TRANSPORTE'
      
      // Create framed and centered Transul logo in A4 PDF header
      pdf.setFillColor(0, 0, 0)
      pdf.setFont('helvetica', 'bold')
      
      // Logo positioning with 2mm spacing from top (no border frame)
      const headerBoxHeight = isSmallFormat ? 12 : 16
      const spacingFromTop = 2 // 2mm spacing
      const logoAreaY = margin + spacingFromTop
      const logoAreaHeight = headerBoxHeight - spacingFromTop
      
      // Center the logo text within the area
      const logoScale = isSmallFormat ? 0.9 : 1.2
      const logoX = margin + ((pageWidth - (margin * 2)) / 2)
      const logoY = logoAreaY + (logoAreaHeight / 2)
      
      // Main "Transul" text - centered
      pdf.setFontSize(isSmallFormat ? 14 : 18)
      pdf.text('Transul', logoX, logoY - (1 * logoScale), { align: 'center' })
      
      // Subtitle "TRANSPORTE" - centered below
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(isSmallFormat ? 6 : 8)
      pdf.text('TRANSPORTE', logoX, logoY + (2 * logoScale), { align: 'center' })
      
      // Update current Y position to start after the framed header
      currentY = margin + headerBoxHeight + 3
      
    } else if (userCompany.toLowerCase().includes('cross')) {
      transportadoraText = 'CROSS LOGISTICS'
      pdf.setFontSize(isSmallFormat ? 9 : 14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text(transportadoraText, margin + 3, margin + 8)
      currentY = margin + 15
    } else {
      pdf.setFontSize(isSmallFormat ? 9 : 14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text(transportadoraText, margin + 3, margin + 8)
      currentY = margin + 15
    }
    
    // Add QR Code - optimized size and positioning
    const qrSize = isSmallFormat ? 12 : 18
    pdf.addImage(qrCodeDataURL, 'PNG', pageWidth - margin - qrSize - 2, margin + 2, qrSize, qrSize)

    // Volume ID - increased by 30% for better readability
    pdf.setFontSize(isSmallFormat ? 7 : 9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100) // Gray text like preview
    // Use the proper database ID format that matches the database record
    const volumeId = volume.id || volume.codigo || generateVolumeId(notaFiscal || '111007', Number(volume.numeroVolume) || 1, parseInt(quantidadeVolumes?.toString() || '1'))
    pdf.text(`ID: ${volumeId}`, margin + 3, currentY)
    currentY += isSmallFormat ? 3 : 4
    
    // Data de Entrada - extraída do código temporal
    const formatEntryDate = (codigo: string): string => {
      // Extrai data do formato: NOTA-VOL-DDMMYYYY-HHMM
      const parts = codigo.split('-')
      if (parts.length >= 4) {
        const datePart = parts[2] // DDMMYYYY
        const timePart = parts[3] // HHMM
        
        if (datePart.length === 8 && timePart.length === 4) {
          const day = datePart.substring(0, 2)
          const month = datePart.substring(2, 4)
          const year = datePart.substring(4, 8)
          const hour = timePart.substring(0, 2)
          const minute = timePart.substring(2, 4)
          
          return `${day}/${month}/${year} ${hour}:${minute}`
        }
      }
      
      // Fallback para data/hora atual
      return new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    pdf.setFontSize(isSmallFormat ? 12 : 16) // Aumentado 100%
    pdf.setFont('helvetica', 'bold') // Negrito
    pdf.setTextColor(60, 60, 60) // Darker gray for readability
    const entryDate = formatEntryDate(volumeId)
    pdf.text(`Entrada: ${entryDate}`, margin + 3, currentY)
    currentY += isSmallFormat ? 4 : 5
    
    // NF Number (yellow background) - increased by 30% for better readability
    const nfBoxWidth = isSmallFormat ? 35 : 50
    const nfBoxHeight = isSmallFormat ? 8 : 10
    pdf.setFillColor(255, 235, 59) // Exact yellow from preview
    pdf.rect(margin + 3, currentY, nfBoxWidth, nfBoxHeight, 'F')
    pdf.setFontSize(isSmallFormat ? 12 : 18)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    const nfNumber = notaFiscal || notaFiscalData?.numero || volume.notaFiscal || '11340'
    pdf.text(`NF: ${nfNumber}`, margin + 4, currentY + (nfBoxHeight * 0.7))
    currentY += nfBoxHeight + (isSmallFormat ? 3 : 4)

    // Número do Pedido (light gray background) - same format as sender
    const pedidoBoxHeight = isSmallFormat ? 7 : 9
    pdf.setFillColor(220, 220, 220) // Light gray background
    pdf.rect(margin + 3, currentY, pageWidth - (margin * 2) - 6, pedidoBoxHeight, 'F')
    pdf.setFontSize(isSmallFormat ? 8 : 10)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    const numeroPedidoA4 = notaFiscalData?.numero_pedido || 'N/A'
    pdf.text(`Pedido: ${numeroPedidoA4}`, margin + 4, currentY + (pedidoBoxHeight * 0.7))
    currentY += pedidoBoxHeight + 2
    
    // Sender info (light blue background) - increased by 30% for better readability
    const senderBoxHeight = isSmallFormat ? 7 : 9
    pdf.setFillColor(187, 222, 251) // Light blue from preview
    pdf.rect(margin + 3, currentY, pageWidth - (margin * 2) - 6, senderBoxHeight, 'F')
    pdf.setFontSize(isSmallFormat ? 8 : 10)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    const senderText = notaFiscalData?.emitente_razao_social || 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA'
    const truncatedSender = isSmallFormat ? senderText.substring(0, 32) : senderText
    pdf.text(`Remetente: ${truncatedSender}`, margin + 4, currentY + (senderBoxHeight * 0.7))
    currentY += senderBoxHeight + 2
    
    // Recipient info - increased by 30% for better readability
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(isSmallFormat ? 8 : 10)
    pdf.setTextColor(0, 0, 0)
    const recipientText = notaFiscalData?.destinatario_razao_social || 'CONSORCIO DE ALUMINIO DO MARANHAO CONSORCIO ALUMAR'
    const truncatedRecipient = isSmallFormat ? recipientText.substring(0, 35) : recipientText
    pdf.text(`Destinatário: ${truncatedRecipient}`, margin + 3, currentY)
    currentY += isSmallFormat ? 4 : 5
    
    // Address - complete destination information including CEP
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(isSmallFormat ? 8 : 10)
    const address = notaFiscalData?.destinatario_endereco || 'RODOVIA BR 135'
    const addressCity = notaFiscalData?.destinatario_cidade || 'SAO LUIS'
    const addressState = notaFiscalData?.destinatario_uf || 'MA'
    const cep = notaFiscalData?.destinatario_cep || '65110-000'
    const completeAddress = `${address}, ${addressCity} - ${addressState}, CEP: ${cep}`
    const truncatedAddress = isSmallFormat ? completeAddress.substring(0, 45) : completeAddress.substring(0, 65)
    pdf.text(`Endereço: ${truncatedAddress}`, margin + 3, currentY)
    currentY += isSmallFormat ? 4 : 5
    
    // City/State (light green background) - increased by 30% for better readability
    const cityBoxHeight = isSmallFormat ? 7 : 9
    pdf.setFillColor(200, 230, 201) // Light green from preview
    pdf.rect(margin + 3, currentY, pageWidth - (margin * 2) - 6, cityBoxHeight, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(isSmallFormat ? 8 : 10)
    pdf.setTextColor(0, 0, 0)
    pdf.text(`Cidade/UF: ${addressCity} /${addressState}`, margin + 4, currentY + (cityBoxHeight * 0.7))
    currentY += cityBoxHeight + 3
    
    // Dangerous goods section - prioritize volume object properties over global settings
    const volumeClassification = volumeClassifications[volume.codigo]
    const isVolumePerigoso = volume.tipo === 'Produto Perigoso' || volumeClassification?.tipo === 'Produto Perigoso' || selectedTipo === 'Produto Perigoso'
    const volumeONU = volume.numeroONU || volumeClassification?.codigoONU || codigoONU
    const volumeRisco = volume.numeroRisco || volumeClassification?.codigoRisco || codigoRisco
    const volumeNomeTec = volume.nomeTecnico || volumeClassification?.nomeTecnico || nomeTecnico
    const volumeClassif = volume.classificacao || volumeClassification?.classificacao || classificacao
    
    if (isVolumePerigoso && (volumeONU || produtoPerigoso)) {
      const dangerBoxHeight = isSmallFormat ? 22 : 30
      const dangerBoxWidth = pageWidth - (margin * 2) - (isSmallFormat ? 15 : 22)
      
      // Transparent border for dangerous goods container
      pdf.setDrawColor(255, 255, 255) // Transparent border
      pdf.setLineWidth(0)
      
      // Warning icon and header with class badge
      pdf.setFillColor(255, 235, 238) // Light red background
      pdf.rect(margin + 3, currentY, dangerBoxWidth, isSmallFormat ? 3 : 4, 'F')
      pdf.setFontSize(isSmallFormat ? 4 : 6)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(220, 38, 127) // Red text
      pdf.text('⚠ PRODUTO PERIGOSO', margin + 4, currentY + (isSmallFormat ? 2.5 : 3))
      
      // Class badge on the right - exact match to preview
      const classBadgeWidth = isSmallFormat ? 12 : 16
      const classBadgeHeight = isSmallFormat ? 3 : 4
      pdf.setFillColor(220, 38, 127) // Red background
      pdf.rect(margin + 3 + dangerBoxWidth - classBadgeWidth, currentY, classBadgeWidth, classBadgeHeight, 'F')
      pdf.setTextColor(255, 255, 255) // White text
      pdf.setFontSize(isSmallFormat ? 4 : 5)
      pdf.text(`CLASSE ${volumeONU || produtoPerigoso?.numeroONU || '321'}`, margin + 4 + dangerBoxWidth - classBadgeWidth, currentY + (isSmallFormat ? 2.5 : 3))
      
      currentY += isSmallFormat ? 4 : 5
      
      // Information grid - exact layout from preview
      pdf.setTextColor(0, 0, 0) // Black text
      pdf.setFontSize(isSmallFormat ? 4 : 5)
      pdf.setFont('helvetica', 'normal')
      
      const gridY = currentY
      const gridItemHeight = isSmallFormat ? 2.5 : 3.5
      const gridItemWidth = (dangerBoxWidth - 2) / 2
      
      // ONU field
      pdf.setFillColor(255, 255, 255) // White background
      pdf.rect(margin + 4, gridY, gridItemWidth - 0.5, gridItemHeight, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.text('ONU:', margin + 4.5, gridY + (gridItemHeight * 0.7))
      pdf.setFont('helvetica', 'normal')
      pdf.text(volumeONU || produtoPerigoso?.numeroONU || '321', margin + 4.5 + 8, gridY + (gridItemHeight * 0.7))
      
      // RISCO field
      pdf.setFillColor(255, 255, 255)
      pdf.rect(margin + 4 + gridItemWidth, gridY, gridItemWidth - 0.5, gridItemHeight, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.text('RISCO:', margin + 4.5 + gridItemWidth, gridY + (gridItemHeight * 0.7))
      pdf.setFont('helvetica', 'normal')
      pdf.text(volumeRisco || produtoPerigoso?.numeroRisco || '32', margin + 4.5 + gridItemWidth + 10, gridY + (gridItemHeight * 0.7))
      
      // CLASSE field
      const gridY2 = gridY + gridItemHeight + 0.5
      pdf.setFillColor(255, 255, 255)
      pdf.rect(margin + 4, gridY2, gridItemWidth - 0.5, gridItemHeight, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.text('CLASSE:', margin + 4.5, gridY2 + (gridItemHeight * 0.7))
      pdf.setFont('helvetica', 'normal')
      pdf.text(classe || produtoPerigoso?.classeRisco || '321', margin + 4.5 + 12, gridY2 + (gridItemHeight * 0.7))
      
      // CLASSIF field
      pdf.setFillColor(255, 255, 255)
      pdf.rect(margin + 4 + gridItemWidth, gridY2, gridItemWidth - 0.5, gridItemHeight, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.text('CLASSIF:', margin + 4.5 + gridItemWidth, gridY2 + (gridItemHeight * 0.7))
      pdf.setFont('helvetica', 'normal')
      const getClassifText = () => {
        const classif = classificacoes.find(c => c.value === volumeClassif)
        return classif ? classif.label.replace(/^Classe \d+ - /, '') : '1 - Explosivos'
      }
      const classifText = getClassifText()
      const truncatedClassif = isSmallFormat ? classifText.substring(0, 8) : classifText.substring(0, 15)
      pdf.text(truncatedClassif, margin + 4.5 + gridItemWidth + 14, gridY2 + (gridItemHeight * 0.7))
      
      // NOME TÉCNICO field
      const gridY3 = gridY2 + gridItemHeight + 0.5
      pdf.setFillColor(255, 255, 255)
      pdf.rect(margin + 4, gridY3, dangerBoxWidth - 2, gridItemHeight, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.text('NOME TÉCNICO:', margin + 4.5, gridY3 + (gridItemHeight * 0.7))
      pdf.setFont('helvetica', 'normal')
      pdf.text(volumeNomeTec || produtoPerigoso?.produto || '3', margin + 4.5 + 22, gridY3 + (gridItemHeight * 0.7))
      
      // Warning message at bottom
      const warningY = gridY3 + gridItemHeight + 0.5
      pdf.setFillColor(220, 38, 127) // Red background
      pdf.rect(margin + 4, warningY, dangerBoxWidth - 2, isSmallFormat ? 2.5 : 3, 'F')
      pdf.setTextColor(255, 255, 255) // White text
      pdf.setFontSize(isSmallFormat ? 3.5 : 4.5)
      pdf.setFont('helvetica', 'bold')
      pdf.text('⚠ MANUSEIO ESPECIALIZADO OBRIGATÓRIO', margin + 4.5, warningY + (isSmallFormat ? 2 : 2.5))
      
      currentY += dangerBoxHeight + (isSmallFormat ? 2 : 3)
      pdf.setTextColor(0, 0, 0) // Reset to black
    }
    
    // Bottom section with optimized layout - increased by 30% for better readability
    const bottomSectionY = currentY
    
    // Left side: Weight, transporter and description with highlighted peso and volume
    const weight = pesoTotal || '16.200'
    
    // Peso - Black background with white text
    const pesoHeight = isSmallFormat ? 4 : 6
    const pesoWidth = isSmallFormat ? 25 : 35
    pdf.setFillColor(0, 0, 0) // Black background
    pdf.rect(margin + 3, bottomSectionY - 1, pesoWidth, pesoHeight, 'F')
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(isSmallFormat ? 8 : 10)
    pdf.text(`Peso: ${weight}`, margin + 4, bottomSectionY + (pesoHeight * 0.6))
    
    // Transportadora - normal text with client detection
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(isSmallFormat ? 7 : 9)
    
    // Use same client detection logic
    const currentUserA4 = JSON.parse(localStorage.getItem('user') || '{}')
    const userCompanyA4 = currentUserA4?.empresa || volume.transportadora || 'Transportadora não especificada'
    
    let transportadoraTextA4 = userCompanyA4
    if (userCompanyA4.toLowerCase().includes('transul') || transportadoraTextA4.includes('Transportadora não especificada')) {
      transportadoraTextA4 = 'TRANSUL TRANSPORTE'
    } else if (userCompanyA4.toLowerCase().includes('cross')) {
      transportadoraTextA4 = 'CROSS LOGISTICS'
    }
    
    pdf.text(`Transportadora: ${transportadoraTextA4}`, margin + 3, bottomSectionY + pesoHeight + (isSmallFormat ? 2 : 3))
    
    // Volume - Black background with white text
    const volumeText = `Volume ${volume.volume || '1/2'}`
    const volumeHeight = isSmallFormat ? 4 : 6
    const volumeWidth = isSmallFormat ? 20 : 30
    const volumeY = bottomSectionY + pesoHeight + (isSmallFormat ? 5 : 7)
    pdf.setFillColor(0, 0, 0) // Black background
    pdf.rect(margin + 3, volumeY - 1, volumeWidth, volumeHeight, 'F')
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(isSmallFormat ? 8 : 10)
    pdf.text(`Volume: ${volume.volume || '1/2'}`, margin + 4, volumeY + (volumeHeight * 0.6))
    
    // Area (blue box on the right) - increased by 30% for better readability
    const areaBoxWidth = isSmallFormat ? 18 : 26
    const areaBoxHeight = isSmallFormat ? 18 : 26
    const areaBoxX = pageWidth - margin - areaBoxWidth - 3
    const areaBoxY = bottomSectionY - 2
    
    pdf.setFillColor(33, 150, 243) // Blue from preview
    pdf.rect(areaBoxX, areaBoxY, areaBoxWidth, areaBoxHeight, 'F')
    
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFontSize(isSmallFormat ? 8 : 10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('ÁREA', areaBoxX + (areaBoxWidth * 0.3), areaBoxY + (areaBoxHeight * 0.3))
    pdf.setFontSize(isSmallFormat ? 16 : 20)
    pdf.setFont('helvetica', 'bold')
    const areaNumber = selectedArea ? selectedArea.replace('Área ', '') : '03'
    pdf.text(areaNumber, areaBoxX + (areaBoxWidth * 0.45), areaBoxY + (areaBoxHeight * 0.7))
    
    // CROSS WMS watermark at footer - subtle and discreet
    pdf.setTextColor(128, 128, 128) // Gray for watermark effect
    pdf.setFontSize(isSmallFormat ? 4 : 6)
    pdf.setFont('helvetica', 'normal')
    pdf.text('CROSS WMS', margin + 2, pageHeight - margin - 1)
    
    // Reset text color
    pdf.setTextColor(0, 0, 0)
  }

  // Add small format label to PDF
  const addSmallLabelToPDF = async (pdf: jsPDF, volume: any, qrCodeDataURL: string) => {
    const pageWidth = pdf.internal.pageSize.getWidth()
    
    // Scaled down version for small labels
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Transportadora', 2, 8)
    
    // Add QR Code
    pdf.addImage(qrCodeDataURL, 'PNG', pageWidth - 18, 2, 15, 15)
    
    // Volume info
    pdf.setFontSize(6)
    pdf.text(`ID: ${volume.codigo}`, 2, 15)
    
    // NF Number
    pdf.setFillColor(255, 255, 0)
    pdf.rect(2, 18, 25, 5, 'F')
    pdf.setFontSize(8)
    pdf.text(`NF: ${volume.notaFiscal}`, 3, 21)
    
    // Basic info
    pdf.setFontSize(5)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Remetente: ${(notaFiscalData?.emitente_razao_social || 'Não informado').substring(0, 30)}`, 2, 30)
    pdf.text(`Destinatário: ${(notaFiscalData?.destinatario_razao_social || 'Não informado').substring(0, 30)}`, 2, 35)
    pdf.text(`Peso: ${notaFiscalData?.peso_bruto || 'N/A'}`, 2, 45)
    pdf.text(`Volume: ${volume.volume}`, 2, 50)
    
    // Area
    pdf.setFillColor(59, 130, 246)
    pdf.rect(pageWidth - 15, 45, 12, 12, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.text(selectedArea ? selectedArea.replace('Área ', '') : '01', pageWidth - 11, 52)
    
    pdf.setTextColor(0, 0, 0)
  }

  // Handle downloading PDF
  const handleDownloadPDF = async () => {
    if (selectedVolumes.length === 0) {
      toast.warning('Selecione ao menos um volume para baixar o PDF')
      return
    }

    const volumes = currentNotaVolumes.filter(v => selectedVolumes.includes(v.codigo))
    await generateLabelPDF(volumes, 'download')
  }

  // Handle printing selected volumes
  const handlePrintSelected = async () => {
    if (selectedVolumes.length === 0) {
      toast.warning('Selecione ao menos um volume para imprimir')
      return
    }

    try {
      const volumes = currentNotaVolumes.filter(v => selectedVolumes.includes(v.codigo))
      await generateLabelPDF(volumes, 'print')
      
      // Update status to "Impressa" for selected volumes
      const updatedVolumes = currentNotaVolumes.map(volume => {
        if (selectedVolumes.includes(volume.codigo)) {
          return { ...volume, status: 'Impressa' as const }
        }
        return volume
      })
      setCurrentNotaVolumes(updatedVolumes)
      setSelectedVolumes([])
    } catch (error) {
      console.error('Erro ao imprimir etiquetas:', error)
      toast.error('Erro ao imprimir etiquetas')
    }
  }

  // Handle generating parent label (Mix)
  const handleGerarEtiquetaMae = () => {
    if (!mixEtiquetaConfig.descricao || !mixEtiquetaConfig.tipo) {
      toast.warning('Preencha todos os campos obrigatórios')
      return
    }

    const now = new Date()
    const newEtiquetaMae = {
      id: `ETQM-${now.getTime()}`,
      descricao: mixEtiquetaConfig.descricao,
      tipo: mixEtiquetaConfig.tipo,
      volumes: 0, // Will be updated when volumes are linked
      pesoTotal: '0.000',
      cidadeDestino: notaFiscalData?.destinatario_cidade || 'SÃO PAULO',
      ufDestino: notaFiscalData?.destinatario_uf || 'SP',
      volumesVinculados: [],
      dataCriacao: now.toLocaleDateString('pt-BR'),
      status: 'Ativa'
    }

    setMixEtiquetasList(prev => [newEtiquetaMae, ...prev])
    
    // Reset form
    setMixEtiquetaConfig(prev => ({
      ...prev,
      descricao: '',
      numeroEtiqueta: `${Math.floor(Math.random() * 900000) + 100000}`
    }))

    toast.success(`Etiqueta mãe ${newEtiquetaMae.id} criada com sucesso`)
  }

  // Handle viewing Mix label details
  const handleViewMixEtiqueta = (etiqueta: any) => {
    setSelectedMixEtiqueta(etiqueta)
    setViewMixDialogOpen(true)
  }

  // Handle linking volumes to Mix label
  const handleLinkVolumes = (etiqueta: any) => {
    setSelectedMixEtiqueta(etiqueta)
    // Get available volumes that are not already linked
    const available = currentNotaVolumes.filter(vol => 
      !etiqueta.volumesVinculados?.includes(vol.codigo)
    )
    setAvailableVolumesForLink(available)
    setSelectedVolumesForLink([])
    setLinkVolumesDialogOpen(true)
  }

  // Handle saving linked volumes
  const handleSaveLinkVolumes = () => {
    if (!selectedMixEtiqueta || selectedVolumesForLink.length === 0) {
      toast.warning('Selecione pelo menos um volume para vincular')
      return
    }

    const updatedEtiquetas = mixEtiquetasList.map(etiqueta => {
      if (etiqueta.id === selectedMixEtiqueta?.id) {
        const newLinkedVolumes = [...(etiqueta.volumesVinculados || []), ...selectedVolumesForLink]
        const linkedVolumesData = currentNotaVolumes.filter(vol => newLinkedVolumes.includes(vol.codigo))
        const totalWeight = linkedVolumesData.reduce((sum, vol) => sum + (parseFloat(pesoTotal) / currentNotaVolumes.length || 0), 0)
        
        return {
          ...etiqueta,
          volumesVinculados: newLinkedVolumes,
          volumes: newLinkedVolumes.length,
          pesoTotal: totalWeight.toFixed(2)
        }
      }
      return etiqueta
    })

    setMixEtiquetasList(updatedEtiquetas)
    setLinkVolumesDialogOpen(false)
    toast.success(`${selectedVolumesForLink.length} volume(s) vinculado(s) com sucesso`)
  }

  // Generate QR Code for Mix label
  const generateMixQRCode = async (etiquetaId: string): Promise<string> => {
    try {
      const qrData = `ETIQUETA_MAE:${etiquetaId}`
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      return qrCodeDataURL
    } catch (error) {
      console.error('Error generating QR code:', error)
      return ''
    }
  }

  // Handle printing Mix label
  const handlePrintMixEtiqueta = async (etiqueta: any) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 150] // 100x150mm format
      })

      const pageWidth = 100
      const pageHeight = 150
      const margin = 8

      // Generate QR Code
      const qrCodeDataURL = await generateMixQRCode(etiqueta.id)

      // Add Transul Logo at the top (centered)
      const logoHeight = 12
      const logoWidth = 40
      const logoX = (pageWidth - logoWidth) / 2
      
      // Create Transul logo as text since we don't have the image file
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0) // Black color
      pdf.text('Transul', pageWidth / 2, 10, { align: 'center' })
      
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text('TRANSPORTE', pageWidth / 2, 15, { align: 'center' })

      // Title - ETIQUETA MÃE (Large, prominent)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(220, 38, 127) // Pink/magenta color
      pdf.text('ETIQUETA MÃE', pageWidth / 2, 25, { align: 'center' })

      // ID único da etiqueta mãe (highlighted)
      pdf.setFillColor(255, 255, 0) // Yellow background
      pdf.rect(margin, 30, pageWidth - (margin * 2), 8, 'F')
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text(`ID: ${etiqueta.id}`, pageWidth / 2, 36, { align: 'center' })

      // QR Code (Large, prominent position)
      if (qrCodeDataURL) {
        const qrSize = 35
        const qrX = (pageWidth - qrSize) / 2
        pdf.addImage(qrCodeDataURL, 'PNG', qrX, 42, qrSize, qrSize)
      }

      // Cidade principal / UF Destino (Large highlight)
      const currentY = 82
      pdf.setFillColor(76, 175, 80) // Green background
      pdf.rect(margin, currentY, pageWidth - (margin * 2), 12, 'F')
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(255, 255, 255) // White text
      pdf.text(`DESTINO: ${etiqueta.cidadeDestino || 'SÃO PAULO'} / ${etiqueta.ufDestino || 'SP'}`, pageWidth / 2, currentY + 8, { align: 'center' })

      // Quantidade de volumes
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text(`Quantidade de Volumes: ${etiqueta.volumes || 0}`, margin, currentY + 20)

      // Peso total dos volumes (highlighted)
      pdf.setFillColor(0, 0, 0) // Black background
      pdf.rect(margin, currentY + 25, pageWidth - (margin * 2), 10, 'F')
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(255, 255, 255) // White text
      pdf.text(`PESO TOTAL: ${etiqueta.pesoTotal || '0.000'} kg`, pageWidth / 2, currentY + 32, { align: 'center' })

      // Additional information
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Tipo: ${etiqueta.tipo}`, margin, currentY + 42)
      pdf.text(`Descrição: ${etiqueta.descricao}`, margin, currentY + 47)
      pdf.text(`Data Criação: ${etiqueta.dataCriacao}`, margin, currentY + 52)

      // Volumes vinculados (if any)
      if (etiqueta.volumesVinculados && etiqueta.volumesVinculados.length > 0) {
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Volumes Vinculados:', margin, currentY + 60)
        
        etiqueta.volumesVinculados.slice(0, 8).forEach((volumeId: string, index: number) => {
          pdf.setFont('helvetica', 'normal')
          pdf.text(`• ${volumeId}`, margin + 2, currentY + 65 + (index * 4))
        })

        if (etiqueta.volumesVinculados.length > 8) {
          pdf.text(`... e mais ${etiqueta.volumesVinculados.length - 8} volume(s)`, margin + 2, currentY + 97)
        }
      }

      // Footer with company info
      pdf.setFontSize(7)
      pdf.setFont('helvetica', 'italic')
      pdf.setTextColor(128, 128, 128)
      pdf.text('CROSS WMS - Sistema de Gerenciamento', pageWidth / 2, pageHeight - 10, { align: 'center' })

      // Open print dialog
      const pdfBlob = pdf.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      window.open(pdfUrl, '_blank')

      toast.success('Etiqueta mãe enviada para impressão')
    } catch (error) {
      console.error('Erro ao imprimir etiqueta mãe:', error)
      toast.error('Erro ao imprimir etiqueta mãe')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'Pendente': 'secondary',
      'Gerada': 'default',
      'Impressa': 'outline',
      'Processada': 'destructive'
    } as const

    const colors = {
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Gerada': 'bg-green-100 text-green-800',
      'Impressa': 'bg-blue-100 text-blue-800',
      'Processada': 'bg-gray-100 text-gray-800'
    }

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Geração de Etiquetas</h1>
            <p className="text-gray-600">Geração de Etiquetas por Volume</p>
            <p className="text-sm text-gray-500">
              Gere etiquetas de identificação única para cada volume ou etiquetas mais para agrupamento.
            </p>
          </div>
          <div className="flex gap-3">
            <EnhancedButton
              variant="outline"
              onClick={async () => {
                console.log('Voltar: Tentando recuperar dados da ordem origem');
                
                // Recuperar informações da ordem de origem
                const ordemOrigemData = sessionStorage.getItem('ordem_origem_etiqueta');
                console.log('Voltar: Dados encontrados no sessionStorage:', ordemOrigemData);
                
                if (ordemOrigemData) {
                  try {
                    const ordemOrigem = JSON.parse(ordemOrigemData);
                    console.log('Voltar: Dados parseados:', ordemOrigem);
                    
                    // SEMPRE construir URL de edição quando temos ordem_id
                    let rotaDestino;
                    
                    if (ordemOrigem.ordem_id) {
                      // Construir URL de edição reutilizável baseada na origem
                      if (ordemOrigem.rota_origem_real?.includes('/fila-x')) {
                        rotaDestino = `/armazenagem/fila-x?mode=edit&id=${ordemOrigem.ordem_id}`;
                      } else if (ordemOrigem.rota_origem_real?.includes('/recebimento')) {
                        rotaDestino = `/armazenagem/recebimento/ordemrecebimento?mode=edit&id=${ordemOrigem.ordem_id}`;
                      } else if (ordemOrigem.rota_origem_real?.includes('/carregamento')) {
                        rotaDestino = `/armazenagem/carregamento?mode=edit&id=${ordemOrigem.ordem_id}`;
                      } else {
                        // Fallback inteligente para fila-x se não conseguir determinar origem
                        rotaDestino = `/armazenagem/fila-x?mode=edit&id=${ordemOrigem.ordem_id}`;
                      }
                    } else {
                      // Sem ordem_id, usar rota original ou fallback
                      rotaDestino = ordemOrigem.rota_origem_real || '/armazenagem/carregamento';
                    }
                    
                    console.log('Voltar: Rota de destino construída (sempre em modo edição):', rotaDestino);
                    
                    // Marcar etiqueta como impressa no banco de dados
                    const urlParams = new URLSearchParams(window.location.search);
                    const numeroNota = urlParams.get('numero_nota');
                    if (numeroNota) {
                      try {
                        await fetch(`/api/volumes/nota/${numeroNota}/status`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          },
                          body: JSON.stringify({ status: 'impressa' })
                        });
                        console.log('Voltar: Status da etiqueta atualizado para impressa no banco:', numeroNota);
                      } catch (error) {
                        console.error('Voltar: Erro ao atualizar status da etiqueta:', error);
                      }
                    }
                    
                    // Navegar para a rota de origem em modo edição
                    setLocation(rotaDestino);
                    
                    toastHook({
                      title: "Etiqueta processada",
                      description: `Retornando para edição de ${ordemOrigem.numero_ordem}`
                    });
                  } catch (error) {
                    console.error('Voltar: Erro ao recuperar dados da ordem:', error);
                    setLocation('/armazenagem/carregamento');
                  }
                } else {
                  console.log('Voltar: Nenhum dado encontrado, usando fallback inteligente');
                  // Fallback inteligente - verificar se estamos em contexto de edição via URL
                  const urlParams = new URLSearchParams(window.location.search);
                  const numeroNota = urlParams.get('numero_nota');
                  const chaveNota = urlParams.get('chave_nota');
                  
                  if (numeroNota || chaveNota) {
                    // Se temos dados da nota, buscar a ordem de carga correspondente para obter o ID
                    try {
                      const response = await fetch(`/api/notas-fiscais/buscar?numero_nf=${numeroNota}&chave_acesso=${chaveNota}`, {
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        if (data.nfe && data.nfe.ordem_carregamento_id) {
                          const ordemId = data.nfe.ordem_carregamento_id;
                          setLocation(`/armazenagem/fila-x?mode=edit&id=${ordemId}`);
                          console.log('Voltar: Fallback inteligente para fila-x com ID da ordem:', ordemId);
                          return;
                        }
                      }
                    } catch (error) {
                      console.log('Voltar: Erro ao buscar ordem via NFe, usando fallback simples');
                    }
                    
                    // Fallback simples se não conseguir buscar a ordem
                    setLocation('/armazenagem/fila-x');
                    console.log('Voltar: Fallback simples para fila-x (contexto de edição detectado)');
                  } else {
                    // Fallback padrão para nova ordem
                    setLocation('/armazenagem/carregamento');
                    console.log('Voltar: Fallback padrão para nova ordem');
                  }
                }
              }}
              interactive="magnetic"
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            >
              Voltar a Ordem de Carga
            </EnhancedButton>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="volumes">Etiquetas Volumes</TabsTrigger>
          <TabsTrigger value="consultar">Consultar Etiquetas</TabsTrigger>
          <TabsTrigger value="mix">Etiquetas Mix</TabsTrigger>
        </TabsList>

        <TabsContent value="volumes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Configuration Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuração de Etiquetas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Número da Nota Fiscal */}
                <div className="space-y-2">
                  <Label>Número da Nota Fiscal</Label>
                  <Input
                    type="text"
                    value={notaFiscal}
                    onChange={(e) => setNotaFiscal(e.target.value)}
                    placeholder="Ex: 11340"
                  />
                </div>

                {/* Número do pedido */}
                <div className="space-y-2">
                  <Label>Número do pedido</Label>
                  <Input value={notaFiscalData?.numero_pedido || ""} readOnly />
                </div>

                {/* Peso total */}
                <div className="space-y-2">
                  <Label>Peso total</Label>
                  <Input 
                    value={pesoTotal} 
                    onChange={(e) => setPesoTotal(e.target.value)}
                    placeholder="Ex: 1225.000"
                  />
                </div>

                {/* Quantidade de Volumes */}
                <div className="space-y-2">
                  <Label>Quantidade de Volumes</Label>
                  <Input 
                    value={quantidadeVolumes}
                    onChange={(e) => setQuantidadeVolumes(e.target.value)}
                    placeholder="Ex: 62"
                    type="number"
                    min="1"
                  />
                </div>

                {/* Tipo de Volume */}
                <div className="space-y-2">
                  <Label>Tipo de Volume</Label>
                  <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Carga Geral" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposVolume.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Campos específicos para Produto Perigoso */}
                {selectedTipo === 'Produto Perigoso' && (
                  <>
                    <div className="space-y-2">
                      <Label>Código ONU</Label>
                      <Input 
                        placeholder="Ex: 1170"
                        value={codigoONU}
                        onChange={(e) => setCodigoONU(e.target.value)}
                        className="input-micro color-transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Código de Risco</Label>
                      <Input 
                        placeholder="Ex: 33"
                        value={codigoRisco}
                        onChange={(e) => setCodigoRisco(e.target.value)}
                        className="input-micro color-transition"
                        readOnly={!!produtoPerigoso}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Nome Técnico</Label>
                      <Input 
                        placeholder="Ex: Acetona"
                        value={produtoPerigoso?.produto || nomeTecnico}
                        onChange={(e) => setNomeTecnico(e.target.value)}
                        className="input-micro color-transition"
                        readOnly={!!produtoPerigoso}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Classe</Label>
                      <Input 
                        placeholder="Ex: 3"
                        value={produtoPerigoso?.classeRisco || classe}
                        onChange={(e) => setClasse(e.target.value)}
                        className="input-micro color-transition"
                        readOnly={!!produtoPerigoso}
                      />
                    </div>

                    {produtoPerigoso && (
                      <>
                        <div className="space-y-2">
                          <Label>Nome do Produto</Label>
                          <Input 
                            value={produtoPerigoso.produto}
                            readOnly
                            className="input-micro bg-green-50 border-green-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Classe de Risco</Label>
                          <Input 
                            value={produtoPerigoso.classeRisco}
                            readOnly
                            className="input-micro bg-green-50 border-green-200"
                          />
                        </div>

                        {produtoPerigoso.grupoEmbalagem && (
                          <div className="space-y-2">
                            <Label>Grupo de Embalagem</Label>
                            <Input 
                              value={produtoPerigoso.grupoEmbalagem}
                              readOnly
                              className="input-micro bg-green-50 border-green-200"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Quantidade Isenta (kg)</Label>
                          <Input 
                            value={produtoPerigoso.quantidadeIsenta.toString()}
                            readOnly
                            className="input-micro bg-blue-50 border-blue-200"
                          />
                        </div>

                        <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-800">
                              Produto Perigoso Identificado
                            </span>
                          </div>
                          <p className="text-xs text-green-700 mt-1">
                            Informações preenchidas automaticamente conforme regulamentação ANTT
                          </p>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label>Classificação</Label>
                      <Select value={classificacao} onValueChange={setClassificacao}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {classificacoes.map(classif => (
                            <SelectItem key={classif.value} value={classif.value}>
                              {classif.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Área de Destino */}
                <div className="space-y-2">
                  <Label>Área de Destino</Label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área de destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map(area => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Formato de Impressão */}
                <div className="space-y-2">
                  <Label>Formato de Impressão</Label>
                  <Select value={selectedFormato} onValueChange={setSelectedFormato}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatosImpressao.map(formato => (
                        <SelectItem key={formato.value} value={formato.value}>
                          {formato.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Layout da Etiqueta */}
                <div className="space-y-2">
                  <Label>Layout da Etiqueta</Label>
                  <Select value={selectedLayout} onValueChange={setSelectedLayout}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {layoutsEtiqueta.map(layout => (
                        <SelectItem key={layout.value} value={layout.value}>
                          {layout.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Configuração ID do Volume */}
                <div className="space-y-3 border-t pt-3">
                  <h4 className="font-semibold text-sm text-gray-700">Configuração do ID</h4>
                  
                  <div className="space-y-2">
                    <Label>Número do Volume</Label>
                    <EnhancedInput
                      type="text"
                      value={numeroVolume}
                      onChange={(e) => setNumeroVolume(e.target.value.padStart(3, '0'))}
                      placeholder="Ex: 001"
                      maxLength={3}
                    />
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <strong>ID Atual:</strong> {generateVolumeId(notaFiscal || '111007', 1, parseInt(quantidadeVolumes?.toString() || '1'))}
                  </div>
                </div>

                <Button 
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline" 
                  className="w-full btn-micro scale-click"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Ocultar' : 'Gerar'} Opções XML
                </Button>

              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Label Preview */}
              {showPreview && (
                <Card className="card-micro fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="h-5 w-5" />
                      Modelo de Etiqueta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedLayout === 'alta-legibilidade-contraste' ? (
                      <div className="bg-white border-2 border-gray-800 p-4 max-w-md mx-auto rounded relative">
                        {/* Header - Client Logo Detection with 2mm spacing (no border) */}
                        <div className="mt-2 text-center py-2 mb-3" style={{ marginTop: '2mm' }}>
                          {(() => {
                            const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
                            const userCompany = currentUser?.empresa || 'Transportadora não especificada'
                            
                            if (userCompany.toLowerCase().includes('transul') || userCompany.includes('Transportadora não especificada')) {
                              return <TransulLogo className="mx-auto" width={160} height={45} />
                            } else if (userCompany.toLowerCase().includes('cross')) {
                              return <h3 className="font-bold text-lg">CROSS LOGISTICS</h3>
                            } else {
                              return <h3 className="font-bold text-lg">{userCompany}</h3>
                            }
                          })()}
                        </div>
                        
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="text-sm text-gray-600 mb-2">ID: {generateVolumeId(notaFiscal || '111007', 1, parseInt(quantidadeVolumes?.toString() || '1'))}</div>
                            
                            {/* NF - Black background with white text */}
                            <div className="bg-black text-white px-3 py-2 rounded mb-2">
                              <div className="font-bold text-xl">NF: {notaFiscal}</div>
                            </div>

                            {/* Remetente - Black background with white text */}
                            <div className="bg-black text-white px-3 py-2 rounded mb-3">
                              <div className="font-bold text-sm">Remetente: {notaFiscalData?.emitente_razao_social || 'JFA POWER TRANSMISSION SERVICE LTDA'}</div>
                            </div>
                          </div>
                          
                          <div className="ml-2 text-center">
                            <div className="w-16 h-16 border-2 border-gray-400 flex items-center justify-center mb-1">
                              {qrCodeDataURL ? (
                                <img 
                                  src={qrCodeDataURL} 
                                  alt="QR Code" 
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="text-xs text-gray-500">QR</div>
                              )}
                            </div>
                            <div className="text-xs font-mono">{generateVolumeId(notaFiscal || '111007', 1, parseInt(quantidadeVolumes?.toString() || '1'))}</div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-sm mb-1">Destinatário: {notaFiscalData?.destinatario_razao_social || 'CONSORCIO DE ALUMINIO DO MARANHAO'}</div>
                          <div className="text-sm mb-2">Endereço: {notaFiscalData?.destinatario_endereco || 'RODOVIA BR 135'}</div>
                          
                          {/* Dangerous goods section - if applicable */}
                          {selectedTipo === 'Produto Perigoso' && (codigoONU || produtoPerigoso) && (
                            <div className="bg-red-600 text-white p-3 rounded mb-3 border-2 border-red-700">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs">PRODUTO PERIGOSO</span>
                                </div>
                                {(produtoPerigoso?.classeRisco || classe) && (
                                  <div className="text-xs font-bold">
                                    CLASSE {produtoPerigoso?.classeRisco || classe}
                                  </div>
                                )}
                              </div>
                              
                              {/* Product Information Grid */}
                              <div className="grid grid-cols-2 gap-1 mb-2">
                                {codigoONU && (
                                  <div className="bg-white text-red-600 px-2 py-1 rounded text-xs">
                                    <span className="font-semibold">ONU:</span>
                                    <div className="font-bold">{codigoONU}</div>
                                  </div>
                                )}
                                {(produtoPerigoso?.numeroRisco || codigoRisco) && (
                                  <div className="bg-white text-red-600 px-2 py-1 rounded text-xs">
                                    <span className="font-semibold">RISCO:</span>
                                    <div className="font-bold">{produtoPerigoso?.numeroRisco || codigoRisco}</div>
                                  </div>
                                )}
                              </div>
                              
                              {(produtoPerigoso?.produto || nomeTecnico) && (
                                <div className="bg-white text-red-600 px-2 py-1 rounded text-xs mb-1">
                                  <span className="font-semibold">NOME TÉCNICO:</span>
                                  <div className="font-bold text-xs">{produtoPerigoso?.produto || nomeTecnico}</div>
                                </div>
                              )}
                              
                              {classificacao && (
                                <div className="bg-white text-red-600 px-2 py-1 rounded text-xs">
                                  <span className="font-semibold">CLASSIFICAÇÃO:</span>
                                  <div className="font-bold text-xs">{classificacao === 'cargas-nao-classificadas' ? 'Cargas Não Classificadas' : classificacao}</div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Cidade/UF - Black background with white text */}
                          <div className="bg-black text-white px-3 py-2 rounded">
                            <div className="font-bold text-lg">Cidade/UF: {notaFiscalData ? `${notaFiscalData.destinatario_cidade || 'SAO LUIS'} ${notaFiscalData.destinatario_uf || 'MA'}` : 'SAO LUIS MA'}</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-end">
                          <div className="flex-1 space-y-2">
                            {/* Peso - Black background with white text like Cidade/UF */}
                            <div className="bg-black text-white px-3 py-1 rounded inline-block">
                              <div className="font-bold text-sm">Peso: {notaFiscalData?.peso_bruto || '16.200'}</div>
                            </div>
                            
                            <div className="text-sm">
                              Transportadora: {(() => {
                                const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
                                return currentUser?.empresa || 'Transportadora não especificada'
                              })()}
                            </div>
                            
                            {/* Data de Criação da Etiqueta */}
                            <div className="text-xs text-gray-600 mb-1">
                              Entrada: {formatCreationDate(generateVolumeId(notaFiscal || '111007', 1, parseInt(quantidadeVolumes?.toString() || '1')))}
                            </div>
                            
                            {/* Quantidade de Volumes - Black background with white text */}
                            <div className="bg-black text-white px-3 py-1 rounded inline-block">
                              <div className="font-bold text-sm">Volume: 1/{notaFiscalData?.quantidade_volumes || '2'}</div>
                            </div>
                          </div>

                          {/* Area - Large black box with white text */}
                          <div className="bg-black text-white rounded-lg flex flex-col items-center justify-center ml-2">
                            <div className="px-4 py-3 min-w-[60px] min-h-[60px] flex flex-col items-center justify-center">
                              <div className="font-bold text-xs mb-1">ÁREA</div>
                              <div className="font-bold text-3xl">{selectedArea ? selectedArea.replace('Área ', '') : '01'}</div>
                            </div>
                          </div>
                        </div>

                        {selectedTipo === 'Produto Perigoso' && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <div className="text-white text-sm">⚠</div>
                          </div>
                        )}
                        
                        {/* CROSS WMS watermark */}
                        <div className="absolute bottom-1 left-2 text-gray-300 text-xs">
                          CROSS WMS
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-gray-300 p-4 max-w-md mx-auto rounded relative">
                        <div className="mt-2 flex justify-between items-center pb-2 mb-3" style={{ marginTop: '2mm' }}>
                          {(() => {
                            const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
                            const userCompany = currentUser?.empresa || 'Transportadora não especificada'
                            
                            if (userCompany.toLowerCase().includes('transul') || userCompany.includes('Transportadora não especificada')) {
                              return <TransulLogo className="mx-auto" width={160} height={45} />
                            } else if (userCompany.toLowerCase().includes('cross')) {
                              return <h3 className="font-bold text-center w-full">CROSS LOGISTICS</h3>
                            } else {
                              return <h3 className="font-bold text-center w-full">{userCompany}</h3>
                            }
                          })()}
                          {selectedTipo === 'Produto Perigoso' && (
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9V3H7C5.9 3 5 3.9 5 5V17C5 18.1 5.9 19 7 19V21C7 21.6 7.4 22 8 22H16C16.6 22 17 21.6 17 21V19C18.1 19 19 18.1 19 17V15L21 9ZM13 15V12H11V15H8V17H16V15H13ZM7 5H9V1H15L19 5V7L17 9V15H17V17H7V5Z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="text-sm text-gray-600">ID: {generateVolumeId(notaFiscal || '111007', 1, parseInt(quantidadeVolumes?.toString() || '1'))}</div>
                            <div className="bg-yellow-200 text-black px-2 py-1 text-lg font-bold mt-1">
                              NF: {notaFiscal}
                            </div>
                          </div>
                          <div className="w-16 h-16 border border-gray-400 flex items-center justify-center">
                            {qrCodeDataURL ? (
                              <img 
                                src={qrCodeDataURL} 
                                alt="QR Code" 
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="text-xs text-gray-500">QR CODE</div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1 text-sm mb-3">
                          <div className="bg-blue-100 px-2 py-1">
                            <strong>Remetente:</strong> {notaFiscalData?.emitente_razao_social || 'Não informado'}
                          </div>
                          <div><strong>Destinatário:</strong> {notaFiscalData?.destinatario_razao_social || 'Não informado'}</div>
                          <div><strong>Endereço:</strong> {notaFiscalData?.destinatario_endereco || 'Não informado'}</div>
                          <div className="bg-green-100 px-2 py-1">
                            <strong>Cidade/UF:</strong> {notaFiscalData ? `${notaFiscalData.destinatario_cidade || 'Não informado'} /${notaFiscalData.destinatario_uf || ''}` : 'Não informado'}
                          </div>
                        </div>

                        {/* Dangerous goods section for colorful layout */}
                        {selectedTipo === 'Produto Perigoso' && (codigoONU || produtoPerigoso) && (
                          <div className="border-2 border-red-300 p-3 mb-3 bg-red-50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-red-600">PRODUTO PERIGOSO</span>
                              </div>
                              <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                                CLASSE {codigoONU || produtoPerigoso?.numeroONU || '321'}
                              </div>
                            </div>
                            
                            {/* Information Grid */}
                            <div className="grid grid-cols-2 gap-1 mb-2 text-xs">
                              {codigoONU && (
                                <div className="bg-white border border-red-200 px-2 py-1">
                                  <span className="font-semibold text-red-600">ONU:</span>
                                  <div className="font-bold">{codigoONU}</div>
                                </div>
                              )}
                              {(produtoPerigoso?.numeroRisco || codigoRisco) && (
                                <div className="bg-white border border-red-200 px-2 py-1">
                                  <span className="font-semibold text-red-600">RISCO:</span>
                                  <div className="font-bold">{produtoPerigoso?.numeroRisco || codigoRisco}</div>
                                </div>
                              )}
                            </div>
                            
                            {(produtoPerigoso?.produto || nomeTecnico) && (
                              <div className="bg-white border border-red-200 px-2 py-1 text-xs mb-1">
                                <span className="font-semibold text-red-600">NOME TÉCNICO:</span>
                                <div className="font-bold">{produtoPerigoso?.produto || nomeTecnico}</div>
                              </div>
                            )}
                            
                            {classificacao && (
                              <div className="bg-white border border-red-200 px-2 py-1 text-xs">
                                <span className="font-semibold text-red-600">CLASSIFICAÇÃO:</span>
                                <div className="font-bold">{classificacao === 'cargas-nao-classificadas' ? 'Cargas Não Classificadas' : classificacao}</div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="text-sm space-y-2">
                            {/* Peso - Black background with white text like Cidade/UF */}
                            <div className="bg-black text-white px-3 py-1 rounded inline-block">
                              <div className="font-bold">Peso: {notaFiscalData?.peso_bruto || 'Não informado'}</div>
                            </div>
                            
                            <div>
                              <strong>Transportadora:</strong> {(() => {
                                const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
                                return currentUser?.empresa || 'Transportadora não especificada'
                              })()}
                            </div>
                            
                            {/* Data de Criação da Etiqueta */}
                            <div className="text-xs text-gray-600 mb-1">
                              Entrada: {formatCreationDate(generateVolumeId(notaFiscal || '111007', 1, parseInt(quantidadeVolumes?.toString() || '1')))}
                            </div>
                            
                            {/* Volume - Black background with white text like Cidade/UF */}
                            <div className="bg-black text-white px-3 py-1 rounded inline-block">
                              <div className="font-bold">Volume: 1/{notaFiscalData?.quantidade_volumes || '1'}</div>
                            </div>
                          </div>
                          <div className="bg-blue-600 text-white px-6 py-4 text-center rounded">
                            <div className="text-sm font-semibold">ÁREA</div>
                            <div className="text-4xl font-bold">{selectedArea ? selectedArea.replace('Área ', '') : '01'}</div>
                          </div>
                        </div>
                        
                        {/* CROSS WMS watermark */}
                        <div className="absolute bottom-1 left-2 text-gray-300 text-xs">
                          CROSS WMS
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Etiquetas do Sistema */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Volumes da Nota Fiscal</CardTitle>
                    <div className="flex gap-2">
                      <EnhancedButton variant="outline" size="sm" interactive="magnetic">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                      </EnhancedButton>
                      <EnhancedButton 
                        onClick={handleGenerateLabels}
                        disabled={selectedVolumes.length === 0 || isGenerating}
                        loading={isGenerating}
                        interactive="ripple"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Gerar PDF
                      </EnhancedButton>
                      <EnhancedButton 
                        onClick={handlePrintLabels}
                        disabled={selectedVolumes.length === 0 || isGenerating}
                        loading={isGenerating}
                        variant="outline"
                        interactive="magnetic"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
                      </EnhancedButton>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {notaFiscalData ? `NF ${notaFiscalData.numero_nota} - ${notaFiscalData.emitente_razao_social}` : 'Volumes da nota fiscal atual'}
                  </p>
                </CardHeader>
                <CardContent>
                  
                  {/* Search and Filters */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <Input 
                        placeholder="Buscar volumes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-micro color-transition"
                      />
                    </div>
                  </div>

                  {/* Volumes Table */}
                  <div className="border rounded-lg">
                    <div className="grid grid-cols-7 gap-4 p-3 bg-gray-50 border-b text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          checked={selectedVolumes.length === currentNotaVolumes.length && currentNotaVolumes.length > 0}
                          onChange={() => {
                            if (selectedVolumes.length === currentNotaVolumes.length) {
                              setSelectedVolumes([])
                            } else {
                              setSelectedVolumes(currentNotaVolumes.map(v => v.codigo))
                            }
                          }}
                          className="rounded"
                        />
                        Código
                      </div>
                      <div>Tipo</div>
                      <div>Área</div>
                      <div>Quantidade</div>
                      <div>Volume</div>
                      <div>Status</div>
                      <div>Ações</div>
                    </div>

                    {currentNotaVolumes.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum volume encontrado</p>
                        <p className="text-sm">Importe uma nota fiscal para gerar volumes</p>
                      </div>
                    ) : currentNotaVolumes.map((volume) => (
                      <div key={volume.codigo} className="grid grid-cols-7 gap-4 p-3 border-b hover:bg-gray-50 color-transition">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            checked={selectedVolumes.includes(volume.codigo)}
                            onChange={() => {
                              if (selectedVolumes.includes(volume.codigo)) {
                                setSelectedVolumes(selectedVolumes.filter(id => id !== volume.codigo))
                              } else {
                                setSelectedVolumes([...selectedVolumes, volume.codigo])
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{volume.codigo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{volume.tipo}</span>
                          {volume.tipo === 'Produto Químico' && (
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-current">
                                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9V3H7C5.9 3 5 3.9 5 5V17C5 18.1 5.9 19 7 19V21C7 21.6 7.4 22 8 22H16C16.6 22 17 21.6 17 21V19C18.1 19 19 18.1 19 17V15L21 9ZM13 15V12H11V15H8V17H16V15H13ZM7 5H9V1H15L19 5V7L17 9V15H17V17H7V5Z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="text-sm">{volume.area}</div>
                        <div className="text-sm">{volume.quantidade}</div>
                        <div className="text-sm text-blue-600">{volume.volume}</div>
                        <div>{getStatusBadge(volumesStatus[volume.codigo] || volume.status)}</div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="btn-micro scale-click"
                            onClick={() => handleClassifyVolume(volume.codigo)}
                            title="Classificar volume"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="btn-micro scale-click"
                            onClick={() => handleViewVolume(volume.codigo)}
                            title="Visualizar etiqueta"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="btn-micro scale-click"
                            onClick={() => handlePrintVolume(volume.codigo)}
                            title="Imprimir etiqueta"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="btn-micro scale-click"
                            title="Mais opções"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedVolumes.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg slide-up fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-800">
                          {selectedVolumes.length} volume(s) selecionado(s)
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="btn-micro scale-click"
                            onClick={handleDownloadPDF}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar PDF
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={handlePrintSelected}
                            className="btn-micro btn-ripple scale-click"
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir Selecionadas
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="consultar">
          <Card>
            <CardHeader>
              <CardTitle>Consultar Etiquetas</CardTitle>
              <p className="text-sm text-gray-600">
                Consulte etiquetas já geradas e reimprima quando necessário.
              </p>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input 
                    placeholder="Buscar etiquetas por código, chave NF, remetente ou destinatário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-micro color-transition"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>

              {/* Historical Labels Table */}
              <div className="border rounded-lg">
                <div className="grid grid-cols-8 gap-4 p-3 bg-gray-50 border-b text-sm font-medium">
                  <div>Código</div>
                  <div>Descrição</div>
                  <div>Tipo</div>
                  <div>Área</div>
                  <div>Quantidade</div>
                  <div>Volume</div>
                  <div>Status</div>
                  <div>Ações</div>
                </div>

                {volumesData.map((volume) => (
                  <div key={volume.codigo} className="grid grid-cols-8 gap-4 p-3 border-b hover:bg-gray-50 color-transition">
                    <div className="text-sm">{volume.codigo}</div>
                    <div className="text-sm">Volume {volume.volume}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{volume.tipo}</span>
                      {volume.tipo === 'Produto Químico' && (
                        <span className="w-2 h-2 bg-red-500 rounded-full" title="Produto Perigoso"></span>
                      )}
                    </div>
                    <div className="text-sm text-center">{volume.area}</div>
                    <div className="text-sm text-center">{volume.quantidade}</div>
                    <div className="text-sm text-center">{volume.volume}</div>
                    <div>
                      <Badge 
                        className={volume.status === 'Gerada' ? 'bg-green-100 text-green-800' : 
                                 volume.status === 'Impressa' ? 'bg-blue-100 text-blue-800' : 
                                 'bg-yellow-100 text-yellow-800'} 
                        variant="outline"
                      >
                        {volume.status}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="p-1 h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="p-1 h-8 w-8"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="p-1 h-8 w-8"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mix">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gerar Etiqueta Mãe */}
            <Card>
              <CardHeader>
                <CardTitle>Gerar Etiqueta Mãe</CardTitle>
                <p className="text-sm text-gray-600">
                  Etiqueta mãe para unificar volumes para conferência e movimentações em lote.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="mixDescription">Descrição</Label>
                  <Input
                    id="mixDescription"
                    placeholder="Descrição da etiqueta mix"
                    value={mixEtiquetaConfig.descricao}
                    onChange={(e) => setMixEtiquetaConfig(prev => ({ ...prev, descricao: e.target.value }))}
                  />
                </div>

                {/* Tipo de Etiqueta */}
                <div className="space-y-2">
                  <Label htmlFor="mixTipo">Tipo de Etiqueta</Label>
                  <Select value={mixEtiquetaConfig.tipo} onValueChange={(value) => setMixEtiquetaConfig(prev => ({ ...prev, tipo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Geral (Volumes)">Geral (Volumes)</SelectItem>
                      <SelectItem value="Palete">Palete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Layout da Etiqueta */}
                <div className="space-y-2">
                  <Label htmlFor="mixLayout">Layout da Etiqueta</Label>
                  <Select value={mixEtiquetaConfig.layout} onValueChange={(value) => setMixEtiquetaConfig(prev => ({ ...prev, layout: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Etiqueta 50x100mm">Etiqueta 50x100mm</SelectItem>
                      <SelectItem value="Etiqueta A4">Etiqueta A4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Formato de Impressão */}
                <div className="space-y-2">
                  <Label htmlFor="mixFormato">Formato de Impressão</Label>
                  <Select value={mixEtiquetaConfig.formato} onValueChange={(value) => setMixEtiquetaConfig(prev => ({ ...prev, formato: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Etiqueta 50x100mm">Etiqueta 50x100mm</SelectItem>
                      <SelectItem value="A4 Portrait">A4 Portrait</SelectItem>
                      <SelectItem value="A4 Landscape">A4 Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Button to generate */}
                <Button 
                  className="w-full"
                  onClick={handleGerarEtiquetaMae}
                  disabled={!mixEtiquetaConfig.descricao || !mixEtiquetaConfig.tipo}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Gerar Etiqueta Mãe
                </Button>
              </CardContent>
            </Card>

            {/* Modelo de Etiqueta Mix Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Modelo de Etiqueta</CardTitle>
                <p className="text-sm text-gray-600">
                  Preview da etiqueta mãe que será gerada
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Layout da Etiqueta Preview */}
                  <div className="space-y-2">
                    <Label>Layout da Etiqueta</Label>
                    <Select value={mixEtiquetaConfig.previewLayout} onValueChange={(value) => setMixEtiquetaConfig(prev => ({ ...prev, previewLayout: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alta Legibilidade (Texto Grande)">Alta Legibilidade (Texto Grande)</SelectItem>
                        <SelectItem value="Compacta">Compacta</SelectItem>
                        <SelectItem value="Detalhada">Detalhada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Logo da Transportadora */}
                  <div className="space-y-2">
                    <Label>Logo da Transportadora (50x120mm)</Label>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Precursor: Nenhum arquivo selecionado</p>
                      <p className="text-xs">Dimensões recomendadas: 50mm x 120mm. Formatos suportados: JPG, PNG, SVG</p>
                    </div>
                  </div>

                  {/* Preview da Etiqueta */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300 min-h-[200px] flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="text-red-600 font-bold text-lg">ETIQUETA MÃE</div>
                        <div className="bg-yellow-200 px-3 py-1 rounded font-bold text-lg">
                          NF: {mixEtiquetaConfig.numeroEtiqueta}
                        </div>
                        <div className="bg-green-200 px-3 py-1 rounded font-bold">
                          Destino: SÃO PAULO
                        </div>
                        <div className="text-sm space-y-1 mt-4">
                          <div>• ID único da etiqueta mãe</div>
                          <div>• QR Code de identificação</div>
                          <div>• Número da nota fiscal</div>
                          <div>• Código de barras principal</div>
                          <div>• Remetente / Destinatário</div>
                          <div>• Cidade principal / UF</div>
                          <div>• Peso total dos volumes</div>
                          <div>• Transportadora/empresa</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações da Etiqueta */}
                  <div className="space-y-2">
                    <Label>Informações Disponíveis</Label>
                    <div className="text-sm space-y-1">
                      <p>Selecionar movimentações</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Etiquetas Mãe Geradas */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Etiquetas Mãe</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por ID ou descrição..."
                    value={mixSearchTerm}
                    onChange={(e) => setMixSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline" size="sm">
                  Buscar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Volumes</TableHead>
                      <TableHead>Data Criação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mixEtiquetasList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          Nenhuma etiqueta mãe encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      mixEtiquetasList.map((etiqueta) => (
                        <TableRow key={etiqueta.id}>
                          <TableCell className="font-mono text-sm">{etiqueta.id}</TableCell>
                          <TableCell>{etiqueta.descricao}</TableCell>
                          <TableCell>
                            <Badge variant={etiqueta.tipo === 'Geral (Volumes)' ? 'default' : 'secondary'}>
                              {etiqueta.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell>{etiqueta.volumes}</TableCell>
                          <TableCell>{etiqueta.dataCriacao}</TableCell>
                          <TableCell>
                            <Badge variant={etiqueta.status === 'Ativa' ? 'default' : 'secondary'}>
                              {etiqueta.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                title="Visualizar"
                                onClick={() => handleViewMixEtiqueta(etiqueta)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                title="Vincular Volumes"
                                onClick={() => handleLinkVolumes(etiqueta)}
                              >
                                <Link className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                title="Imprimir"
                                onClick={() => handlePrintMixEtiqueta(etiqueta)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Individual Volume Classification Dialog */}
      <Dialog open={classificationDialogOpen} onOpenChange={setClassificationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Classificar Volume</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="volumeTipo">Tipo de Volume</Label>
              <Select value={volumeTipo} onValueChange={setVolumeTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Carga Geral">Carga Geral</SelectItem>
                  <SelectItem value="Produto Perigoso">Produto Perigoso</SelectItem>
                  <SelectItem value="Produto Químico">Produto Químico</SelectItem>
                  <SelectItem value="Frágil">Frágil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {volumeTipo === 'Produto Perigoso' && (
              <>
                <div>
                  <Label htmlFor="volumeCodigoONU">Código ONU</Label>
                  <Input
                    id="volumeCodigoONU"
                    value={volumeCodigoONU}
                    onChange={(e) => setVolumeCodigoONU(e.target.value)}
                    placeholder="321"
                  />
                </div>

                <div>
                  <Label htmlFor="volumeCodigoRisco">Código de Risco</Label>
                  <Input
                    id="volumeCodigoRisco"
                    value={volumeCodigoRisco}
                    onChange={(e) => setVolumeCodigoRisco(e.target.value)}
                    placeholder="321"
                  />
                </div>

                <div>
                  <Label htmlFor="volumeNomeTecnico">Nome Técnico</Label>
                  <Input
                    id="volumeNomeTecnico"
                    value={volumeNomeTecnico}
                    onChange={(e) => setVolumeNomeTecnico(e.target.value)}
                    placeholder="321"
                  />
                </div>

                <div>
                  <Label htmlFor="volumeClasse">Classe</Label>
                  <Input
                    id="volumeClasse"
                    value={volumeClasse}
                    onChange={(e) => setVolumeClasse(e.target.value)}
                    placeholder="321"
                  />
                </div>

                <div>
                  <Label htmlFor="volumeClassificacao">Classificação</Label>
                  <Select value={volumeClassificacao} onValueChange={setVolumeClassificacao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a classificação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cargas-nao-classificadas">Cargas Não Classificadas</SelectItem>
                      <SelectItem value="classe-1">Classe 1 - Explosivos</SelectItem>
                      <SelectItem value="classe-2">Classe 2 - Gases</SelectItem>
                      <SelectItem value="classe-3">Classe 3 - Líquidos Inflamáveis</SelectItem>
                      <SelectItem value="classe-4">Classe 4 - Sólidos Inflamáveis</SelectItem>
                      <SelectItem value="classe-5">Classe 5 - Substâncias Oxidantes</SelectItem>
                      <SelectItem value="classe-6">Classe 6 - Substâncias Tóxicas</SelectItem>
                      <SelectItem value="classe-7">Classe 7 - Materiais Radioativos</SelectItem>
                      <SelectItem value="classe-8">Classe 8 - Substâncias Corrosivas</SelectItem>
                      <SelectItem value="classe-9">Classe 9 - Substâncias Perigosas Diversas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setClassificationDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={saveVolumeClassification}
                className="flex-1"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Mix Label Dialog */}
      <Dialog open={viewMixDialogOpen} onOpenChange={setViewMixDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Etiqueta Mãe</DialogTitle>
          </DialogHeader>
          {selectedMixEtiqueta && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID da Etiqueta</Label>
                  <p className="text-lg font-mono">{selectedMixEtiqueta.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <Badge variant={selectedMixEtiqueta.tipo === 'Geral (Volumes)' ? 'default' : 'secondary'}>
                    {selectedMixEtiqueta.tipo}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <p>{selectedMixEtiqueta.descricao}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data de Criação</Label>
                  <p>{selectedMixEtiqueta.dataCriacao}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Quantidade de Volumes</Label>
                  <p className="text-xl font-bold">{selectedMixEtiqueta.volumes}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Peso Total</Label>
                  <p className="text-xl font-bold">{selectedMixEtiqueta.pesoTotal} kg</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Destino</Label>
                  <p className="text-lg font-bold">{selectedMixEtiqueta.cidadeDestino} / {selectedMixEtiqueta.ufDestino}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={selectedMixEtiqueta.status === 'Ativa' ? 'default' : 'secondary'}>
                    {selectedMixEtiqueta.status}
                  </Badge>
                </div>
              </div>

              {/* Linked Volumes */}
              {selectedMixEtiqueta.volumesVinculados && selectedMixEtiqueta.volumesVinculados.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Volumes Vinculados</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                    <div className="space-y-1">
                      {selectedMixEtiqueta.volumesVinculados.map((volumeId: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Package className="h-3 w-3 text-gray-500" />
                          <span className="font-mono">{volumeId}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setViewMixDialogOpen(false)}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button 
                  onClick={() => {
                    setViewMixDialogOpen(false)
                    handlePrintMixEtiqueta(selectedMixEtiqueta)
                  }}
                  className="flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Link Volumes Dialog */}
      <Dialog open={linkVolumesDialogOpen} onOpenChange={setLinkVolumesDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vincular Volumes à Etiqueta Mãe</DialogTitle>
            <p className="text-sm text-gray-600">
              Selecione os volumes que deseja vincular a esta etiqueta mãe
            </p>
          </DialogHeader>
          {selectedMixEtiqueta && (
            <div className="space-y-4">
              {/* Selected Mix Label Info */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Etiqueta Mãe: {selectedMixEtiqueta.id}</span>
                </div>
                <p className="text-sm text-blue-700">{selectedMixEtiqueta.descricao}</p>
                <p className="text-sm text-blue-600">
                  Volumes já vinculados: {selectedMixEtiqueta.volumesVinculados?.length || 0}
                </p>
              </div>

              {/* Available Volumes */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Volumes Disponíveis</Label>
                {availableVolumesForLink.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum volume disponível para vinculação</p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto border rounded-lg">
                    <div className="grid grid-cols-1 gap-2 p-3">
                      {availableVolumesForLink.map((volume) => (
                        <div
                          key={volume.codigo}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedVolumesForLink.includes(volume.codigo)
                              ? 'bg-blue-50 border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            if (selectedVolumesForLink.includes(volume.codigo)) {
                              setSelectedVolumesForLink(prev => prev.filter(id => id !== volume.codigo))
                            } else {
                              setSelectedVolumesForLink(prev => [...prev, volume.codigo])
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedVolumesForLink.includes(volume.codigo)}
                            onChange={() => {}}
                            className="h-4 w-4"
                          />
                          <div className="flex-1">
                            <div className="font-mono text-sm">{volume.codigo}</div>
                            <div className="text-xs text-gray-500">
                              {volume.tipo} • Área {volume.area} • Volume {volume.volume}
                            </div>
                          </div>
                          <Badge variant={volume.status === 'Gerada' ? 'default' : 'secondary'}>
                            {volume.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Summary */}
              {selectedVolumesForLink.length > 0 && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>{selectedVolumesForLink.length}</strong> volume(s) selecionado(s) para vinculação
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setLinkVolumesDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveLinkVolumes}
                  disabled={selectedVolumesForLink.length === 0}
                  className="flex-1"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Vincular Volumes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}

export default GeracaoEtiquetas;