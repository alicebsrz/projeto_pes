// Arquivo: frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Package, AlertTriangle, TrendingUp } from 'lucide-react';
// 1. Importando os componentes de gráficos do Recharts

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// 1. ADICIONE ESTA LISTA DE CORES AQUI:
// Uma paleta suave e sofisticada de tons pastéis
const CORES_PASTEIS = [
  '#FF8A80', // Vermelho pastel mais vivo
  '#FFB74D', // Laranja pastel mais forte
  '#FFD180', // Amarelo queimado (laranja claro)
  '#A5D6A7', // Verde pastel mais forte
  '#81C784', // Verde médio
  '#8D6E63', // Marrom claro
  '#D7CCC8'  // Marrom pastel
];


function Dashboard() {
  const [lotes, setLotes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const buscarLotes = async () => {
      try {
        const resposta = await axios.get('http://localhost:3000/lotes');
        setLotes(resposta.data);
      } catch (err) {
        console.error('Erro ao buscar lotes:', err);
        setErro('Não foi possível carregar o estoque.');
      } finally {
        setCarregando(false);
      }
    };
    buscarLotes();
  }, []);

  // 2. FUNÇÕES DE CÁLCULO PARA OS GRÁFICOS E RESUMOS
  // Calcula a diferença de dias para o semáforo
  const calcularDiasValidade = (dataValidade) => {
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const diferencaTempo = validade.getTime() - hoje.getTime();
    return Math.ceil(diferencaTempo / (1000 * 3600 * 24));
  };

  const calcularCorSemaforo = (dias) => {
    if (dias <= 3) return 'var(--cor-laranja-escuro)'; // Crítico
    if (dias <= 7) return 'var(--cor-laranja)'; // Atenção
    return 'var(--cor-verde-claro)'; // Seguro
  };

  // Preparando os dados matemáticos usando os lotes recebidos
  const totalEstoque = lotes.reduce((acc, lote) => acc + parseFloat(lote.quantidade_atual), 0);
  
  let statusSeguro = 0;
  let statusAtencao = 0;
  let statusCritico = 0;

  // Monta os dados para o Gráfico de Barras (Agrupando por fruta)
  const dadosBarrasMap = {};

  lotes.forEach(lote => {
    // Conta os status para o gráfico de pizza
    const dias = calcularDiasValidade(lote.data_validade);
    if (dias <= 3) statusCritico++;
    else if (dias <= 7) statusAtencao++;
    else statusSeguro++;

    // Soma as quantidades por fruta
    if (!dadosBarrasMap[lote.nome_fruta]) {
      dadosBarrasMap[lote.nome_fruta] = 0;
    }
    dadosBarrasMap[lote.nome_fruta] += parseFloat(lote.quantidade_atual);
  });

  // Convertendo o objeto agrupado em um array para o Recharts ler
  const dadosGraficoBarras = Object.keys(dadosBarrasMap).map(chave => ({
    nome: chave,
    quantidade: dadosBarrasMap[chave]
  }));

  // Dados para o Gráfico de Pizza (Rosca)
  const dadosGraficoPizza = [
    { nome: 'Seguro', valor: statusSeguro, cor: 'var(--cor-verde-claro)' },
    { nome: 'Atenção', valor: statusAtencao, cor: 'var(--cor-laranja)' },
    { nome: 'Crítico', valor: statusCritico, cor: 'var(--cor-laranja-escuro)' },
  ].filter(item => item.valor > 0); // Só mostra fatias que tenham mais de 0

  // 3. RENDERIZAÇÃO DA TELA
  if (carregando) return <p>Carregando o estoque do Ceasa...</p>;
  if (erro) return <p style={{ color: 'red' }}>{erro}</p>;

  return (
    <div style={estilos.container}>
      <div style={estilos.cabecalhoPagina}>
        <h1 style={{ color: 'var(--cor-verde-escuro)' }}>Dashboard de Operações</h1>
        <p>Visão analítica do armazenamento e validades.</p>
      </div>

      {lotes.length === 0 ? (
        <div style={estilos.estadoVazio}>
          <Package size={48} color="var(--cor-verde-claro)" />
          <h3>Seu estoque está zerado!</h3>
          <p>Vá para "Entrada Lotes" para registrar uma nova carga.</p>
        </div>
      ) : (
        <>
          {/* CAMADA 1: Cartões de Resumo Rápidos */}
          <div style={estilos.gridResumo}>
            <div style={estilos.cartaoResumo}>
              <div style={estilos.iconeResumoVerde}><Package size={24} color="var(--cor-verde-escuro)" /></div>
              <div>
                <p style={estilos.labelResumo}>Volume Total em Estoque</p>
                <h2 style={estilos.valorResumo}>{totalEstoque} un/kg</h2>
              </div>
            </div>
            
            <div style={estilos.cartaoResumo}>
              <div style={estilos.iconeResumoLaranja}><AlertTriangle size={24} color="var(--cor-laranja-escuro)" /></div>
              <div>
                <p style={estilos.labelResumo}>Lotes Críticos (Vencendo)</p>
                <h2 style={estilos.valorResumo}>{statusCritico} Lote(s)</h2>
              </div>
            </div>

            <div style={estilos.cartaoResumo}>
              <div style={estilos.iconeResumoVerdeClaro}><TrendingUp size={24} color="var(--cor-verde-escuro)" /></div>
              <div>
                <p style={estilos.labelResumo}>Variedade de Frutas</p>
                <h2 style={estilos.valorResumo}>{dadosGraficoBarras.length} Tipo(s)</h2>
              </div>
            </div>
          </div>

          {/* CAMADA 2: Gráficos Visuais */}
          <div style={estilos.gridGraficos}>
            <div style={estilos.cartaoGrafico}>
              <h3 style={estilos.tituloGrafico}>Volume por Fruta</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dadosGraficoBarras}>
                  <XAxis dataKey="nome" stroke="#8884d8" />
                  <YAxis />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  {/* Removemos o 'fill' geral da Bar e criamos uma Cell (célula) para cada fruta */}
                  <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
                    {dadosGraficoBarras.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        // O truque matemático: index % CORES_PASTEIS.length garante 
                        // que se passarmos de 7 frutas, ele volta para a cor 0!
                        fill={CORES_PASTEIS[index % CORES_PASTEIS.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={estilos.cartaoGrafico}>
              <h3 style={estilos.tituloGrafico}>Saúde da Validade</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dadosGraficoPizza}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="valor"
                  >
                    {dadosGraficoPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CAMADA 3: O Semáforo de Lotes (O que já tínhamos) */}
          <h2 style={estilos.tituloSecao}>Lotes Ativos</h2>
          <div style={estilos.gradeLotes}>
            {lotes.map((lote) => {
              const dias = calcularDiasValidade(lote.data_validade);
              const cor = calcularCorSemaforo(dias);
              
              return (
                <div key={lote.id} style={{ ...estilos.cartaoLote, borderTop: `4px solid ${cor}` }}>
                  <div style={estilos.cartaoTopo}>
                    <h3 style={{color: 'var(--cor-texto)'}}>{lote.nome_fruta}</h3>
                    <span style={{ backgroundColor: cor, ...estilos.etiquetaCor }}></span>
                  </div>
                  <div style={estilos.cartaoInfo}>
                    <p><strong>Restante:</strong> {lote.quantidade_atual} un/kg</p>
                    <p style={estilos.dadoData}>
                      <Calendar size={16} /> 
                      Vence em {dias} dia(s)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// 4. ESTILIZAÇÃO SOFISTICADA
const estilos = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cabecalhoPagina: {
    marginBottom: '10px',
  },
  gridResumo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '10px',
  },
  cartaoResumo: {
    backgroundColor: 'var(--cor-branco)',
    padding: '20px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
  },
  iconeResumoVerde: { padding: '15px', backgroundColor: '#e6f4ea', borderRadius: '12px' },
  iconeResumoLaranja: { padding: '15px', backgroundColor: '#fce8e6', borderRadius: '12px' },
  iconeResumoVerdeClaro: { padding: '15px', backgroundColor: '#f4f9e9', borderRadius: '12px' },
  labelResumo: { fontSize: '0.9em', color: '#64748b', fontWeight: '500' },
  valorResumo: { color: 'var(--cor-verde-escuro)', fontSize: '1.8em', marginTop: '5px' },
  
  gridGraficos: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  cartaoGrafico: {
    backgroundColor: 'var(--cor-branco)',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
  },
  tituloGrafico: {
    color: 'var(--cor-verde-escuro)',
    marginBottom: '20px',
    fontSize: '1.1em',
  },
  tituloSecao: {
    color: 'var(--cor-verde-escuro)',
    marginTop: '10px',
    marginBottom: '10px',
  },
  gradeLotes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
  },
  cartaoLote: {
    backgroundColor: 'var(--cor-branco)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cartaoTopo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  etiquetaCor: { width: '12px', height: '12px', borderRadius: '50%' },
  cartaoInfo: { display: 'flex', flexDirection: 'column', gap: '8px', color: '#475569' },
  dadoData: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85em', color: '#64748b' },
  estadoVazio: { /* ... mantido igual ao anterior ... */ }
};

export default Dashboard;