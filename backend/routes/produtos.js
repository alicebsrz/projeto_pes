// Arquivo: backend/routes/produtos.js
const express = require('express');
const router = express.Router();
const db = require('../db'); 

// 1. Importamos o nosso Porteiro (Middleware)
const verificarToken = require('../middleware/authMiddleware');

// ==========================================
// ROTA 1: LISTAR PRODUTOS DO USUÁRIO LOGADO
// ==========================================
// O 'verificarToken' fica no meio. Ele roda antes da função principal!
router.get('/', verificarToken, (req, res) => {
    // O porteiro descobriu quem é o usuário e colocou o ID aqui:
    const idUsuarioLogado = req.usuario.id;

    // Filtramos o SQL usando WHERE usuario_id
    const querySql = 'SELECT * FROM produtos WHERE usuario_id = ?';
    
    db.query(querySql, [idUsuarioLogado], (erro, resultados) => {
        if (erro) return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
        res.status(200).json(resultados);
    });
});

// ==========================================
// ROTA 2: CADASTRAR PRODUTO PARA O USUÁRIO LOGADO
// ==========================================
router.post('/', verificarToken, (req, res) => {
    const { nome } = req.body;
    const idUsuarioLogado = req.usuario.id; // Pegamos o ID novamente!

    if (!nome) return res.status(400).json({ erro: 'O nome do produto é obrigatório!' });

    // Inserimos o produto avisando que ele pertence a este usuario_id
    const querySql = 'INSERT INTO produtos (nome, usuario_id) VALUES (?, ?)';
    
    db.query(querySql, [nome, idUsuarioLogado], (erro, resultados) => {
        if (erro) return res.status(500).json({ erro: 'Erro interno ao salvar produto.' });
        res.status(201).json({ mensagem: 'Produto cadastrado!', id: resultados.insertId });
    });
});

// ==========================================
// ROTA 3: EXCLUIR UM PRODUTO
// ==========================================
router.delete('/:id', verificarToken, (req, res) => {
    const idProduto = req.params.id;
    const idUsuarioLogado = req.usuario.id;

    // A regra de segurança extra: Só pode apagar se o produto for dele!
    const querySql = 'DELETE FROM produtos WHERE id = ? AND usuario_id = ?';

    db.query(querySql, [idProduto, idUsuarioLogado], (erro, resultados) => {
        if (erro) return res.status(400).json({ erro: 'Não é possível excluir esta fruta, ou ela não pertence a você.' });
        res.status(200).json({ mensagem: 'Fruta excluída com sucesso!' });
    });
});

module.exports = router;