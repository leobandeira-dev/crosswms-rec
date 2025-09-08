
import React from 'react';

const HelpInfoBox: React.FC = () => {
  return (
    <div className="bg-muted/20 p-4 rounded-lg mt-4">
      <h4 className="font-medium mb-2">Como o cálculo é feito:</h4>
      <ul className="space-y-1 text-sm text-muted-foreground">
        <li>• Frete Peso Viagem = (Frete por tonelada × Peso considerado) / 1000</li>
        <li>• Expresso Viagem = Frete Peso × Alíquota do expresso</li>
        <li>• ICMS = (Base de cálculo / (100 - Alíquota ICMS)) - Base de cálculo</li>
        <li>• Base de cálculo = Frete Peso + Pedágio + Expresso</li>
        <li>• Total = Frete Peso + Expresso + Pedágio + ICMS</li>
      </ul>
    </div>
  );
};

export default HelpInfoBox;
