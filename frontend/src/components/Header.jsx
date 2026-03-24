// Arquivo: frontend/src/components/Header.jsx
import React from 'react';
// 1. Importando a imagem diretamente da pasta assets
import logoImg from '../assets/logo.png';
import { LogOut } from 'lucide-react'; // Trocamos LogIn por LogOut

// Recebe a função de atualizar o token
function Header({ setToken }) {
  // Resgata o nome do usuário que salvamos no login
  const nomeUsuario = localStorage.getItem('nomeUsuario') || 'Feirante';

  // Função para deslogar
  const handleLogout = () => {
    localStorage.removeItem('token'); // Destrói o crachá
    localStorage.removeItem('nomeUsuario');
    setToken(null); // Avisa o App.jsx para mostrar a tela de login
  };

  return (
    <header style={estilos.header}>
      <div style={estilos.logoContainer}>
        <img 
          src={logoImg} 
          alt="Logo PomarTech" 
          style={estilos.logo} 
          // O onError é um truque: se a imagem não for encontrada, ele mostra um texto para a tela não quebrar
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
        />
        <h2 style={{...estilos.logoFallback, display: 'none'}}>Sua Logo Aqui</h2>
      </div>
      
      <div style={estilos.areaUsuario}>
        <span style={estilos.saudacao}>Olá, {nomeUsuario}</span>
        {/* Botão atualizado para fazer Logout */}
        <button onClick={handleLogout} style={estilos.botaoSair}>
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </header>
  );
}

const estilos = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: 'var(--cor-branco)',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)', // Sombra super sofisticada e leve
    marginBottom: '25px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    height: '100px', // Aumentado para deixar a logo maior
    width: 'auto',
    objectFit: 'contain',
  },
  logoFallback: {
    color: 'var(--cor-verde-escuro)',
    margin: 0,
  },
  areaUsuario: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  saudacao: {
    fontWeight: '600',
    color: 'var(--cor-laranja-escuro)',
  },
  // Novo estilo do botão de Sair (mais discreto, vermelho suave)
  botaoSair: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fee2e2',
    padding: '8px 15px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};

export default Header;