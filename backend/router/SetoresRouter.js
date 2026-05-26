import express from 'express';
import Auth from '../middleware/AuthMiddleware.js';
import SetoresController from '../controllers/SetoresController.js';
const router = express.Router();


router.get('/', Auth, SetoresController.read);
router.get('/:id', Auth, SetoresController.readById);
router.post('/', Auth, SetoresController.create);
router.put('/:id', Auth, SetoresController.update);
router.delete('/:id', Auth, SetoresController.delete);


export default router;
