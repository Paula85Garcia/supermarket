import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const src = join(root, "src", "generated");
const dest = join(root, "dist", "generated");
if (existsSync(src)) {
  cpSync(src, dest, { recursive: true });
}
