import express from 'express';
const router = express.Router();

import FuncController from '../controllers/FuncController.js';

router.get('/', FuncController.Read);
router.get('/:id', FuncController.ReadId);
router.get('/name/:id', FuncController.ReadName);
router.get('/cpf/:id', FuncController.ReadCpf);
router.post('/', FuncController.Create);
router.put('/:id', FuncController.Update);
router.delete('/:id', FuncController.Delete);


export default router;
