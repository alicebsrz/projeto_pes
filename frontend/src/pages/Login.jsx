// Arquivo: frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Mail, User, CheckCircle, AlertOctagon } from 'lucide-react';
import logoImg from '../assets/logo.png'; // Reaproveitando a sua logo!

// Recebemos a função 'setToken' do App.jsx para avisar que o login deu certo
function Login({ setToken }) {
  // Estado para alternar entre a tela de "Login" e "Cadastro"
  const [modoLogin, setModoLogin] = useState(true); 
  
  // Estados dos campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  // Função disparada ao enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem({ texto: '', tipo: '' }); // Limpa mensagens anteriores

    try {
      if (modoLogin) {
        // --- FLUXO DE LOGIN ---
        const resposta = await axios.post('http://localhost:3000/auth/login', { email, senha });
        
        const tokenRecebido = resposta.data.token;
        const nomeUsuario = resposta.data.usuario.nome;

        // 1. Guarda o token e o nome no navegador (localStorage)
        localStorage.setItem('token', tokenRecebido);
        localStorage.setItem('nomeUsuario', nomeUsuario);

        // 2. Avisa o App.jsx que estamos logados!
        setToken(tokenRecebido); 

      } else {
        // --- FLUXO DE CADASTRO ---
        await axios.post('http://localhost:3000/auth/cadastro', { nome, email, senha });
        
        setMensagem({ texto: 'Cadastro realizado! Agora você pode fazer o login.', tipo: 'sucesso' });
        setModoLogin(true); // Muda para a aba de login automaticamente
        setSenha(''); // Limpa a senha por segurança
      }
    } catch (erro) {
      const msgErro = erro.response?.data?.erro || 'Erro ao conectar com o servidor.';
      setMensagem({ texto: msgErro, tipo: 'erro' });
    }
  };

  return (
    <div style={estilos.fundoTela}>
      <div style={estilos.cartaoLogin}>
        
        {/* Cabeçalho do Login com a Logo */}
        <div style={estilos.cabecalhoLogo}>
          <img 
            src={logoImg} 
            alt="Logo" 
            style={estilos.logo}
            onError={(e) => e.target.style.display = 'none'} 
          />
          <h2 style={{ color: 'var(--cor-verde-escuro)', marginTop: '10px' }}>
            {modoLogin ? 'Acesso ao Sistema' : 'Crie sua Conta'}
          </h2>
        </div>

        {/* Mensagens de Erro ou Sucesso */}
        {mensagem.texto && (
          <div style={{
            ...estilos.mensagemCaixa, 
            backgroundColor: mensagem.tipo === 'sucesso' ? '#e6f4ea' : '#fce8e6',
            color: mensagem.tipo === 'sucesso' ? 'var(--cor-verde-escuro)' : '#ef4444'
          }}>
            {mensagem.tipo === 'sucesso' ? <CheckCircle size={18} /> : <AlertOctagon size={18} />}
            {mensagem.texto}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={estilos.formulario}>
          
          {/* O campo Nome só aparece se NÃO estiver no modo de login */}
          {!modoLogin && (
            <div style={estilos.grupoInput}>
              <label style={estilos.label}>Nome Completo</label>
              <div style={estilos.caixaInput}>
                <User size={18} color="#94a3b8" />
                <input 
                  type="text" required style={estilos.input} placeholder="Ex: João da Silva"
                  value={nome} onChange={(e) => setNome(e.target.value)}
                />
              </div>
            </div>
          )}

          <div style={estilos.grupoInput}>
            <label style={estilos.label}>E-mail</label>
            <div style={estilos.caixaInput}>
              <Mail size={18} color="#94a3b8" />
              <input 
                type="email" required style={estilos.input} placeholder="seu@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={estilos.grupoInput}>
            <label style={estilos.label}>Senha</label>
            <div style={estilos.caixaInput}>
              <Lock size={18} color="#94a3b8" />
              <input 
                type="password" required style={estilos.input} placeholder="••••••••"
                value={senha} onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" style={estilos.botaoAcao}>
            {modoLogin ? 'Entrar no Dashboard' : 'Finalizar Cadastro'}
          </button>
        </form>

        {/* Alternador de Modo (Login / Cadastro) */}
        <div style={estilos.rodapeLogin}>
          <p style={{ color: '#64748b', fontSize: '0.9em' }}>
            {modoLogin ? 'Ainda não tem uma conta?' : 'Já possui uma conta?'}
          </p>
          <button 
            type="button" 
            onClick={() => { setModoLogin(!modoLogin); setMensagem({texto:'', tipo:''}); }}
            style={estilos.botaoAlternar}
          >
            {modoLogin ? 'Cadastre-se aqui' : 'Faça login aqui'}
          </button>
        </div>

      </div>
    </div>
  );
}

// Estilos sofisticados e centralizados
const estilos = {
  fundoTela: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--cor-fundo-tela)' },
  cartaoLogin: { backgroundColor: 'var(--cor-branco)', width: '100%', maxWidth: '400px', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' },
  cabecalhoLogo: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' },
  logo: { height: '50px', objectFit: 'contain' },
  mensagemCaixa: { padding: '12px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '0.9em' },
  formulario: { display: 'flex', flexDirection: 'column', gap: '15px' },
  grupoInput: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.85em', fontWeight: '600', color: '#475569' },
  caixaInput: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' },
  input: { border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', fontSize: '1em', color: 'var(--cor-texto)' },
  botaoAcao: { backgroundColor: 'var(--cor-laranja-escuro)', color: 'var(--cor-branco)', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: '700', fontSize: '1em', cursor: 'pointer', marginTop: '10px', transition: 'opacity 0.2s' },
  rodapeLogin: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '15px', gap: '5px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' },
  botaoAlternar: { background: 'none', border: 'none', color: 'var(--cor-verde-escuro)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }
};

export default Login;