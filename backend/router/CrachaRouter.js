import express from 'express';
import Auth from '../middleware/AuthMiddleware.js';
import CrachaController from '../controllers/CrachaController.js';
const router = express.Router();


router.post('/', Auth, CrachaController.create);
router.get('/', Auth, CrachaController.read);
router.get('/status/:status', Auth, CrachaController.readByStatus);
router.get('/:id', Auth, CrachaController.readById);
router.put('/:id', Auth, CrachaController.update);
router.delete('/:id', Auth, CrachaController.delete);



export default router;