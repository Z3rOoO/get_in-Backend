import express from "express";
import PublicController from "../controllers/PublicController.js";

const router = express.Router();

router.get("/stats", PublicController.stats);

export default router;
