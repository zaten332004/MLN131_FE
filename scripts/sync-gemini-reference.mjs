import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "guidelines", "gemini-priority-chuong-5.md");
const targetDir = path.join(root, "api", "guidelines");
const target = path.join(targetDir, "gemini-priority-chuong-5.md");

const content = await readFile(source, "utf8");
await mkdir(targetDir, { recursive: true });
await writeFile(target, content, "utf8");

console.log(`Synced Gemini reference: ${path.relative(root, source)} -> ${path.relative(root, target)}`);
