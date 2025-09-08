import React from 'react';

const TestPage = () => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', fontSize: '2rem', marginBottom: '20px' }}>
          🎉 CrossWMS Funcionando!
        </h1>
        <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '30px' }}>
          Sistema restaurado com sucesso
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <a href="/admin" style={{
            backgroundColor: '#0066CC',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            ➡️ Acessar Sistema
          </a>
          <a href="/legacy" style={{
            backgroundColor: '#666',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            📊 Versão Anterior
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
