import express from "express";
import Auth from "../middleware/AuthMiddleware.js";
import RelatoriosController from "../controllers/RelatoriosController.js";

const router = express.Router();

router.get("/acessos", Auth, RelatoriosController.acessos);

export default router;
