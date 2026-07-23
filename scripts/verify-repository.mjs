import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const failures = [];
const fail = (message) => failures.push(message);

const rootPackage = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
if (!rootPackage.packageManager) fail("Root package.json is missing packageManager.");
if (!rootPackage.engines?.node) fail("Root package.json is missing engines.node.");

const source = readFileSync(
  new URL("../packages/project-data/src/index.ts", import.meta.url),
  "utf8",
);
const codes = [...source.matchAll(/\["(A\d+)",/g)].map((match) => match[1]);
const uniqueCodes = new Set(codes);
if (codes.length !== 31) fail(`Expected exactly 31 official apartments, found ${codes.length}.`);
if (uniqueCodes.size !== codes.length) fail("Official apartment codes contain duplicates.");
for (let index = 1; index <= 31; index += 1) {
  if (!uniqueCodes.has(`A${index}`)) fail(`Missing official apartment code A${index}.`);
}

const trackedEnvFiles = execFileSync("git", ["ls-files", ".env", ".env.*", ":!:*.env.example"], {
  cwd: new URL("..", import.meta.url),
  encoding: "utf8",
})
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
if (trackedEnvFiles.length > 0) {
  fail(`Forbidden committed env files: ${trackedEnvFiles.join(", ")}.`);
}

if (!existsSync(new URL("../package-lock.json", import.meta.url))) {
  fail("package-lock.json is required for reproducible npm ci installs.");
}

if (failures.length > 0) {
  console.error(failures.map((message) => `- ${message}`).join("\n"));
  process.exit(1);
}

console.log("Repository verification passed.");
