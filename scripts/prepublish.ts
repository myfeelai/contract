import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const packageRoot = join(__dirname, "..");
const packageJsonPath = join(packageRoot, "package.json");

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

packageJson.main = "dist/index.js";
packageJson.types = "dist/index.d.ts";

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

console.log("Updated package.json for publishing");
console.log("Running build...");

execSync("bun run build", { cwd: packageRoot, stdio: "inherit" });
