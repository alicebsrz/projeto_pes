//  backend/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt'); // Biblioteca para criptografar senhas
const jwt = require('jsonwebtoken'); // Biblioteca para gerar o "Crachá" (Token)

// Uma chave secreta para assinar nossos crachás (em projetos reais, isso fica escondido em variáveis de ambiente)
const CHAVE_SECRETA = 'minha_chave_super_secreta_ceasa_123'; 

// ==========================================
// ROTA 1: CADASTRO DE NOVO USUÁRIO
// Método: POST
// Caminho: /auth/cadastro
// ==========================================
router.post('/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Preencha nome, email e senha.' });
    }

    try {
        const dbPromise = db.promise();

        // 1. Verifica se o email já existe no banco
        const [usuariosExistentes] = await dbPromise.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (usuariosExistentes.length > 0) {
            return res.status(400).json({ erro: 'Este email já está cadastrado.' });
        }

        // 2. Criptografar a senha (o número 10 é o "custo" da criptografia, padrão da indústria)
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        // 3. Salvar no banco com a senha embaralhada
        await dbPromise.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, senhaCriptografada]
        );

        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });

    } catch (erro) {
        console.error('Erro no cadastro:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

// ==========================================
// ROTA 2: LOGIN DO USUÁRIO
// Método: POST
// Caminho: /auth/login
// ==========================================
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Preencha email e senha.' });
    }

    try {
        const dbPromise = db.promise();

        // 1. Busca o usuário pelo email
        const [usuarios] = await dbPromise.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        const usuario = usuarios[0]; // Pega o primeiro usuário da lista

        if (!usuario) {
            return res.status(401).json({ erro: 'Email ou senha incorretos.' });
        }

        // 2. Compara a senha digitada com a senha criptografada do banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ erro: 'Email ou senha incorretos.' });
        }

        // 3. Gerar o "Crachá" (Token JWT)
        // Guardamos o ID e o Nome dentro do crachá, e ele expira em 2 horas
        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome }, 
            CHAVE_SECRETA, 
            { expiresIn: '30d' } // MUDAMOS AQUI PARA 30 DIAS!
        );

        // Devolvemos o token e os dados do usuário para o Front-end
        res.status(200).json({ 
            mensagem: 'Login realizado com sucesso!',
            token: token,
            usuario: { nome: usuario.nome, email: usuario.email }
        });

    } catch (erro) {
        console.error('Erro no login:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

module.exports = router;