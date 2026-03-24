// Importa a biblioteca mysql2 para conectar ao banco
const mysql = require('mysql2');
// Importa o dotenv para ler as senhas do arquivo .env
require('dotenv').config();

// Cria a conexão com o banco usando as informações do .env
const conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Testa a conexão para vermos se deu tudo certo
conexao.connect((erro) => {
    if (erro) {
        console.error('❌ Erro ao conectar no MySQL:', erro.message);
    } else {
        console.log('✅ Conectado com sucesso ao banco de dados CEASA!');
    }
});

// Exporta a conexão para podermos usar em outros arquivos
module.exports = conexao;