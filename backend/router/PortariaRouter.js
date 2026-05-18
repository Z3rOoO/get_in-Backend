import express from 'express';
import Auth from '../middleware/AuthMiddleware.js';
import PortariaController from '../controllers/PortariaController.js';

const router = express.Router();

router.get('/vlocal',  Auth, PortariaController.readVisitanteLocal);
router.get('/pendencias',  Auth, PortariaController.readPendencias);



export default router;
