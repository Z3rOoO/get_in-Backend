import express from "express";
import UserController from '../controllers/UserController.js';
const router = express.Router();

// Rota para criar um novo usuário (ADM, GERENTE, FUNCIONÁRIO)
router.get('/', UserController.Read);
router.get('/:id', UserController.ReadId);
router.get('/name/:id', UserController.ReadName);
router.get('/cpf/:id', UserController.ReadCpf);
router.post('/', UserController.Create);
router.put('/:id', UserController.Update);
router.delete('/:id', UserController.Delete);
export default router;