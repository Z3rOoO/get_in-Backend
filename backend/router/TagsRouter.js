import express from "express";
import Auth from "../middleware/AuthMiddleware.js";
import TagsController from "../controllers/TagsController.js";

const router = express.Router();

router.get("/", Auth, TagsController.Read);
router.get("/latest", Auth, TagsController.ReadLatest);
router.get("/code/:codigoTag", Auth, TagsController.ReadByCode);
router.put("/code/:codigoTag/assign", Auth, TagsController.AssignByCode);
router.get("/:id", Auth, TagsController.ReadById);
router.post("/", Auth, TagsController.Create);
router.put("/:id", Auth, TagsController.Update);
router.delete("/:id", Auth, TagsController.Delete);

export default router;
