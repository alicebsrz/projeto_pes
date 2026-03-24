// Arquivo: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// A mesma chave secreta que usamos no auth.js
const CHAVE_SECRETA = 'minha_chave_super_secreta_ceasa_123'; 

function verificarToken(req, res, next) {
    // 1. Pega o cabeçalho de autorização que o Front-end enviou
    const authHeader = req.headers['authorization'];
    
    // O formato vem como "Bearer TOKEN_AQUI", então dividimos para pegar só o token
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Você não está logado.' });
    }

    try {
        // 2. Abre o token e descobre quem é o usuário
        const decodificado = jwt.verify(token, CHAVE_SECRETA);
        
        // 3. Salva os dados do usuário (id e nome) na requisição para as rotas usarem!
        req.usuario = decodificado; 
        
        // 4. Manda o Node.js continuar o trabalho (ir para a rota de produtos/lotes)
        next(); 
    } catch (erro) {
        res.status(403).json({ erro: 'Sessão expirada ou token inválido.' });
    }
}

module.exports = verificarToken;