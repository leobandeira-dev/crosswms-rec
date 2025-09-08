import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Crown, Truck } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-cross-blue text-white p-4 rounded-full">
              <Truck className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CrossWMS
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema de Gestão Logística
          </p>
          <p className="text-lg text-gray-500 mt-2">
            Escolha a versão do sistema que deseja acessar
          </p>
        </div>

        {/* Version Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Nova Versão */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-cross-blue">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-cross-blue text-white p-3 rounded-full group-hover:scale-110 transition-transform">
                  <Crown className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-2xl text-cross-blue">Nova Versão</CardTitle>
              <CardDescription className="text-base">
                Interface moderna e otimizada com todas as funcionalidades avançadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Dashboard Super Admin
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Gestão Completa de Logística
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Interface Moderna e Responsiva
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Todas as Funcionalidades Integradas
                </div>
              </div>
              
              <Link to="/admin" className="block">
                <Button className="w-full bg-cross-blue hover:bg-cross-blueDark text-white group-hover:shadow-lg transition-all">
                  Acessar Nova Versão
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Versão Antiga */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-gray-400">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-gray-600 text-white p-3 rounded-full group-hover:scale-110 transition-transform">
                  <Truck className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-2xl text-gray-700">Versão Anterior</CardTitle>
              <CardDescription className="text-base">
                Acesse a versão anterior do sistema para funcionalidades específicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Sistema Legacy
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Funcionalidades Básicas
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Interface Clássica
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Compatibilidade Garantida
                </div>
              </div>
              
              <Link to="/legacy" className="block">
                <Button variant="outline" className="w-full border-gray-400 hover:bg-gray-50 group-hover:shadow-lg transition-all">
                  Acessar Versão Anterior
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            © 2025 CrossWMS - Sistema de Gestão Logística
          </p>
          <p className="text-xs mt-1">
            Desenvolvido para otimizar suas operações logísticas
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
