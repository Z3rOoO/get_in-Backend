import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const AuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Token não fornecido"
        })
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Formato inválido (use Bearer TOKEN)"
        })
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, env.jwtSecret);

        req.user = decoded;

        return next();
    } catch (e) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Token inválido ou expirado"
        })
    }
}

export default AuthMiddleware;
