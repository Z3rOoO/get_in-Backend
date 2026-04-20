import express from "express";
import Auth from "../middleware/AuthMiddleware.js";
import UserController from '../controllers/UserController.js';
const router = express.Router();

// Rota para criar um novo usuário (ADM, GERENTE, FUNCIONÁRIO)
router.get('/', Auth, UserController.Read);
router.get('/:id', Auth, UserController.ReadId);
router.get('/name/:nome', Auth, UserController.ReadName);
router.get('/cpf/:cpf', Auth, UserController.ReadCpf);
router.post('/', Auth, UserController.Create);
router.put('/:id', Auth, UserController.Update);
router.delete('/:id', Auth, UserController.Delete);
export default router;