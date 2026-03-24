// Arquivo: frontend/src/pages/EntradaLotes.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Truck, CheckCircle, Trash2 } from 'lucide-react';

function EntradaLotes() {
  const [produtos, setProdutos] = useState([]);
  const [lotesCadastrados, setLotesCadastrados] = useState([]); // Novo estado para listar os lotes
  const [nomeNovaFruta, setNomeNovaFruta] = useState('');
  
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [dataEntrada, setDataEntrada] = useState('');
  const [dataValidade, setDataValidade] = useState('');

  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  // Busca frutas e lotes ao abrir a página
  const carregarDados = async () => {
    try {
      const resProdutos = await axios.get('http://localhost:3000/produtos');
      setProdutos(resProdutos.data);

      const resLotes = await axios.get('http://localhost:3000/lotes');
      setLotesCadastrados(resLotes.data);
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
    }
  };

  useEffect(() => {
    // Evita setState direto no corpo do effect
    (async () => {
      await carregarDados();
    })();
  }, []);

  const handleCadastrarFruta = async (e) => {
    e.preventDefault();
    if (!nomeNovaFruta) return;

    try {
      await axios.post('http://localhost:3000/produtos', { nome: nomeNovaFruta });
      setMensagem({ texto: 'Fruta cadastrada com sucesso!', tipo: 'sucesso' });
      setNomeNovaFruta('');
      carregarDados(); // Recarrega as listas
    } catch {
      setMensagem({ texto: 'Erro ao cadastrar a fruta.', tipo: 'erro' });
    }
  };

  const handleRegistrarLote = async (e) => {
    e.preventDefault();
    if (!produtoId || !quantidade || !dataEntrada || !dataValidade) {
      setMensagem({ texto: 'Preencha todos os campos do lote!', tipo: 'erro' });
      return;
    }

    try {
      await axios.post('http://localhost:3000/lotes', {
        produto_id: produtoId,
        quantidade: quantidade,
        data_entrada: dataEntrada,
        data_validade: dataValidade
      });
      
      setMensagem({ texto: 'Carga registrada com sucesso no estoque!', tipo: 'sucesso' });
      
      setProdutoId('');
      setQuantidade('');
      setDataEntrada('');
      setDataValidade('');
      carregarDados(); // Recarrega a lista de lotes na tela
    } catch {
      setMensagem({ texto: 'Erro ao registrar o lote.', tipo: 'erro' });
    }
  };

  // ==========================================
  // NOVAS FUNÇÕES DE EXCLUSÃO
  // ==========================================
  const handleExcluirFruta = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta fruta?')) return;

    try {
      await axios.delete(`http://localhost:3000/produtos/${id}`);
      setMensagem({ texto: 'Fruta excluída com sucesso!', tipo: 'sucesso' });
      carregarDados();
    } catch (erro) {
      // Pega a mensagem de erro amigável que mandamos do back-end
      const msgErro = erro.response?.data?.erro || 'Erro ao excluir fruta.';
      setMensagem({ texto: msgErro, tipo: 'erro' });
    }
  };

  const handleExcluirLote = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este lote?')) return;

    try {
      await axios.delete(`http://localhost:3000/lotes/${id}`);
      setMensagem({ texto: 'Lote excluído com sucesso!', tipo: 'sucesso' });
      carregarDados();
    } catch (erro) {
      const msgErro = erro.response?.data?.erro || 'Erro ao excluir lote.';
      setMensagem({ texto: msgErro, tipo: 'erro' });
    }
  };

  // Formatação de data simples
  const formatarData = (dataString) => new Date(dataString).toLocaleDateString('pt-BR');

  return (
    <div style={estilos.container}>
      <div style={estilos.cabecalhoPagina}>
        <h1 style={{ color: 'var(--cor-verde-escuro)' }}>Entrada de Mercadorias</h1>
        <p>Cadastre novas frutas no catálogo e registre a chegada de lotes.</p>
      </div>

      {mensagem.texto && (
        <div style={{
          ...estilos.mensagemCaixa, 
          backgroundColor: mensagem.tipo === 'sucesso' ? '#e6f4ea' : '#fce8e6',
          color: mensagem.tipo === 'sucesso' ? 'var(--cor-verde-escuro)' : 'var(--cor-laranja-escuro)'
        }}>
          <CheckCircle size={20} />
          {mensagem.texto}
        </div>
      )}

      {/* ÁREA SUPERIOR: FORMULÁRIOS (Agora com alturas iguais!) */}
      <div style={estilos.gridFormularios}>
        
        <div style={estilos.cartaoForm}>
          <div style={estilos.tituloForm}>
            <PlusCircle color="var(--cor-laranja-escuro)" />
            <h3>1. Cadastrar Nova Fruta</h3>
          </div>
          <form onSubmit={handleCadastrarFruta} style={estilos.formulario}>
            <div style={estilos.grupoInput}>
              <label style={estilos.label}>Nome da Fruta</label>
              <input 
                type="text" 
                style={estilos.input} 
                placeholder="Ex: Laranja"
                value={nomeNovaFruta}
                onChange={(e) => setNomeNovaFruta(e.target.value)}
              />
            </div>
            {/* O marginTop: 'auto' empurra o botão para baixo */}
            <button type="submit" style={{...estilos.botaoPrimario, marginTop: 'auto'}}>Cadastrar Fruta</button>
          </form>
        </div>

        <div style={estilos.cartaoForm}>
          <div style={estilos.tituloForm}>
            <Truck color="var(--cor-verde-escuro)" />
            <h3>2. Registrar Chegada de Lote</h3>
          </div>
          <form onSubmit={handleRegistrarLote} style={estilos.formulario}>
            
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

            <div style={estilos.grupoInput}>
              <label style={estilos.label}>Quantidade (Caixas/Kg)</label>
              <input 
                type="number" step="0.01" style={estilos.input} placeholder="Ex: 100"
                value={quantidade} onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>

            <div style={estilos.grupoDatas}>
              <div style={estilos.grupoInput}>
                <label style={estilos.label}>Data de Entrada</label>
                <input type="date" style={estilos.input} value={dataEntrada} onChange={(e) => setDataEntrada(e.target.value)} />
              </div>
              <div style={estilos.grupoInput}>
                <label style={estilos.label}>Data de Validade</label>
                <input type="date" style={estilos.input} value={dataValidade} onChange={(e) => setDataValidade(e.target.value)} />
              </div>
            </div>

            <button type="submit" style={{...estilos.botaoSecundario, marginTop: 'auto'}}>Registrar Lote</button>
          </form>
        </div>

      </div>

      {/* ÁREA INFERIOR: GERENCIAMENTO E EXCLUSÃO */}
      <div style={estilos.gridListas}>
        
        {/* Lista de Frutas */}
        <div style={estilos.cartaoLista}>
          <h3 style={estilos.tituloLista}>Frutas Cadastradas</h3>
          <ul style={estilos.listaItens}>
            {produtos.map(produto => (
              <li key={produto.id} style={estilos.itemLista}>
                <span>{produto.nome}</span>
                <button onClick={() => handleExcluirFruta(produto.id)} style={estilos.botaoExcluir}>
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Lista de Lotes Ativos */}
        <div style={estilos.cartaoLista}>
          <h3 style={estilos.tituloLista}>Últimos Lotes Adicionados</h3>
          <ul style={estilos.listaItens}>
            {lotesCadastrados.map(lote => (
              <li key={lote.id} style={estilos.itemLista}>
                <span>
                  <strong>{lote.nome_fruta}</strong> - {lote.quantidade_atual} un/kg (Val: {formatarData(lote.data_validade)})
                </span>
                <button onClick={() => handleExcluirLote(lote.id)} style={estilos.botaoExcluir}>
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
            {lotesCadastrados.length === 0 && <p style={{color: '#64748b', fontSize: '0.9em'}}>Nenhum lote ativo.</p>}
          </ul>
        </div>

      </div>
    </div>
  );
}

// ESTILOS ATUALIZADOS
const estilos = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  cabecalhoPagina: { marginBottom: '10px' },
  mensagemCaixa: { padding: '15px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500', marginBottom: '10px' },
  
  // O align-items: stretch faz os dois cartões terem a mesma altura sempre
  gridFormularios: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'stretch' },
  
  cartaoForm: {
    backgroundColor: 'var(--cor-branco)', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
    display: 'flex', flexDirection: 'column', height: '100%' // Essencial para o design flexível
  },
  tituloForm: { display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--cor-texto)', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' },
  
  formulario: { display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }, // flex: 1 faz o form ocupar todo o espaço restante
  grupoInput: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  grupoDatas: { display: 'flex', gap: '15px' },
  label: { fontSize: '0.9em', fontWeight: '600', color: '#475569' },
  input: { padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1em', outline: 'none', color: 'var(--cor-texto)' },
  
  botaoPrimario: { backgroundColor: 'var(--cor-laranja-escuro)', color: 'var(--cor-branco)', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: '600', fontSize: '1em', cursor: 'pointer' },
  botaoSecundario: { backgroundColor: 'var(--cor-verde-escuro)', color: 'var(--cor-branco)', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: '600', fontSize: '1em', cursor: 'pointer' },

  // Estilos da nova seção de Listas
  gridListas: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '20px' },
  cartaoLista: { backgroundColor: 'var(--cor-branco)', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
  tituloLista: { color: 'var(--cor-verde-escuro)', marginBottom: '15px', fontSize: '1.1em', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' },
  listaItens: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
  itemLista: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.95em' },
  botaoExcluir: { backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px' }
};

export default EntradaLotes;