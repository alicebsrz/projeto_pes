// Arquivo: frontend/src/components/Sidebar.jsx
import React from 'react';
// 1. Importando os ícones profissionais da biblioteca
import { LayoutDashboard, PackagePlus, ShoppingCart } from 'lucide-react';

// Recebemos as "props" que o App.jsx enviou
function Sidebar({ paginaAtual, setPaginaAtual }) {
  // Função auxiliar para mudar a cor do botão ativo
  const aplicarEstiloItem = (nomePagina) => {
    return paginaAtual === nomePagina ? estilos.itemAtivo : estilos.item;
  };

  return (
    <aside style={estilos.sidebar}>
      <nav style={estilos.menu}>
        <div 
          style={aplicarEstiloItem('dashboard')} 
          onClick={() => setPaginaAtual('dashboard')} // Muda a tela ao clicar!
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>
        
        <div 
          style={aplicarEstiloItem('entrada')} 
          onClick={() => setPaginaAtual('entrada')} // Muda a tela ao clicar!
        >
          <PackagePlus size={20} />
          <span>Entrada Lotes</span>
        </div>
        
        <div 
          style={aplicarEstiloItem('vendas')} 
          onClick={() => setPaginaAtual('vendas')}
        >
          <ShoppingCart size={20} />
          <span>Vendas</span>
        </div>
      </nav>
    </aside>
  );
}

const estilos = {
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--cor-verde-escuro)', 
    color: '#E2E8F0', // Um cinza bem clarinho, quase branco, que cansa menos a vista que o branco puro
    height: '100vh', 
    padding: '20px 15px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 15px rgba(0,0,0,0.05)', // Sombra suave para separar do fundo
  },
  menu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '30px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    cursor: 'pointer',
    borderRadius: '8px',
    fontWeight: '500',
    transition: 'background-color 0.2s', // Efeito suave ao passar o mouse (precisaria de CSS externo para o hover perfeito, mas a base está aqui)
  },
  itemAtivo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    cursor: 'pointer',
    borderRadius: '8px',
    fontWeight: '600',
    backgroundColor: 'var(--cor-branco)', // Fundo branco dá um contraste lindo com o texto verde
    color: 'var(--cor-verde-escuro)',
  }
};

export default Sidebar;