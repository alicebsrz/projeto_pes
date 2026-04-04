const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const CHAVE_SECRETA = 'minha_chave_super_secreta_ceasa_123';
const CODIGO_EMPRESA_SECRETO = 'P0m@rT3ch_S3cur3!99';

// Cadastro de novo usuário
router.post('/cadastro', async (req, res) => {
    const { nome, email, senha, codigo_empresa } = req.body;
    if (codigo_empresa !== CODIGO_EMPRESA_SECRETO) {
        return res.status(403).json({ erro: 'Código da empresa inválido. Acesso negado.' });
    }
    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Preencha nome, email e senha.' });
    }
    try {
        const dbPromise = db.promise();
        const [usuariosExistentes] = await dbPromise.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (usuariosExistentes.length > 0) {
            return res.status(400).json({ erro: 'Este email já está cadastrado.' });
        }
        const senhaCriptografada = await bcrypt.hash(senha, 10);
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

// Login do usuário
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ erro: 'Preencha email e senha.' });
    }
    try {
        const dbPromise = db.promise();
        const [usuarios] = await dbPromise.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        const usuario = usuarios[0];
        if (!usuario) {
            return res.status(401).json({ erro: 'Email ou senha incorretos.' });
        }
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ erro: 'Email ou senha incorretos.' });
        }
        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome },
            CHAVE_SECRETA,
            { expiresIn: '30d' }
        );
        res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            token,
            usuario: { nome: usuario.nome, email: usuario.email }
        });
    } catch (erro) {
        console.error('Erro no login:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

module.exports = router;