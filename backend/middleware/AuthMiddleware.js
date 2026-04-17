const jwt = require('jsonwebtoken')//biblioteca para trabalhar com JSON Web Tokens
require('dotenv').config()//carrega as variáveis de ambiente do arquivo .env

const AuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization//pega o token do header Authorization

    if (!authHeader) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Token não fornecido"
        })
    }

    if (!authHeader.startsWith('Bearer ')) {//verifica se o token tem o formato correto (Bearer TOKEN)
        return res.status(401).json({
            sucesso: false,
            mensagem: "Formato inválido (use Bearer TOKEN)"
        })
    }

    const token = authHeader.split(' ')[1]//pega o token em si (a parte depois de "Bearer ")

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)//verifica se o token é válido usando a chave secreta definida no .env

        req.user = decoded//adiciona os dados decodificados do token ao objeto req para que possam ser usados nas rotas protegidas

        return next()//chama o próximo middleware ou rota
    } catch (e) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Token inválido ou expirado"
        })
    }
}

module.exports = AuthMiddleware