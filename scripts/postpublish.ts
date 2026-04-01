import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const packageRoot = join(__dirname, "..");
const packageJsonPath = join(packageRoot, "package.json");

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

packageJson.main = "src/index.ts";
packageJson.types = "src/index.ts";

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

console.log("Reset package.json for development");
