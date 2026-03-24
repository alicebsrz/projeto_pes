// Arquivo: frontend/src/App.jsx


import React, { useState } from 'react';
import axios from 'axios'; // Certifique-se de importar o axios aqui!
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import EntradaLotes from './pages/EntradaLotes';
import Vendas from './pages/Vendas';
import Login from './pages/Login';

// ==========================================
// INTERCEPTADOR DO AXIOS 
// Ele pega o token do navegador e injeta em todas as requisições
// ==========================================
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Coloca o token no cabeçalho (Header) da requisição
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  // 2. Estado para verificar se o usuário está logado
  // Ele tenta buscar a chave (token) no localStorage logo que a página abre
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [paginaAtual, setPaginaAtual] = useState('dashboard');

  // 3. A REGRA DE OURO: Se não tem token, mostra SÓ O LOGIN e esconde o resto!
  if (!token) {
    return <Login setToken={setToken} />;
  }

  const renderizarPagina = () => {
    if (paginaAtual === 'dashboard') return <Dashboard />;
    if (paginaAtual === 'entrada') return <EntradaLotes />;
    if (paginaAtual === 'vendas') return <Vendas />;
    return <Dashboard />;
  };

  return (
    <div style={estilos.layoutGeral}>
      <Sidebar paginaAtual={paginaAtual} setPaginaAtual={setPaginaAtual} />

      <div style={estilos.areaPrincipal}>
        {/* Passamos o setToken para o Header poder fazer o Logout */}
        <Header setToken={setToken} />
        <main style={estilos.conteudo}>
          {renderizarPagina()}
        </main>
      </div>
    </div>
  );
}

const estilos = {
  layoutGeral: {
    display: 'flex',
    height: '100vh',
    backgroundColor: 'var(--cor-fundo-tela)',
  },
  areaPrincipal: {
    flex: 1, // Ocupa todo o resto do espaço que sobrou do menu
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    overflowY: 'auto', // Adiciona rolagem se tiver muitos itens
  },
  conteudo: {
    padding: '20px',
  }
};

export default App;