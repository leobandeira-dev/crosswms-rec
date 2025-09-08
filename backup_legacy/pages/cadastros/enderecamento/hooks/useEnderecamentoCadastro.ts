
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  Filial,
  Area,
  Rota,
  Rua,
  Predio,
  Bloco,
  Andar,
  Apartamento,
  EnderecoCompleto
} from '@/types/enderecamento.cadastro.types';
import {
  filiais as mockFiliais,
  areas as mockAreas,
  rotas as mockRotas,
  ruas as mockRuas,
  predios as mockPredios,
  blocos as mockBlocos,
  andares as mockAndares,
  apartamentos as mockApartamentos,
  enderecosCompletos as mockEnderecosCompletos
} from '../data/enderecamentoMock';

export const useEnderecamentoCadastro = () => {
  const { toast } = useToast();
  
  // Estado para cada nível da hierarquia
  const [filiais, setFiliais] = useState<Filial[]>(mockFiliais);
  const [areas, setAreas] = useState<Area[]>(mockAreas);
  const [rotas, setRotas] = useState<Rota[]>(mockRotas);
  const [ruas, setRuas] = useState<Rua[]>(mockRuas);
  const [predios, setPredios] = useState<Predio[]>(mockPredios);
  const [blocos, setBlocos] = useState<Bloco[]>(mockBlocos);
  const [andares, setAndares] = useState<Andar[]>(mockAndares);
  const [apartamentos, setApartamentos] = useState<Apartamento[]>(mockApartamentos);
  const [enderecosCompletos, setEnderecosCompletos] = useState<EnderecoCompleto[]>(mockEnderecosCompletos);
  
  // Estado para armazenar o item em edição
  const [currentFilial, setCurrentFilial] = useState<Filial | null>(null);
  const [currentArea, setCurrentArea] = useState<Area | null>(null);
  const [currentRota, setCurrentRota] = useState<Rota | null>(null);
  const [currentRua, setCurrentRua] = useState<Rua | null>(null);
  const [currentPredio, setCurrentPredio] = useState<Predio | null>(null);
  const [currentBloco, setCurrentBloco] = useState<Bloco | null>(null);
  const [currentAndar, setCurrentAndar] = useState<Andar | null>(null);
  const [currentApartamento, setCurrentApartamento] = useState<Apartamento | null>(null);
  
  // Funções para adicionar novos itens
  const adicionarFilial = (filial: Omit<Filial, 'id'>) => {
    const novaFilial: Filial = { ...filial, id: (filiais.length + 1).toString() };
    setFiliais([...filiais, novaFilial]);
    toast({
      title: "Filial adicionada",
      description: `Filial ${filial.nome} adicionada com sucesso.`
    });
  };
  
  const adicionarArea = (area: Omit<Area, 'id'>) => {
    const novaArea: Area = { ...area, id: (areas.length + 1).toString() };
    setAreas([...areas, novaArea]);
    toast({
      title: "Área adicionada",
      description: `Área ${area.nome} adicionada com sucesso.`
    });
  };
  
  const adicionarRota = (rota: Omit<Rota, 'id'>) => {
    const novaRota: Rota = { ...rota, id: (rotas.length + 1).toString() };
    setRotas([...rotas, novaRota]);
    toast({
      title: "Rota adicionada",
      description: `Rota ${rota.nome} adicionada com sucesso.`
    });
  };
  
  const adicionarRua = (rua: Omit<Rua, 'id'>) => {
    const novaRua: Rua = { ...rua, id: (ruas.length + 1).toString() };
    setRuas([...ruas, novaRua]);
    toast({
      title: "Rua adicionada",
      description: `Rua ${rua.nome} adicionada com sucesso.`
    });
  };
  
  const adicionarPredio = (predio: Omit<Predio, 'id'>) => {
    const novoPredio: Predio = { ...predio, id: (predios.length + 1).toString() };
    setPredios([...predios, novoPredio]);
    toast({
      title: "Prédio adicionado",
      description: `Prédio ${predio.nome} adicionado com sucesso.`
    });
  };
  
  const adicionarBloco = (bloco: Omit<Bloco, 'id'>) => {
    const novoBloco: Bloco = { ...bloco, id: (blocos.length + 1).toString() };
    setBlocos([...blocos, novoBloco]);
    toast({
      title: "Bloco adicionado",
      description: `Bloco ${bloco.nome} adicionado com sucesso.`
    });
  };
  
  const adicionarAndar = (andar: Omit<Andar, 'id'>) => {
    const novoAndar: Andar = { ...andar, id: (andares.length + 1).toString() };
    setAndares([...andares, novoAndar]);
    toast({
      title: "Andar adicionado",
      description: `Andar ${andar.nome} adicionado com sucesso.`
    });
  };
  
  const adicionarApartamento = (apartamento: Omit<Apartamento, 'id'>) => {
    const novoApartamento: Apartamento = { ...apartamento, id: (apartamentos.length + 1).toString() };
    setApartamentos([...apartamentos, novoApartamento]);
    
    // Encontrar os dados para construir o endereço completo
    const andar = andares.find(a => a.id === apartamento.andarId);
    if (!andar) return;
    
    const bloco = blocos.find(b => b.id === andar.blocoId);
    if (!bloco) return;
    
    const predio = predios.find(p => p.id === bloco.predioId);
    if (!predio) return;
    
    const rua = ruas.find(r => r.id === predio.ruaId);
    if (!rua) return;
    
    const rota = rotas.find(r => r.id === rua.rotaId);
    if (!rota) return;
    
    const area = areas.find(a => a.id === rota.areaId);
    if (!area) return;
    
    const filial = filiais.find(f => f.id === area.filialId);
    if (!filial) return;
    
    // Construir o endereço completo
    const novoEndereco: EnderecoCompleto = {
      id: (enderecosCompletos.length + 1).toString(),
      filial: filial.codigo,
      area: area.codigo,
      rota: rota.codigo,
      rua: rua.codigo,
      predio: predio.codigo,
      bloco: bloco.codigo,
      andar: andar.codigo,
      apartamento: novoApartamento.codigo,
      endereco: `${filial.codigo}-${area.codigo}-${rota.codigo}-${rua.codigo}-${predio.codigo}-${bloco.codigo}-${andar.codigo}-${novoApartamento.codigo}`,
      capacidade: apartamento.capacidade.toString(),
      tipoEstoque: apartamento.tipoEstoque,
      disponivel: true
    };
    
    setEnderecosCompletos([...enderecosCompletos, novoEndereco]);
    
    toast({
      title: "Apartamento adicionado",
      description: `Apartamento ${apartamento.nome} adicionado com sucesso.`
    });
  };
  
  // Funções para atualizar itens
  const atualizarFilial = (id: string, dadosAtualizados: Partial<Filial>) => {
    setFiliais(prevFiliais => 
      prevFiliais.map(filial => 
        filial.id === id ? { ...filial, ...dadosAtualizados } : filial
      )
    );
    toast({
      title: "Filial atualizada",
      description: "Filial atualizada com sucesso."
    });
  };
  
  // Funções semelhantes para os demais níveis da hierarquia
  const atualizarArea = (id: string, dadosAtualizados: Partial<Area>) => {
    setAreas(prev => prev.map(item => item.id === id ? { ...item, ...dadosAtualizados } : item));
    toast({
      title: "Área atualizada",
      description: "Área atualizada com sucesso."
    });
  };
  
  const atualizarRota = (id: string, dadosAtualizados: Partial<Rota>) => {
    setRotas(prev => prev.map(item => item.id === id ? { ...item, ...dadosAtualizados } : item));
    toast({
      title: "Rota atualizada",
      description: "Rota atualizada com sucesso."
    });
  };
  
  const atualizarRua = (id: string, dadosAtualizados: Partial<Rua>) => {
    setRuas(prev => prev.map(item => item.id === id ? { ...item, ...dadosAtualizados } : item));
    toast({
      title: "Rua atualizada",
      description: "Rua atualizada com sucesso."
    });
  };
  
  const atualizarPredio = (id: string, dadosAtualizados: Partial<Predio>) => {
    setPredios(prev => prev.map(item => item.id === id ? { ...item, ...dadosAtualizados } : item));
    toast({
      title: "Prédio atualizado",
      description: "Prédio atualizado com sucesso."
    });
  };
  
  const atualizarBloco = (id: string, dadosAtualizados: Partial<Bloco>) => {
    setBlocos(prev => prev.map(item => item.id === id ? { ...item, ...dadosAtualizados } : item));
    toast({
      title: "Bloco atualizado",
      description: "Bloco atualizado com sucesso."
    });
  };
  
  const atualizarAndar = (id: string, dadosAtualizados: Partial<Andar>) => {
    setAndares(prev => prev.map(item => item.id === id ? { ...item, ...dadosAtualizados } : item));
    toast({
      title: "Andar atualizado",
      description: "Andar atualizado com sucesso."
    });
  };
  
  const atualizarApartamento = (id: string, dadosAtualizados: Partial<Apartamento>) => {
    setApartamentos(prev => prev.map(item => item.id === id ? { ...item, ...dadosAtualizados } : item));
    
    // Atualizar também o endereço completo se necessário
    if (dadosAtualizados.capacidade || dadosAtualizados.tipoEstoque || dadosAtualizados.andarId || dadosAtualizados.codigo) {
      const apartamento = apartamentos.find(a => a.id === id);
      if (!apartamento) return;
      
      setEnderecosCompletos(prev => 
        prev.map(endereco => {
          if (endereco.apartamento === apartamento.codigo) {
            return {
              ...endereco,
              capacidade: dadosAtualizados.capacidade?.toString() || endereco.capacidade,
              tipoEstoque: dadosAtualizados.tipoEstoque || endereco.tipoEstoque,
              apartamento: dadosAtualizados.codigo || endereco.apartamento,
              // Nota: Se o andarId for alterado, precisaríamos reconstruir todo o endereço
            };
          }
          return endereco;
        })
      );
    }
    
    toast({
      title: "Apartamento atualizado",
      description: "Apartamento atualizado com sucesso."
    });
  };
  
  // Funções para excluir itens
  const excluirItem = <T extends { id: string, nome: string }>(
    id: string,
    items: T[],
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    tipo: string
  ) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    setItems(items.filter(i => i.id !== id));
    toast({
      title: `${tipo} excluído`,
      description: `${tipo} ${item.nome} foi excluído com sucesso.`
    });
  };

  return {
    // Dados
    filiais,
    areas,
    rotas,
    ruas,
    predios,
    blocos,
    andares,
    apartamentos,
    enderecosCompletos,
    
    // Estado atual de edição
    currentFilial,
    setCurrentFilial,
    currentArea,
    setCurrentArea,
    currentRota,
    setCurrentRota,
    currentRua,
    setCurrentRua,
    currentPredio,
    setCurrentPredio,
    currentBloco,
    setCurrentBloco,
    currentAndar,
    setCurrentAndar,
    currentApartamento,
    setCurrentApartamento,
    
    // Funções para adicionar
    adicionarFilial,
    adicionarArea,
    adicionarRota,
    adicionarRua,
    adicionarPredio,
    adicionarBloco,
    adicionarAndar,
    adicionarApartamento,
    
    // Funções para atualizar
    atualizarFilial,
    atualizarArea,
    atualizarRota,
    atualizarRua,
    atualizarPredio,
    atualizarBloco,
    atualizarAndar,
    atualizarApartamento,
    
    // Funções para excluir
    excluirFilial: (id: string) => excluirItem(id, filiais, setFiliais, 'Filial'),
    excluirArea: (id: string) => excluirItem(id, areas, setAreas, 'Área'),
    excluirRota: (id: string) => excluirItem(id, rotas, setRotas, 'Rota'),
    excluirRua: (id: string) => excluirItem(id, ruas, setRuas, 'Rua'),
    excluirPredio: (id: string) => excluirItem(id, predios, setPredios, 'Prédio'),
    excluirBloco: (id: string) => excluirItem(id, blocos, setBlocos, 'Bloco'),
    excluirAndar: (id: string) => excluirItem(id, andares, setAndares, 'Andar'),
    excluirApartamento: (id: string) => excluirItem(id, apartamentos, setApartamentos, 'Apartamento'),
  };
};
