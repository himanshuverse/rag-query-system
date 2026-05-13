import { readFile } from "node:fs/promises";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const extractText = async (filePath) => {
  try {
    const buffer = await readFile(filePath);
    const { text } = await pdfParse(buffer);
    return text;
  } catch (err) {
    throw new Error(`PDF parsing failed: ${err.message}`);
  }
};