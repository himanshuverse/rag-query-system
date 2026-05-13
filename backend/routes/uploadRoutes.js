import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { uploadFile } from "../controllers/uploadController.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const maxBytes = parseInt(process.env.MAX_UPLOAD_BYTES, 10) || 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve(__dirname, "../uploads")),
  filename:    (req, file, cb) => cb(null, `${randomUUID()}.pdf`),
});

const fileFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === "application/pdf" ||
    file.originalname.toLowerCase().endsWith(".pdf");
  cb(isPdf ? null : new Error("Only PDF files are allowed"), isPdf);
};

const upload = multer({ storage, limits: { fileSize: maxBytes }, fileFilter });

router.post("/", upload.single("file"), uploadFile);

export default router;