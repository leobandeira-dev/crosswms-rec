
import React, { useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Camera, Upload, Truck, CheckSquare } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';

interface ChecklistItem {
  id: string;
  description: string;
  checked: boolean;
}

interface PhotoArea {
  id: string;
  title: string;
  description: string;
  photoUploaded: boolean;
}

const ChecklistCarga: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: 'item1', description: 'Volumes conferidos e contados', checked: false },
    { id: 'item2', description: 'Carga posicionada conforme diagrama', checked: false },
    { id: 'item3', description: 'Material de amarração aplicado', checked: false },
    { id: 'item4', description: 'Carga isolada com plástico', checked: false },
    { id: 'item5', description: 'Lacres instalados conforme procedimento', checked: false },
    { id: 'item6', description: 'Motorista instruído sobre a carga', checked: false },
    { id: 'item7', description: 'Documentação de transporte completa', checked: false },
    { id: 'item8', description: 'Veículo em condições adequadas', checked: false },
  ]);
  
  const [photoAreas, setPhotoAreas] = useState<PhotoArea[]>([
    { id: 'photo1', title: 'Vista frontal da carga', description: 'Foto da parte frontal do compartimento de carga', photoUploaded: false },
    { id: 'photo2', title: 'Vista traseira da carga', description: 'Foto da parte traseira do compartimento de carga', photoUploaded: false },
    { id: 'photo3', title: 'Vista lateral esquerda', description: 'Foto da lateral esquerda do compartimento de carga', photoUploaded: false },
    { id: 'photo4', title: 'Vista lateral direita', description: 'Foto da lateral direita do compartimento de carga', photoUploaded: false },
    { id: 'photo5', title: 'Amarração e proteção', description: 'Detalhe da amarração e proteção da carga', photoUploaded: false },
    { id: 'photo6', title: 'Lacres', description: 'Foto mostrando os lacres instalados', photoUploaded: false },
  ]);

  const handleSearch = () => {
    // Simulação de busca de ordem de carregamento
    setOrderDetails({
      id: orderNumber || 'OC-2023-0123',
      cliente: 'Distribuidora ABC Ltda',
      motorista: 'José da Silva',
      placa: 'ABC-1234',
      destino: 'São Paulo - SP',
      volumes: 28,
      status: 'loading'
    });
  };

  const handleChecklistChange = (id: string) => {
    setChecklistItems(items => 
      items.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handlePhotoUpload = (id: string) => {
    setPhotoAreas(areas => 
      areas.map(area => 
        area.id === id ? { ...area, photoUploaded: true } : area
      )
    );
  };

  const allItemsChecked = checklistItems.every(item => item.checked);
  const allPhotosUploaded = photoAreas.every(area => area.photoUploaded);
  const isReadyToComplete = allItemsChecked && allPhotosUploaded;

  return (
    <MainLayout title="Checklist de Carregamento">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Checklist com Registro Fotográfico</h2>
        <p className="text-gray-600">Realize a inspeção final e documentação fotográfica da carga</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Truck className="mr-2 text-cross-blue" size={20} />
              Buscar Ordem de Carregamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input 
                placeholder="Número da ordem de carregamento" 
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="max-w-sm"
              />
              <Button 
                onClick={handleSearch}
                className="bg-cross-blue hover:bg-cross-blue/90"
              >
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {orderDetails && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes da Ordem de Carregamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                  <div>
                    <p className="text-sm text-gray-500">Número da Ordem</p>
                    <p className="font-medium">{orderDetails.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-medium">{orderDetails.cliente}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Motorista</p>
                    <p className="font-medium">{orderDetails.motorista}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Placa do Veículo</p>
                    <p className="font-medium">{orderDetails.placa}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Destino</p>
                    <p className="font-medium">{orderDetails.destino}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total de Volumes</p>
                    <p className="font-medium">{orderDetails.volumes}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge 
                    status={
                      orderDetails.status === 'loading' ? 'info' : 
                      orderDetails.status === 'completed' ? 'success' : 'warning'
                    } 
                    text={
                      orderDetails.status === 'loading' ? 'Em Carregamento' : 
                      orderDetails.status === 'completed' ? 'Carregamento Finalizado' : 'Pendente'
                    } 
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CheckSquare className="mr-2 text-cross-blue" size={20} />
                    Checklist de Carregamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {checklistItems.map(item => (
                      <div key={item.id} className="flex items-start space-x-3">
                        <Checkbox 
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={() => handleChecklistChange(item.id)}
                        />
                        <label 
                          htmlFor={item.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {item.description}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4">
                  <div>
                    <span className="text-sm">{checklistItems.filter(i => i.checked).length} de {checklistItems.length} itens verificados</span>
                  </div>
                  {allItemsChecked && (
                    <StatusBadge status="success" text="Checklist Completo" />
                  )}
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Camera className="mr-2 text-cross-blue" size={20} />
                    Registro Fotográfico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {photoAreas.map(area => (
                      <div 
                        key={area.id} 
                        className={`border rounded-md p-4 ${area.photoUploaded ? 'bg-green-50 border-green-200' : ''}`}
                      >
                        <h4 className="font-medium mb-1">{area.title}</h4>
                        <p className="text-sm text-gray-500 mb-3">{area.description}</p>
                        {area.photoUploaded ? (
                          <div className="h-32 bg-gray-100 flex items-center justify-center rounded">
                            <div className="text-center">
                              <FileText size={30} className="mx-auto text-green-600" />
                              <p className="text-sm text-green-600 mt-1">Foto carregada</p>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            className="w-full border-dashed" 
                            onClick={() => handlePhotoUpload(area.id)}
                          >
                            <Upload size={16} className="mr-2" /> 
                            Carregar Foto
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4">
                  <div>
                    <span className="text-sm">{photoAreas.filter(a => a.photoUploaded).length} de {photoAreas.length} fotos carregadas</span>
                  </div>
                  {allPhotosUploaded && (
                    <StatusBadge status="success" text="Fotos Completas" />
                  )}
                </CardFooter>
              </Card>
            </div>
            
            <Card className="mt-4">
              <CardContent className="p-4 flex justify-end">
                <Button 
                  disabled={!isReadyToComplete} 
                  className={`${isReadyToComplete ? 'bg-cross-blue hover:bg-cross-blue/90' : 'bg-gray-300'}`}
                >
                  Finalizar Carregamento
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ChecklistCarga;
