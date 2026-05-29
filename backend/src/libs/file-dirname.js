/** Utilidad ESM para __dirname. */
import { fileURLToPath } from "url";
import path from "path";

export default function fileDirName(importMeta) {
  const __filename = fileURLToPath(importMeta.url);
  return { __dirname: path.dirname(__filename), __filename };
}
