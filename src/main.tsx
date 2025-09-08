import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root')!;

// Limpar completamente o root element para evitar conflitos
rootElement.innerHTML = '';

// Aguardar o próximo tick para garantir que o DOM esteja limpo
setTimeout(() => {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error('Error initializing React:', error);
  }
}, 0);
