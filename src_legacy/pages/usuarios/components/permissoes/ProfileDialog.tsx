
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Profile } from './types';

interface ProfileDialogProps { 
  onSavePerfil: (nome: string, descricao: string, id?: string) => void;
  editingProfile?: Profile | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({ 
  onSavePerfil, 
  editingProfile = null, 
  isOpen,
  setIsOpen
}) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (editingProfile) {
      setNome(editingProfile.nome);
      setDescricao(editingProfile.descricao || '');
    } else {
      setNome('');
      setDescricao('');
    }
  }, [editingProfile, isOpen]);

  const handleSubmit = () => {
    if (!nome) {
      toast({
        title: "Erro",
        description: "Nome do perfil é obrigatório",
        variant: "destructive"
      });
      return;
    }

    onSavePerfil(nome, descricao, editingProfile?.id);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingProfile ? 'Editar Perfil de Usuário' : 'Adicionar Novo Perfil de Usuário'}</DialogTitle>
          <DialogDescription>
            {editingProfile ? 'Edite as informações do perfil existente.' : 'Crie um novo perfil para usuários do sistema com permissões específicas.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Perfil</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Supervisor" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Input id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição do perfil" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-cross-blue hover:bg-cross-blue/90">
            {editingProfile ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
