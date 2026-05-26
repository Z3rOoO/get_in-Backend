import express from "express";
import Auth from "../middleware/AuthMiddleware.js";
import PermissoesController from "../controllers/PermissoesController.js";

const router = express.Router();

router.get("/", Auth, PermissoesController.read);
router.post("/", Auth, PermissoesController.save);

export default router;
