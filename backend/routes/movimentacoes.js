// Arquivo: backend/routes/movimentacoes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middleware/authMiddleware');

router.post('/', verificarToken, async (req, res) => {
    const { produto_id, quantidade_saida, tipo } = req.body;
    const idUsuarioLogado = req.usuario.id; // Pegamos o ID do usuário

    if (!produto_id || !quantidade_saida || !tipo) {
        return res.status(400).json({ erro: 'Preencha produto_id, quantidade_saida e tipo (venda ou quebra).' });
    }

    try {
        const dbPromise = db.promise();

        // BUSCA FIFO ATUALIZADA: Pega os lotes com estoque, do mais antigo para o mais novo, 
        // MAS AGORA apenas os lotes que pertencem a este usuario_id
        const [lotes] = await dbPromise.query(`
            SELECT id, quantidade_atual 
            FROM lotes 
            WHERE produto_id = ? AND quantidade_atual > 0 AND usuario_id = ?
            ORDER BY data_entrada ASC
        `, [produto_id, idUsuarioLogado]);

        let totalDisponivel = 0;
        for (let lote of lotes) {
            totalDisponivel += parseFloat(lote.quantidade_atual);
        }

        if (quantidade_saida > totalDisponivel) {
            return res.status(400).json({ 
                erro: `Estoque insuficiente! Você pediu ${quantidade_saida}, mas só temos ${totalDisponivel} disponíveis.` 
            });
        }

        // MOTOR FIFO (Abatendo dos lotes)
        let quantidadeRestanteParaAbater = parseFloat(quantidade_saida);

        for (let lote of lotes) {
            if (quantidadeRestanteParaAbater <= 0) break;

            let quantidadeDesteLote = parseFloat(lote.quantidade_atual);
            let quantidadeRetiradaAgora = 0;

            if (quantidadeDesteLote >= quantidadeRestanteParaAbater) {
                quantidadeRetiradaAgora = quantidadeRestanteParaAbater;
                quantidadeRestanteParaAbater = 0;
            } else {
                quantidadeRetiradaAgora = quantidadeDesteLote;
                quantidadeRestanteParaAbater -= quantidadeDesteLote;
            }

            // ATUALIZA O LOTE
            await dbPromise.query(`
                UPDATE lotes SET quantidade_atual = quantidade_atual - ? WHERE id = ?
            `, [quantidadeRetiradaAgora, lote.id]);

            // REGISTRA O RECIBO DA MOVIMENTAÇÃO
            await dbPromise.query(`
                INSERT INTO movimentacoes (lote_id, tipo, quantidade, data_movimentacao) 
                VALUES (?, ?, ?, NOW())
            `, [lote.id, tipo, quantidadeRetiradaAgora]);
        }

        res.status(201).json({ mensagem: 'Saída registrada com sucesso usando a regra FIFO!' });

    } catch (erro) {
        console.error('Erro na regra FIFO:', erro);
        res.status(500).json({ erro: 'Erro interno ao processar a saída.' });
    }
});

module.exports = router;