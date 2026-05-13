import express from "express";
import { getSessionHistory, handleQuery } from "../controllers/queryController.js";

const router = express.Router();

router.post("/", handleQuery);
router.get("/history/:sessionId", getSessionHistory);

export default router;