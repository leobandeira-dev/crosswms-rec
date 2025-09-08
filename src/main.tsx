import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root')!;

// Verificar se já existe root para evitar duplicação
if (!rootElement.hasAttribute('data-root-initialized')) {
  rootElement.setAttribute('data-root-initialized', 'true');
  const root = createRoot(rootElement);
  root.render(<App />);
}
