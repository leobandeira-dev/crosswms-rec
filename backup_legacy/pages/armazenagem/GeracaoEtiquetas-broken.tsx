import { useState, useRef, useEffect } from 'react'
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
import { toast } from 'sonner'
import EnhancedButton from '@/components/ui/enhanced-button'
import { EnhancedInput } from '@/components/ui/enhanced-input'
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
  RefreshCw
} from 'lucide-react'

interface VolumeData {
  codigo: string
  notaFiscal: string
  volume: string
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
  const [activeTab, setActiveTab] = useState('volumes')
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('')
  const [selectedFormato, setSelectedFormato] = useState('50x100mm')
  const [selectedLayout, setSelectedLayout] = useState('alta-legibilidade')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
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

  // Load nota fiscal data from sessionStorage on component mount
  useEffect(() => {
    const storedData = sessionStorage.getItem('notaFiscalData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setNotaFiscalData(data)
        setNotaFiscal(data.numero_nota || '')
        
        // Generate volumes based on quantidade_volumes
        const quantidadeVolumes = parseInt(data.quantidade_volumes) || 1
        const volumes = []
        
        for (let i = 1; i <= quantidadeVolumes; i++) {
          const volumeCode = `${data.numero_nota}-${String(i).padStart(3, '0')}-001`
          volumes.push({
            codigo: volumeCode,
            notaFiscal: data.numero_nota,
            volume: `${i}/${quantidadeVolumes}`,
            tipo: 'Carga Geral',
            area: '01',
            quantidade: 1,
            status: 'Pendente',
            dataGeracao: new Date().toLocaleDateString('pt-BR')
          })
        }
        
        setCurrentNotaVolumes(volumes)
      } catch (error) {
        console.error('Error parsing nota fiscal data:', error)
      }
    }
  }, [])
  
  // Function to generate volume ID
  const generateVolumeId = () => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = String(now.getFullYear()).slice(-2)
    const hour = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    
    return `${notaFiscal}-${numeroVolume}-${day}${month}${year}-${hour}${minutes}`
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
        const volumeId = generateVolumeId()
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

  const areas = Array.from({length: 10}, (_, i) => `Área ${String(i + 1).padStart(2, '0')}`)
  
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


  const filteredVolumes = volumesData.filter(volume => {
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
      
      // Simular geração de etiquetas
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update status to "Gerada" for selected volumes
      const updatedVolumes = currentNotaVolumes.map(volume => {
        if (selectedVolumes.includes(volume.codigo)) {
          return { ...volume, status: 'Gerada' as const }
        }
        return volume
      })
      setCurrentNotaVolumes(updatedVolumes)
      
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
        await generateLabelPDF([volume], 'print')
        
        // Update status to "Impressa"
        const updatedVolumes = currentNotaVolumes.map(v => 
          v.codigo === codigo ? { ...v, status: 'Impressa' as const } : v
        )
        setCurrentNotaVolumes(updatedVolumes)
      } catch (error) {
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

        // Add content to PDF - universal function handles all formats
        await addA4LabelToPDF(pdf, volume, qrCodeDataURL)
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

            // Add label using the exact layout from your model
            await addA4LabelToPDF(printPdf, volumeData, labelQrCodeDataURL)
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
    let currentY = margin + 3

    // Header - Transportadora (light background)
    const headerHeight = isSmallFormat ? 8 : 12
    pdf.setFillColor(249, 250, 251) // Light gray background
    pdf.rect(margin, margin, pageWidth - (margin * 2), headerHeight, 'F')
    pdf.setDrawColor(55, 65, 81) // Border
    pdf.setLineWidth(0.5)
    pdf.rect(margin, margin, pageWidth - (margin * 2), headerHeight, 'S')
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(isSmallFormat ? 10 : 14)
    pdf.setFont('helvetica', 'bold')
    const transportadoraText = volume.transportadora || 'Transportadora não especificada'
    const transportadoraX = margin + ((pageWidth - (margin * 2)) / 2)
    pdf.text(transportadoraText, transportadoraX, margin + (headerHeight * 0.6), { align: 'center' })
    
    currentY = margin + headerHeight + 2

    // ID Section
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(isSmallFormat ? 7 : 9)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`ID: ${volume.codigo}`, margin + 2, currentY)
    currentY += isSmallFormat ? 3 : 4

    // NF - Black background with white text (high contrast)
    const nfHeight = isSmallFormat ? 6 : 8
    pdf.setFillColor(0, 0, 0) // Black background
    pdf.rect(margin + 2, currentY, pageWidth - (margin * 2) - 4, nfHeight, 'F')
    
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFontSize(isSmallFormat ? 12 : 16)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`NF: ${volume.notaFiscal}`, margin + 4, currentY + (nfHeight * 0.6))
    currentY += nfHeight + 2

    // Remetente - Black background with white text
    const remetenteHeight = isSmallFormat ? 5 : 7
    pdf.setFillColor(0, 0, 0) // Black background
    pdf.rect(margin + 2, currentY, pageWidth - (margin * 2) - 4, remetenteHeight, 'F')
    
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFontSize(isSmallFormat ? 8 : 10)
    pdf.setFont('helvetica', 'bold')
    const remetenteText = `Remetente: ${volume.remetente || 'JFA POWER TRANSMISSION SERVICE LTDA'}`
    pdf.text(remetenteText, margin + 4, currentY + (remetenteHeight * 0.6))
    currentY += remetenteHeight + 3

    // QR Code (positioned on the right side)
    if (qrCodeDataURL) {
      const qrSize = isSmallFormat ? 15 : 20
      const qrX = pageWidth - margin - qrSize - 2
      const qrY = margin + headerHeight + 2
      pdf.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSize, qrSize)
      
      // QR Code label
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(isSmallFormat ? 6 : 8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(volume.codigo, qrX + (qrSize / 2), qrY + qrSize + 2, { align: 'center' })
    }

    // Destinatário and Address section
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(isSmallFormat ? 7 : 9)
    pdf.setFont('helvetica', 'normal')
    
    pdf.text(`Destinatário: ${volume.destinatario || 'ALCOA WORLD ALUMINA BRASIL LTDA'}`, margin + 2, currentY)
    currentY += isSmallFormat ? 3 : 4
    
    pdf.text(`Endereço: ${volume.enderecoDestino || 'LAGO ENSEADA DO LAGO GRANDE DE JURUTI'}`, margin + 2, currentY)
    currentY += isSmallFormat ? 4 : 5

    // Cidade/UF - Black background with white text
    const cidadeHeight = isSmallFormat ? 5 : 7
    pdf.setFillColor(0, 0, 0) // Black background
    pdf.rect(margin + 2, currentY, pageWidth - (margin * 2) - 4, cidadeHeight, 'F')
    
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFontSize(isSmallFormat ? 9 : 12)
    pdf.setFont('helvetica', 'bold')
    const cidadeText = `Cidade/UF: ${volume.cidadeDestino || 'Juruti'} ${volume.ufDestino || 'PA'}`
    pdf.text(cidadeText, margin + 4, currentY + (cidadeHeight * 0.6))
    currentY += cidadeHeight + 4

    // Bottom section details
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(isSmallFormat ? 7 : 9)
    pdf.setFont('helvetica', 'normal')
    
    pdf.text(`Peso: ${volume.peso || '750'}`, margin + 2, currentY)
    currentY += isSmallFormat ? 3 : 4
    
    pdf.text(`Transportadora: ${volume.transportadora || 'Transportadora não especificada'}`, margin + 2, currentY)
    currentY += isSmallFormat ? 3 : 4
    
    pdf.text(`Descrição: Volume ${volume.volume}`, margin + 2, currentY)

    // ÁREA - Large black box with white text (bottom right)
    const areaBoxSize = isSmallFormat ? 20 : 25
    const areaBoxX = pageWidth - margin - areaBoxSize - 2
    const areaBoxY = pageHeight - margin - areaBoxSize - 2
    
    pdf.setFillColor(0, 0, 0) // Black background
    pdf.rect(areaBoxX, areaBoxY, areaBoxSize, areaBoxSize, 'F')
    
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFontSize(isSmallFormat ? 6 : 8)
    pdf.setFont('helvetica', 'bold')
    pdf.text('ÁREA', areaBoxX + (areaBoxSize * 0.5), areaBoxY + (areaBoxSize * 0.3), { align: 'center' })
    
    pdf.setFontSize(isSmallFormat ? 14 : 18)
    pdf.setFont('helvetica', 'bold')
    const areaNumber = selectedArea ? selectedArea.replace('Área ', '') : '01'
    pdf.text(areaNumber, areaBoxX + (areaBoxSize * 0.5), areaBoxY + (areaBoxSize * 0.7), { align: 'center' })
    
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
    
    // Add border around entire label - exact match to preview
    pdf.setDrawColor(200, 200, 200) // Light gray border like preview
    pdf.setLineWidth(0.5)
    pdf.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2), 'S')
    
    // Header - increased by 30% for better readability
    pdf.setFontSize(isSmallFormat ? 9 : 14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('Transportadora não especificada', margin + 3, margin + 8)
    
    // Add QR Code - optimized size and positioning
    const qrSize = isSmallFormat ? 12 : 18
    pdf.addImage(qrCodeDataURL, 'PNG', pageWidth - margin - qrSize - 2, margin + 2, qrSize, qrSize)
    
    let currentY = margin + 15
    
    // Volume ID - increased by 30% for better readability
    pdf.setFontSize(isSmallFormat ? 7 : 9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100) // Gray text like preview
    pdf.text(`ID: ${volume.codigo}`, margin + 3, currentY)
    currentY += isSmallFormat ? 5 : 7
    
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
    
    // Address - increased by 30% for better readability
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(isSmallFormat ? 8 : 10)
    const address = notaFiscalData?.destinatario_endereco || 'RODOVIA BR 135'
    pdf.text(`Endereço: ${address}`, margin + 3, currentY)
    currentY += isSmallFormat ? 4 : 5
    
    // City/State (light green background) - increased by 30% for better readability
    const cityBoxHeight = isSmallFormat ? 7 : 9
    pdf.setFillColor(200, 230, 201) // Light green from preview
    pdf.rect(margin + 3, currentY, pageWidth - (margin * 2) - 6, cityBoxHeight, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(isSmallFormat ? 8 : 10)
    pdf.setTextColor(0, 0, 0)
    const city = notaFiscalData?.destinatario_cidade || 'SAO LUIS'
    const state = notaFiscalData?.destinatario_uf || 'MA'
    pdf.text(`Cidade/UF: ${city} /${state}`, margin + 4, currentY + (cityBoxHeight * 0.7))
    currentY += cityBoxHeight + 3
    
    // Dangerous goods section (if applicable) - optimized layout
    if (selectedTipo === 'Produto Perigoso' && (codigoONU || produtoPerigoso)) {
      const dangerBoxHeight = isSmallFormat ? 22 : 30
      const dangerBoxWidth = pageWidth - (margin * 2) - (isSmallFormat ? 15 : 22)
      
      // Red border for dangerous goods - exact match to preview
      pdf.setDrawColor(220, 38, 127) // Red border
      pdf.setLineWidth(0.5)
      pdf.rect(margin + 3, currentY, dangerBoxWidth, dangerBoxHeight, 'S')
      
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
      pdf.text(`CLASSE ${codigoONU || produtoPerigoso?.numeroONU || '321'}`, margin + 4 + dangerBoxWidth - classBadgeWidth, currentY + (isSmallFormat ? 2.5 : 3))
      
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
      pdf.text(codigoONU || produtoPerigoso?.numeroONU || '321', margin + 4.5 + 8, gridY + (gridItemHeight * 0.7))
      
      // RISCO field
      pdf.setFillColor(255, 255, 255)
      pdf.rect(margin + 4 + gridItemWidth, gridY, gridItemWidth - 0.5, gridItemHeight, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.text('RISCO:', margin + 4.5 + gridItemWidth, gridY + (gridItemHeight * 0.7))
      pdf.setFont('helvetica', 'normal')
      pdf.text(codigoRisco || produtoPerigoso?.numeroRisco || '32', margin + 4.5 + gridItemWidth + 10, gridY + (gridItemHeight * 0.7))
      
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
        const classif = classificacoes.find(c => c.value === classificacao)
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
      pdf.text(nomeTecnico || produtoPerigoso?.produto || '3', margin + 4.5 + 22, gridY3 + (gridItemHeight * 0.7))
      
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
    
    // Left side: Weight, transporter and description
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(isSmallFormat ? 8 : 10)
    pdf.setTextColor(0, 0, 0)
    const weight = notaFiscalData?.peso_bruto || '16.200'
    pdf.text(`Peso: ${weight}`, margin + 3, bottomSectionY)
    
    pdf.setFontSize(isSmallFormat ? 7 : 9)
    pdf.text('Transportadora: Transportadora não especificada', margin + 3, bottomSectionY + (isSmallFormat ? 4 : 5))
    
    const volumeText = `Volume ${volume.volume || '1/2'}`
    pdf.text(`Descrição: ${volumeText}`, margin + 3, bottomSectionY + (isSmallFormat ? 8 : 10))
    
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
      toast.error('Erro ao imprimir etiquetas')
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Geração de Etiquetas</h1>
          <p className="text-gray-600">Geração de Etiquetas por Volume</p>
          <p className="text-sm text-gray-500">
            Gere etiquetas de identificação única para cada volume ou etiquetas mais para agrupamento.
          </p>
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
                
                {/* Número do pedido */}
                <div className="space-y-2">
                  <Label>Número do pedido</Label>
                  <Input value={notaFiscalData?.numero_pedido || ""} readOnly />
                </div>

                {/* Peso total */}
                <div className="space-y-2">
                  <Label>Peso total</Label>
                  <Input value={notaFiscalData?.peso_bruto || ""} readOnly />
                </div>

                {/* Quantidade de Volumes */}
                <div className="space-y-2">
                  <Label>Quantidade de Volumes</Label>
                  <Input value={notaFiscalData?.quantidade_volumes || ""} readOnly />
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
                    <Label>Número da Nota Fiscal</Label>
                    <EnhancedInput
                      type="text"
                      value={notaFiscal}
                      onChange={(e) => setNotaFiscal(e.target.value)}
                      placeholder="Ex: 417536"
                    />
                  </div>

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
                    <strong>ID Atual:</strong> {generateVolumeId()}
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
                    <div className="bg-white border-2 border-gray-300 p-4 max-w-md mx-auto rounded">
                      <div className="flex justify-between items-center border-b pb-2 mb-3">
                        <h3 className="font-bold">Transportadora não especificada</h3>
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
                          <div className="text-sm text-gray-600">ID: {generateVolumeId()}</div>
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

                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <div><strong>Peso:</strong> {notaFiscalData?.peso_bruto || 'Não informado'}</div>
                          <div><strong>Transportadora:</strong> Transportadora não especificada</div>
                          <div><strong>Descrição:</strong> Volume 1/{notaFiscalData?.quantidade_volumes || '1'}</div>
                        </div>
                        <div className="bg-blue-600 text-white px-6 py-4 text-center rounded">
                          <div className="text-sm font-semibold">ÁREA</div>
                          <div className="text-4xl font-bold">{selectedArea ? selectedArea.replace('Área ', '') : '01'}</div>
                        </div>
                      </div>
                    </div>
                        <div className="space-y-1 text-xs mb-3 border-2 border-red-300 bg-red-50 p-2 rounded-lg">
                          <div className="flex items-center gap-1 mb-2">
                            <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                              <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-current">
                                <path d="M12 9a3 3 0 00-3 3v3h6v-3a3 3 0 00-3-3zm6 6h-1v-3a5 5 0 00-10 0v3H6a1 1 0 00-1 1v6a1 1 0 001 1h12a1 1 0 001-1v-6a1 1 0 00-1-1z"/>
                              </svg>
                            </div>
                            <span className="font-bold text-red-800 text-xs">PRODUTO PERIGOSO</span>
                            <div className="ml-auto bg-red-600 text-white px-1 py-1 rounded text-xs font-bold">
                              CLASSE {produtoPerigoso?.classeRisco || classe}
                            </div>
                          </div>
                          
                          {/* Product Information Grid - Updated with new fields */}
                          <div className="grid grid-cols-2 gap-1">
                            {codigoONU && (
                              <div className="bg-white border border-red-200 px-1 py-0.5 rounded">
                                <span className="text-red-600 font-semibold text-xs">ONU:</span>
                                <div className="font-bold text-red-800 text-xs">{codigoONU}</div>
                              </div>
                            )}
                            {(produtoPerigoso?.numeroRisco || codigoRisco) && (
                              <div className="bg-white border border-red-200 px-1 py-0.5 rounded">
                                <span className="text-red-600 font-semibold text-xs">RISCO:</span>
                                <div className="font-bold text-red-800 text-xs">{produtoPerigoso?.numeroRisco || codigoRisco}</div>
                              </div>
                            )}
                            {(produtoPerigoso?.classeRisco || classe) && (
                              <div className="bg-white border border-red-200 px-1 py-0.5 rounded">
                                <span className="text-red-600 font-semibold text-xs">CLASSE:</span>
                                <div className="font-bold text-red-800 text-xs">{produtoPerigoso?.classeRisco || classe}</div>
                              </div>
                            )}
                            {classificacao !== 'cargas-nao-classificadas' && (
                              <div className="bg-white border border-red-200 px-1 py-0.5 rounded">
                                <span className="text-red-600 font-semibold text-xs">CLASSIF:</span>
                                <div className="font-bold text-red-800 text-xs">
                                  {classificacoes.find(c => c.value === classificacao)?.label?.replace('Classe ', '') || ''}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Nome Técnico - Compact field */}
                          {(produtoPerigoso || nomeTecnico) && (
                            <div className="bg-white border-2 border-red-300 p-1 rounded">
                              <span className="text-red-600 font-semibold text-xs block">NOME TÉCNICO:</span>
                              <div className="font-bold text-red-900 text-xs leading-tight">
                                {produtoPerigoso?.produto || nomeTecnico}
                              </div>
                            </div>
                          )}

                          {/* Product Name - Updated layout */}
                          {produtoPerigoso && (
                            <div className="bg-white border border-red-200 p-2 rounded">
                              <span className="text-red-600 font-semibold text-xs block mb-1">PRODUTO:</span>
                              <div className="font-bold text-red-900 text-sm leading-tight">
                                {produtoPerigoso.produto}
                              </div>
                            </div>
                          )}

                          {/* Warning Symbol - Compact */}
                          <div className="flex items-center justify-center mt-1 pt-1 border-t border-red-200">
                            <div className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                              ⚠️ MANUSEIO ESPECIALIZADO OBRIGATÓRIO
                            </div>
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
                    <div className="grid grid-cols-8 gap-4 p-3 bg-gray-50 border-b text-sm font-medium">
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
                      <div>Descrição</div>
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
                      <div key={volume.codigo} className="grid grid-cols-8 gap-4 p-3 border-b hover:bg-gray-50 color-transition">
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
                        <div className="text-sm">Volume {volume.volume}</div>
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
                        <div>{getStatusBadge(volume.status)}</div>
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
          <Card>
            <CardHeader>
              <CardTitle>Etiquetas Mix</CardTitle>
              <p className="text-sm text-gray-600">
                Gere etiquetas agrupadas para múltiplos volumes.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Funcionalidade de etiquetas mix em desenvolvimento</p>
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
    </div>
  )
}

export default GeracaoEtiquetas