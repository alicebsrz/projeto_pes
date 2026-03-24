// Arquivo: backend/routes/lotes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
// 1. Importamos o nosso porteiro (Middleware de Autenticação)
const verificarToken = require('../middleware/authMiddleware');

// ==========================================
// ROTA 1: LISTAR LOTES DO USUÁRIO LOGADO
// ==========================================
router.get('/', verificarToken, (req, res) => {
    const idUsuarioLogado = req.usuario.id; // Descobrimos quem está logado

    // O SQL agora faz um JOIN para pegar o nome da fruta, mas FILTRA pelo usuario_id
    const querySql = `
        SELECT l.*, p.nome AS nome_fruta 
        FROM lotes l
        JOIN produtos p ON l.produto_id = p.id
        WHERE l.usuario_id = ?
        ORDER BY l.data_validade ASC
    `;

    db.query(querySql, [idUsuarioLogado], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar lotes:', erro);
            return res.status(500).json({ erro: 'Erro interno no servidor.' });
        }
        res.status(200).json(resultados);
    });
});

// ==========================================
// ROTA 2: REGISTRAR UM NOVO LOTE
// ==========================================

// ==========================================
// ROTA 2: REGISTRAR UM NOVO LOTE
// ==========================================
router.post('/', verificarToken, (req, res) => {
    const { produto_id, quantidade, data_entrada, data_validade } = req.body;
    const idUsuarioLogado = req.usuario.id; // Pega o ID do dono do lote

    if (!produto_id || !quantidade || !data_entrada || !data_validade) {
        return res.status(400).json({ erro: 'Preencha todos os campos do lote.' });
    }

    // CORREÇÃO: Colocamos a 'quantidade_inicial' de volta!
    // A variável 'quantidade' que vem da tela vai preencher tanto a inicial quanto a atual
    const querySql = `
        INSERT INTO lotes (produto_id, quantidade_inicial, quantidade_atual, data_entrada, data_validade, usuario_id) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Passamos a 'quantidade' duas vezes na lista de valores para bater com as interrogações
    db.query(querySql, [produto_id, quantidade, quantidade, data_entrada, data_validade, idUsuarioLogado], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao inserir lote:', erro);
            return res.status(500).json({ erro: 'Erro interno ao salvar lote.' });
        }
        res.status(201).json({ mensagem: 'Lote registrado com sucesso!', id_lote: resultados.insertId });
    });
});

// ==========================================
// ROTA 3: EXCLUIR UM LOTE
// ==========================================
router.delete('/:id', verificarToken, (req, res) => {
    const idLote = req.params.id;
    const idUsuarioLogado = req.usuario.id;

    // Regra de segurança: O lote só é apagado se o usuario_id bater com quem está logado
    const querySql = 'DELETE FROM lotes WHERE id = ? AND usuario_id = ?';

    db.query(querySql, [idLote, idUsuarioLogado], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao excluir lote:', erro);
            return res.status(400).json({ erro: 'Não é possível excluir este lote, pois ele tem movimentações.' });
        }
        // Se a query rodou mas não afetou nenhuma linha, significa que o lote não é deste usuário
        if (resultados.affectedRows === 0) {
            return res.status(403).json({ erro: 'Lote não encontrado ou não pertence a você.' });
        }
        res.status(200).json({ mensagem: 'Lote excluído com sucesso!' });
    });
});

module.exports = router;