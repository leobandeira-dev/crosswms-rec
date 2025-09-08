import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HelpCircle, 
  Play, 
  Clock, 
  BookOpen, 
  Video,
  Search,
  X,
  ChevronRight,
  Star
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

interface HelpTutorial {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  category: string;
  tags: string[];
  difficulty: 'Básico' | 'Intermediário' | 'Avançado';
  pageContext?: string[];
  thumbnail?: string;
}

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  contextualPage?: string;
}

const tutorials: HelpTutorial[] = [
  {
    id: 'dashboard-overview',
    title: 'Visão Geral do Dashboard',
    description: 'Aprenda a navegar pelo dashboard principal e entender as métricas apresentadas',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '2:30',
    category: 'Dashboard',
    tags: ['dashboard', 'métricas', 'navegação'],
    difficulty: 'Básico',
    pageContext: ['/dashboard', '/admin/dashboard', '/']
  },
  {
    id: 'nfe-import',
    title: 'Importar Notas Fiscais',
    description: 'Como importar NFe via XML, API ou entrada manual no sistema',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '4:15',
    category: 'Notas Fiscais',
    tags: ['nfe', 'xml', 'importação', 'api'],
    difficulty: 'Intermediário',
    pageContext: ['/coletas/nova-ordem', '/armazenagem/recebimento']
  },
  {
    id: 'volume-management',
    title: 'Gestão de Volumes',
    description: 'Aprenda a gerenciar volumes, cubagem e dimensionamento',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '3:45',
    category: 'Volumes',
    tags: ['volumes', 'cubagem', 'dimensões'],
    difficulty: 'Intermediário',
    pageContext: ['/coletas/nova-ordem', '/armazenagem/carregamento/ordem']
  },
  {
    id: 'user-permissions',
    title: 'Configurar Permissões de Usuário',
    description: 'Como configurar perfis e permissões granulares no sistema',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '5:20',
    category: 'Administração',
    tags: ['usuários', 'permissões', 'perfis'],
    difficulty: 'Avançado',
    pageContext: ['/configuracoes', '/admin/usuarios']
  },
  {
    id: 'order-creation',
    title: 'Criar Ordem de Carregamento',
    description: 'Passo a passo para criar uma nova ordem de carregamento completa',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '6:10',
    category: 'Carregamento',
    tags: ['ordem', 'carregamento', 'workflow'],
    difficulty: 'Intermediário',
    pageContext: ['/armazenagem/carregamento/ordem', '/carregamento']
  },
  {
    id: 'cnpj-search',
    title: 'Busca Automática por CNPJ',
    description: 'Como usar a busca automática de dados corporativos por CNPJ',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '2:15',
    category: 'Cadastros',
    tags: ['cnpj', 'busca', 'dados'],
    difficulty: 'Básico',
    pageContext: ['/coletas/nova-ordem', '/cadastros']
  }
];

const difficultyColors = {
  'Básico': 'bg-green-100 text-green-800 border-green-300',
  'Intermediário': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Avançado': 'bg-red-100 text-red-800 border-red-300'
};

export function HelpSystem({ isOpen, onClose, contextualPage }: HelpSystemProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTutorial, setSelectedTutorial] = useState<HelpTutorial | null>(null);
  const [filteredTutorials, setFilteredTutorials] = useState<HelpTutorial[]>(tutorials);

  const categories = ['all', ...Array.from(new Set(tutorials.map(t => t.category)))];

  // Filter contextual tutorials
  const contextualTutorials = contextualPage 
    ? tutorials.filter(t => t.pageContext?.some(page => contextualPage.includes(page)))
    : [];

  useEffect(() => {
    let filtered = tutorials;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tutorial =>
        tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutorial.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tutorial => tutorial.category === selectedCategory);
    }

    setFilteredTutorials(filtered);
  }, [searchTerm, selectedCategory]);

  const handleTutorialSelect = (tutorial: HelpTutorial) => {
    setSelectedTutorial(tutorial);
  };

  const TutorialCard = ({ tutorial }: { tutorial: HelpTutorial }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
      onClick={() => handleTutorialSelect(tutorial)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-16 h-12 bg-gradient-to-br from-[#0098DA] to-blue-600 rounded-lg flex items-center justify-center">
            <Play className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 mb-1 truncate">{tutorial.title}</h4>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{tutorial.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-xs ${difficultyColors[tutorial.difficulty]}`}>
                {tutorial.difficulty}
              </Badge>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {tutorial.duration}
              </div>
              <Badge variant="outline" className="text-xs">
                {tutorial.category}
              </Badge>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );

  const VideoPlayer = ({ tutorial }: { tutorial: HelpTutorial }) => (
    <div className="space-y-4">
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={tutorial.videoUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={tutorial.title}
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{tutorial.title}</h3>
            <p className="text-gray-600 mt-1">{tutorial.description}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedTutorial(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={`${difficultyColors[tutorial.difficulty]}`}>
            {tutorial.difficulty}
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {tutorial.duration}
          </div>
          <Badge variant="outline">
            {tutorial.category}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {tutorial.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[#0098DA]" />
            Central de Ajuda
          </DialogTitle>
        </DialogHeader>

        {selectedTutorial ? (
          <VideoPlayer tutorial={selectedTutorial} />
        ) : (
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="contextual" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="contextual" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Para Esta Página
                </TabsTrigger>
                <TabsTrigger value="browse" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Todos os Tutoriais
                </TabsTrigger>
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="contextual" className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {contextualTutorials.length > 0 ? (
                    <>
                      <p className="text-sm text-gray-600">
                        Tutoriais específicos para a página atual:
                      </p>
                      {contextualTutorials.map(tutorial => (
                        <TutorialCard key={tutorial.id} tutorial={tutorial} />
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Nenhum tutorial específico disponível para esta página.
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Veja todos os tutoriais na aba "Todos os Tutoriais"
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="browse" className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="text-xs"
                      >
                        {category === 'all' ? 'Todos' : category}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {filteredTutorials.map(tutorial => (
                      <TutorialCard key={tutorial.id} tutorial={tutorial} />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="search" className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar tutoriais, tags ou categorias..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="space-y-3">
                    {filteredTutorials.map(tutorial => (
                      <TutorialCard key={tutorial.id} tutorial={tutorial} />
                    ))}
                  </div>
                  {filteredTutorials.length === 0 && searchTerm && (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Nenhum tutorial encontrado para "{searchTerm}"
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Floating Help Button Component
interface HelpButtonProps {
  contextualPage?: string;
}

export function HelpButton({ contextualPage }: HelpButtonProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#0098DA] hover:bg-blue-600 text-white shadow-lg z-50"
        size="icon"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
      
      <HelpSystem
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        contextualPage={contextualPage}
      />
    </>
  );
}

// Hook for contextual help
export function useContextualHelp() {
  const [location] = useLocation();
  
  return {
    currentPage: location,
    contextualTutorials: tutorials.filter(t => 
      t.pageContext?.some(page => location.includes(page))
    )
  };
}