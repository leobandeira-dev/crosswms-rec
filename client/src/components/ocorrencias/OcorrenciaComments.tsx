
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';

interface OcorrenciaCommentsProps {
  ocorrenciaId: string;
}

const OcorrenciaComments: React.FC<OcorrenciaCommentsProps> = ({ ocorrenciaId }) => {
  const [comment, setComment] = useState('');

  // Mock de comentários para demonstração
  const mockComments = [
    {
      id: '1',
      ocorrenciaId,
      user: 'João Silva',
      content: 'Entrei em contato com o cliente para obter mais informações sobre a ocorrência.',
      timestamp: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
    },
    {
      id: '2',
      ocorrenciaId,
      user: 'Maria Oliveira',
      content: 'Conversado com a transportadora, eles estão investigando o ocorrido e retornarão em breve.',
      timestamp: new Date(Date.now() - 43200000).toISOString() // 12 horas atrás
    }
  ];

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (comment.trim()) {
      // Em uma implementação real, aqui enviaríamos o comentário para o backend
      console.log('Novo comentário:', comment);
      
      // Limpar o campo de comentário
      setComment('');
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Comentários</h3>
        
        <div className="space-y-4">
          {/* Lista de comentários */}
          <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
            {mockComments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted p-3 rounded-md">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium">{comment.user}</h4>
                    <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Formulário de novo comentário */}
          <form onSubmit={handleCommentSubmit} className="flex space-x-2">
            <Textarea
              placeholder="Adicionar um comentário..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 min-h-[80px]"
            />
            <Button type="submit" size="icon" className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default OcorrenciaComments;
