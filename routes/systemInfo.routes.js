// routes/systemInfo.routes.js
import express from "express";
import { fetchSystemInfo } from "../controllers/systemInfo.controller.js";

const router = express.Router();

router.get("/system-info", fetchSystemInfo);

export default router;
