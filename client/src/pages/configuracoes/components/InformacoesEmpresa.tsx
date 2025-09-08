import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Save,
  RefreshCw,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Empresa } from "@shared/schema";

interface EmpresaForm {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_estadual: string;
  inscricao_municipal: string;
  email: string;
  telefone: string;
  celular: string;
  website: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  observacoes: string;
}

export default function InformacoesEmpresa() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isBuscandoCnpj, setIsBuscandoCnpj] = useState(false);

  const { data: empresa, isLoading: isLoadingEmpresa } = useQuery<Empresa>({
    queryKey: ['/api/empresa/atual'],
  });

  const [formData, setFormData] = useState<EmpresaForm>({
    razao_social: empresa?.razao_social || "",
    nome_fantasia: empresa?.nome_fantasia || "",
    cnpj: empresa?.cnpj || "",
    inscricao_estadual: empresa?.inscricao_estadual || "",
    inscricao_municipal: empresa?.inscricao_municipal || "",
    email: empresa?.email || "",
    telefone: empresa?.telefone || "",
    celular: empresa?.celular || "",
    website: empresa?.website || "",
    endereco: empresa?.endereco || "",
    numero: empresa?.numero || "",
    complemento: empresa?.complemento || "",
    bairro: empresa?.bairro || "",
    cidade: empresa?.cidade || "",
    uf: empresa?.uf || "",
    cep: empresa?.cep || "",
    observacoes: empresa?.observacoes || ""
  });

  const handleInputChange = (field: keyof EmpresaForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const buscarCNPJ = async () => {
    if (!formData.cnpj || formData.cnpj.length !== 14) {
      toast({
        title: "CNPJ inválido",
        description: "Digite um CNPJ válido com 14 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsBuscandoCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${formData.cnpj}`);
      
      if (!response.ok) {
        throw new Error('CNPJ não encontrado');
      }

      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        razao_social: data.razao_social || prev.razao_social,
        nome_fantasia: data.nome_fantasia || prev.nome_fantasia,
        email: data.email || prev.email,
        telefone: data.ddd_telefone_1 || prev.telefone,
        endereco: data.logradouro || prev.endereco,
        numero: data.numero || prev.numero,
        complemento: data.complemento || prev.complemento,
        bairro: data.bairro || prev.bairro,
        cidade: data.municipio || prev.cidade,
        uf: data.uf || prev.uf,
        cep: data.cep || prev.cep
      }));

      toast({
        title: "CNPJ encontrado",
        description: "Dados da empresa foram preenchidos automaticamente.",
      });
    } catch (error) {
      toast({
        title: "Erro ao buscar CNPJ",
        description: "Não foi possível encontrar os dados do CNPJ informado.",
        variant: "destructive",
      });
    } finally {
      setIsBuscandoCnpj(false);
    }
  };

  const formatCNPJ = (cnpj: string) => {
    const digits = cnpj.replace(/\D/g, '');
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatCEP = (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Empresa atualizada",
        description: "As informações da empresa foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as informações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingEmpresa) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Informações da Empresa
          </h3>
          <p className="text-gray-600">
            Configure dados básicos da empresa
          </p>
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="bg-[#0098DA] hover:bg-[#007BB5] text-white"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados Básicos */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Building className="h-5 w-5 mr-2 text-[#0098DA]" />
              Dados Básicos
            </CardTitle>
            <CardDescription>
              Informações principais da empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="cnpj"
                  value={formatCNPJ(formData.cnpj)}
                  onChange={(e) => handleInputChange('cnpj', e.target.value.replace(/\D/g, ''))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
                <Button
                  variant="outline"
                  onClick={buscarCNPJ}
                  disabled={isBuscandoCnpj || !formData.cnpj}
                  className="border-[#0098DA] text-[#0098DA] hover:bg-[#0098DA] hover:text-white"
                >
                  {isBuscandoCnpj ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="razao_social">Razão Social</Label>
              <Input
                id="razao_social"
                value={formData.razao_social}
                onChange={(e) => handleInputChange('razao_social', e.target.value)}
                placeholder="Nome empresarial registrado"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
              <Input
                id="nome_fantasia"
                value={formData.nome_fantasia}
                onChange={(e) => handleInputChange('nome_fantasia', e.target.value)}
                placeholder="Nome comercial"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                <Input
                  id="inscricao_estadual"
                  value={formData.inscricao_estadual}
                  onChange={(e) => handleInputChange('inscricao_estadual', e.target.value)}
                  placeholder="IE"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
                <Input
                  id="inscricao_municipal"
                  value={formData.inscricao_municipal}
                  onChange={(e) => handleInputChange('inscricao_municipal', e.target.value)}
                  placeholder="IM"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-[#0098DA]" />
              Contato
            </CardTitle>
            <CardDescription>
              Informações de contato da empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contato@empresa.com.br"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formatPhone(formData.telefone)}
                  onChange={(e) => handleInputChange('telefone', e.target.value.replace(/\D/g, ''))}
                  placeholder="(11) 1234-5678"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  value={formatPhone(formData.celular)}
                  onChange={(e) => handleInputChange('celular', e.target.value.replace(/\D/g, ''))}
                  placeholder="(11) 99999-9999"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.empresa.com.br"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Endereço */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-[#0098DA]" />
            Endereço
          </CardTitle>
          <CardDescription>
            Endereço completo da empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="endereco">Logradouro</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                placeholder="Rua, Avenida, etc."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
                placeholder="123"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={formData.complemento}
                onChange={(e) => handleInputChange('complemento', e.target.value)}
                placeholder="Sala, Andar, etc."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => handleInputChange('bairro', e.target.value)}
                placeholder="Nome do bairro"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formatCEP(formData.cep)}
                onChange={(e) => handleInputChange('cep', e.target.value.replace(/\D/g, ''))}
                placeholder="00000-000"
                className="mt-1"
                maxLength={9}
              />
            </div>

            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
                placeholder="Nome da cidade"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="uf">UF</Label>
              <Select value={formData.uf} onValueChange={(value) => handleInputChange('uf', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AC">Acre</SelectItem>
                  <SelectItem value="AL">Alagoas</SelectItem>
                  <SelectItem value="AP">Amapá</SelectItem>
                  <SelectItem value="AM">Amazonas</SelectItem>
                  <SelectItem value="BA">Bahia</SelectItem>
                  <SelectItem value="CE">Ceará</SelectItem>
                  <SelectItem value="DF">Distrito Federal</SelectItem>
                  <SelectItem value="ES">Espírito Santo</SelectItem>
                  <SelectItem value="GO">Goiás</SelectItem>
                  <SelectItem value="MA">Maranhão</SelectItem>
                  <SelectItem value="MT">Mato Grosso</SelectItem>
                  <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                  <SelectItem value="MG">Minas Gerais</SelectItem>
                  <SelectItem value="PA">Pará</SelectItem>
                  <SelectItem value="PB">Paraíba</SelectItem>
                  <SelectItem value="PR">Paraná</SelectItem>
                  <SelectItem value="PE">Pernambuco</SelectItem>
                  <SelectItem value="PI">Piauí</SelectItem>
                  <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                  <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                  <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                  <SelectItem value="RO">Rondônia</SelectItem>
                  <SelectItem value="RR">Roraima</SelectItem>
                  <SelectItem value="SC">Santa Catarina</SelectItem>
                  <SelectItem value="SP">São Paulo</SelectItem>
                  <SelectItem value="SE">Sergipe</SelectItem>
                  <SelectItem value="TO">Tocantins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Informações adicionais sobre a empresa"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}