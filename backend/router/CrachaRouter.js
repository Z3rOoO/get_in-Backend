import express from 'express';
import CrachaController from '../controllers/CrachaController.js';
const router = express.Router();

router.post('/', CrachaController.create);
router.get('/', CrachaController.read);
router.get('/:id', CrachaController.readById);
router.get('/status/:status', CrachaController.readByStatus);
router.put('/:id', CrachaController.update);
router.delete('/:id', CrachaController.delete);



export default router;