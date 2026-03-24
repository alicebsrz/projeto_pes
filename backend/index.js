const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importando a conexão com o banco de dados 
const db = require('./db'); 

// Inicializando o servidor Express
const app = express();

// Configurando o servidor para entender JSON e permitir acessos (CORS)
app.use(cors());
app.use(express.json()); // Permite que o servidor receba dados no formato JSON


// Rotas de Produtos
const rotasProdutos = require('./routes/produtos');
app.use('/produtos', rotasProdutos);


// --- Importando as rotas de Lotes ---
const rotasLotes = require('./routes/lotes');
app.use('/lotes', rotasLotes);


// --- NOVIDADE AQUI: Importando as rotas de Movimentações ---
const rotasMovimentacoes = require('./routes/movimentacoes');
app.use('/movimentacoes', rotasMovimentacoes);

// --- NOVIDADE AQUI: Importando as rotas de Autenticação ---
const rotasAuth = require('./routes/auth');
app.use('/auth', rotasAuth);
// ----------------------------------------------------------




//  Rota de Teste (Apenas para garantir que o servidor está vivo)
app.get('/', (req, res) => {
    res.send('Servidor do Ceasa está rodando perfeitamente!');
});

// Ligando o servidor na porta especificada no .env (ou 3000 por padrão)
const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`);
});