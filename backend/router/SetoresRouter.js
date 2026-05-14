import express from 'express';
import Auth from '../middleware/AuthMiddleware.js';
import SetoresController from '../controllers/SetoresController.js';
const router = express.Router();


router.get('/', Auth, SetoresController.read);
router.post('/', Auth, SetoresController.create);




export default router;