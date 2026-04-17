import express from 'express';
const router = express.Router();

import AuthController from '../controllers/AuthController.js';

router.post('/', AuthController.register);
router.put('/login', AuthController.login);
router.put('/logout', AuthController.logout);


export default router;