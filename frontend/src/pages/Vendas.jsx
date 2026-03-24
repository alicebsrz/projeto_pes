// Arquivo: frontend/src/pages/Vendas.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, CheckCircle, AlertOctagon, TrendingDown } from 'lucide-react';

function Vendas() {
  // 1. ESTADOS DO FORMULÁRIO
  const [produtos, setProdutos] = useState([]);
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [tipo, setTipo] = useState('venda'); // Padrão começa como 'venda'
  
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  // 2. BUSCAR CATÁLOGO DE PRODUTOS
  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const resposta = await axios.get('http://localhost:3000/produtos');
        setProdutos(resposta.data);
      } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
      }
    };
    carregarProdutos();
  }, []);

  // 3. FUNÇÃO DE REGISTRO DE SAÍDA (Aciona a regra FIFO no Back-end)
  const handleRegistrarSaida = async (e) => {
    e.preventDefault();

    // Validação básica de tela
    if (!produtoId || !quantidade) {
      setMensagem({ texto: 'Por favor, selecione a fruta e informe a quantidade.', tipo: 'erro' });
      return;
    }

    if (quantidade <= 0) {
      setMensagem({ texto: 'A quantidade deve ser maior que zero.', tipo: 'erro' });
      return;
    }

    try {
      // Fazemos o POST para a rota de movimentações que criamos no Node.js
      await axios.post('http://localhost:3000/movimentacoes', {
        produto_id: produtoId,
        quantidade_saida: quantidade,
        tipo: tipo
      });

      // Se deu certo, mostra sucesso e limpa os campos
      setMensagem({ texto: `Saída de ${quantidade} registrada com sucesso (Regra FIFO aplicada)!`, tipo: 'sucesso' });
      setProdutoId('');
      setQuantidade('');
      setTipo('venda');

    } catch (erro) {
      // Capturamos a mensagem de erro inteligente do nosso back-end (ex: Estoque Insuficiente)
      const msgErro = erro.response?.data?.erro || 'Erro interno ao registrar saída.';
      setMensagem({ texto: msgErro, tipo: 'erro' });
    }
  };

  // 4. RENDERIZAÇÃO DA TELA
  return (
    <div style={estilos.container}>
      <div style={estilos.cabecalhoPagina}>
        <h1 style={{ color: 'var(--cor-verde-escuro)' }}>Saída de Mercadorias (Vendas/Quebras)</h1>
        <p>Registre as saídas. O sistema abaterá automaticamente dos lotes mais antigos (FIFO).</p>
      </div>

      {/* Exibição de Mensagens (Sucesso ou Erro do FIFO) */}
      {mensagem.texto && (
        <div style={{
          ...estilos.mensagemCaixa, 
          backgroundColor: mensagem.tipo === 'sucesso' ? '#e6f4ea' : '#fce8e6',
          color: mensagem.tipo === 'sucesso' ? 'var(--cor-verde-escuro)' : '#ef4444'
        }}>
          {mensagem.tipo === 'sucesso' ? <CheckCircle size={20} /> : <AlertOctagon size={20} />}
          {mensagem.texto}
        </div>
      )}

      {/* CARTÃO DO FORMULÁRIO DE SAÍDA */}
      <div style={estilos.cartaoForm}>
        <div style={estilos.tituloForm}>
          <ShoppingCart color="var(--cor-laranja-escuro)" size={28} />
          <h3>Registrar Nova Saída</h3>
        </div>

        <form onSubmit={handleRegistrarSaida} style={estilos.formulario}>
          
          <div style={estilos.linhaInputs}>
            {/* Campo: Fruta */}
            <div style={estilos.grupoInput}>
              <label style={estilos.label}>Selecione a Fruta</label>
              <select 
                style={estilos.input}
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
              >
                <option value="">-- Escolha no catálogo --</option>
                {produtos.map(produto => (
                  <option key={produto.id} value={produto.id}>{produto.nome}</option>
                ))}
              </select>
            </div>

            {/* Campo: Quantidade */}
            <div style={estilos.grupoInput}>
              <label style={estilos.label}>Quantidade (Caixas/Kg)</label>
              <input 
                type="number" step="0.01" style={estilos.input} placeholder="Ex: 50"
                value={quantidade} onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
          </div>

          {/* Campo: Tipo de Saída (Botões de Seleção) */}
          <div style={estilos.grupoInput}>
            <label style={estilos.label}>Tipo de Saída</label>
            <div style={estilos.grupoRadios}>
              
              <div 
                style={{...estilos.cartaoRadio, ...(tipo === 'venda' ? estilos.radioAtivoVenda : {})}}
                onClick={() => setTipo('venda')}
              >
                <TrendingUp size={20} />
                <strong>Venda (Lucro)</strong>
              </div>

              <div 
                style={{...estilos.cartaoRadio, ...(tipo === 'quebra' ? estilos.radioAtivoQuebra : {})}}
                onClick={() => setTipo('quebra')}
              >
                <TrendingDown size={20} />
                <strong>Quebra (Prejuízo)</strong>
              </div>

            </div>
          </div>

          <button type="submit" style={estilos.botaoPrimario}>Confirmar Saída do Estoque</button>
        </form>
      </div>

    </div>
  );
}

// Ícone improvisado para Venda (Lucro) já que importamos o TrendingDown
import { TrendingUp } from 'lucide-react';

// 5. ESTILIZAÇÃO DO COMPONENTE
const estilos = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' },
  cabecalhoPagina: { marginBottom: '10px' },
  mensagemCaixa: { padding: '15px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500', marginBottom: '10px' },
  
  cartaoForm: { backgroundColor: 'var(--cor-branco)', padding: '35px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' },
  tituloForm: { display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--cor-texto)', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' },
  
  formulario: { display: 'flex', flexDirection: 'column', gap: '25px' },
  linhaInputs: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  grupoInput: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontSize: '0.95em', fontWeight: '600', color: '#475569' },
  input: { padding: '14px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1em', outline: 'none', color: 'var(--cor-texto)' },
  
  // Estilo sofisticado para escolher Venda ou Quebra
  grupoRadios: { display: 'flex', gap: '15px' },
  cartaoRadio: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '15px', borderRadius: '8px', border: '2px solid #e2e8f0', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' },
  radioAtivoVenda: { borderColor: 'var(--cor-verde-claro)', backgroundColor: '#f4f9e9', color: 'var(--cor-verde-escuro)' },
  radioAtivoQuebra: { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' },

  botaoPrimario: { backgroundColor: 'var(--cor-laranja-escuro)', color: 'var(--cor-branco)', border: 'none', padding: '16px', borderRadius: '8px', fontWeight: '700', fontSize: '1.05em', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 6px rgba(255, 140, 0, 0.2)' },
};

export default Vendas;