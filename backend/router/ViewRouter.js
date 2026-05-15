import express from "express";
import ViewController from "../controllers/ViewController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.get("/requisicoes", AuthMiddleware, ViewController.getRequisicoesConsolidadas);
router.get("/logs", AuthMiddleware, ViewController.getLogsDetalhados);
router.get("/usuarios", AuthMiddleware, ViewController.getUsuariosDetalhados);
router.get("/tags", AuthMiddleware, ViewController.getTagsDetalhadas);
router.get("/gestores", AuthMiddleware, ViewController.getGestores);

export default router;
