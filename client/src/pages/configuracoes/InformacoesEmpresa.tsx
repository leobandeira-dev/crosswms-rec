import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, MapPin, Phone, Mail, Globe, FileText, Save, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmpresaCompleta {
  id: string;
  nome: string;
  cnpj: string;
  inscricao_estadual?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  website?: string;
  tipo_empresa?: string;
  status?: string;
}

const InformacoesEmpresa: React.FC = () => {
  const { user } = useAuth();
  const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar dados da empresa
  useEffect(() => {
    const loadEmpresaData = async () => {
      if (user?.empresa_id) {
        try {
          const response = await fetch(`/api/empresas/${user.empresa_id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          
          if (response.ok) {
            const empresaData = await response.json();
            setEmpresa(empresaData);
          } else {
            toast({
              title: "Erro",
              description: "Não foi possível carregar os dados da empresa",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Erro ao carregar empresa:', error);
          toast({
            title: "Erro",
            description: "Erro de conexão ao carregar dados da empresa",
            variant: "destructive",
          });
        }
      }
      setLoading(false);
    };

    loadEmpresaData();
  }, [user?.empresa_id]);

  const handleInputChange = (field: keyof EmpresaCompleta, value: string) => {
    if (empresa) {
      setEmpresa({
        ...empresa,
        [field]: value,
      });
    }
  };

  const handleSave = async () => {
    if (!empresa) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/empresas/${empresa.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(empresa),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Informações da empresa atualizadas com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao salvar as informações da empresa",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao salvar dados",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0098DA] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando informações da empresa...</p>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Empresa não encontrada</h2>
          <p className="text-gray-500">Não foi possível carregar as informações da empresa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Configurações</h1>
          <p className="text-gray-600">Gerencie suas informações de empresa, perfil de usuário</p>
        </div>

        {/* Configurações do Sistema */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Configurações do Sistema
            </CardTitle>
            <CardDescription>
              Gerencie e configuração de sua empresa e preferências do sistema
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Informações da Empresa */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informações da Empresa
            </CardTitle>
            <CardDescription>
              Configure dados básicos da empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dados Básicos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={empresa.nome || ''}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Nome da empresa"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={empresa.cnpj || ''}
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                  <Input
                    id="inscricao_estadual"
                    value={empresa.inscricao_estadual || ''}
                    onChange={(e) => handleInputChange('inscricao_estadual', e.target.value)}
                    placeholder="Inscrição estadual"
                  />
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={empresa.telefone || ''}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="(00) 0000-0000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={empresa.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contato@empresa.com.br"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={empresa.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="www.empresa.com.br"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
            <CardDescription>
              Informações de endereço da empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Label htmlFor="endereco">Logradouro</Label>
                <Input
                  id="endereco"
                  value={empresa.endereco || ''}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={empresa.numero || ''}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={empresa.bairro || ''}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  placeholder="Centro"
                />
              </div>
              
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={empresa.cidade || ''}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="São Paulo"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="uf">UF</Label>
                  <Select value={empresa.uf || ''} onValueChange={(value) => handleInputChange('uf', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="AL">AL</SelectItem>
                      <SelectItem value="AP">AP</SelectItem>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="BA">BA</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                      <SelectItem value="DF">DF</SelectItem>
                      <SelectItem value="ES">ES</SelectItem>
                      <SelectItem value="GO">GO</SelectItem>
                      <SelectItem value="MA">MA</SelectItem>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="MS">MS</SelectItem>
                      <SelectItem value="MG">MG</SelectItem>
                      <SelectItem value="PA">PA</SelectItem>
                      <SelectItem value="PB">PB</SelectItem>
                      <SelectItem value="PR">PR</SelectItem>
                      <SelectItem value="PE">PE</SelectItem>
                      <SelectItem value="PI">PI</SelectItem>
                      <SelectItem value="RJ">RJ</SelectItem>
                      <SelectItem value="RN">RN</SelectItem>
                      <SelectItem value="RS">RS</SelectItem>
                      <SelectItem value="RO">RO</SelectItem>
                      <SelectItem value="RR">RR</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="SP">SP</SelectItem>
                      <SelectItem value="SE">SE</SelectItem>
                      <SelectItem value="TO">TO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={empresa.cep || ''}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={empresa.complemento || ''}
                onChange={(e) => handleInputChange('complemento', e.target.value)}
                placeholder="Sala, Andar, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo da Empresa */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Logo da Empresa
            </CardTitle>
            <CardDescription>
              Personalize a logo que aparecerá nos documentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <Button variant="outline" className="mb-2">
                  <Camera className="h-4 w-4 mr-2" />
                  Alterar Logo
                </Button>
                <p className="text-sm text-gray-500">
                  Recomendado: PNG ou JPG, até 2MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#0098DA] hover:bg-[#0077B3] text-white"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InformacoesEmpresa;