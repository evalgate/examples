import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

assert.equal(Number(process.versions.node.split(".")[0]), 24, "Use Node 24");
assert.ok(process.env.npm_execpath, "Run npm run verify so the installed npm entry point is known");
const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const evidence = path.join(root, "artifacts");
fs.mkdirSync(evidence, { recursive: true });
const project = fs.mkdtempSync(path.join(os.tmpdir(), "evalgate public example "));
fs.cpSync(path.join(root, "local-gate"), project, { recursive: true, filter: (p) => !p.split(path.sep).includes("node_modules") });
const records = [];
let env = { ...process.env, EVALGATE_API_KEY: "", EVALGATE_OFFLINE: "1", EVALGATE_CONFIG_HOME: path.join(project, "isolated-config"), NODE_OPTIONS: "" };
function run(label, command, args, expected = 0) {
  const result = spawnSync(command, args, { cwd: project, env, encoding: "utf8", timeout: 120000, maxBuffer: 10 * 1024 * 1024, windowsHide: true });
  fs.writeFileSync(path.join(evidence, `${label}.stdout.txt`), result.stdout ?? "");
  fs.writeFileSync(path.join(evidence, `${label}.stderr.txt`), result.stderr ?? "");
  records.push({ label, exitCode: result.status });
  assert.equal(result.status, expected, `${label}: ${result.stderr}\n${result.stdout}`);
  return result.stdout;
}
try {
  run("install", process.execPath, [process.env.npm_execpath, "ci", "--ignore-scripts", "--no-audit", "--no-fund"]);
  const sdkRoot = path.join(project, "node_modules/@evalgate/sdk");
  const sdk = JSON.parse(fs.readFileSync(path.join(sdkRoot, "package.json"), "utf8"));
  assert.equal(sdk.version, "3.18.2");
  const cli = path.join(sdkRoot, sdk.bin.evalgate);
  const attempts = path.join(evidence, "network-attempts.txt");
  const loaded = path.join(evidence, "network-guard-loaded.txt");
  fs.writeFileSync(attempts, ""); fs.writeFileSync(loaded, "");
  env = { ...env, NODE_OPTIONS: `--import=${pathToFileURL(path.join(root, "scripts/deny-network.mjs")).href}`, EVALGATE_NETWORK_ATTEMPTS: attempts, EVALGATE_NETWORK_GUARD_LOADED: loaded };
  run("git-init", "git", ["init", "--quiet"]);
  run("git-name", "git", ["config", "user.name", "EvalGate Example Proof"]);
  run("git-email", "git", ["config", "user.email", "example-proof@evalgate.test"]);
  run("preview", process.execPath, [cli, "init", "--local", "--format", "json"]);
  run("apply", process.execPath, [cli, "init", "--local", "--apply", "--format", "json"]);
  const placeholder = path.join(project, "evals/smart-init/generic-node.eval.cjs");
  assert.match(fs.readFileSync(placeholder, "utf8"), /EvalGate smart-init scaffold/);
  fs.unlinkSync(placeholder);
  run("discover", process.execPath, [cli, "discover", "--manifest"]);
  run("stage", "git", ["add", "."]);
  run("commit", "git", ["-c", "commit.gpgSign=false", "commit", "--quiet", "-m", "review boundary checks"]);
  run("baseline", process.execPath, [cli, "baseline", "update"]);
  run("stage-baseline", "git", ["add", "."]);
  run("commit-baseline", "git", ["-c", "commit.gpgSign=false", "commit", "--quiet", "-m", "accept passing baseline"]);
  assert.equal(JSON.parse(run("pass", process.execPath, [cli, "gate", "--format", "json"])).releaseReady, true);
  const policy = path.join(project, "policy.cjs");
  const original = fs.readFileSync(policy, "utf8");
  assert.match(original, /> 30/);
  fs.writeFileSync(policy, original.replace("> 30", ">= 30"));
  assert.equal(JSON.parse(run("block", process.execPath, [cli, "gate", "--format", "json"], 2)).releaseReady, false);
  fs.writeFileSync(policy, original);
  assert.equal(JSON.parse(run("restore", process.execPath, [cli, "gate", "--format", "json"])).releaseReady, true);
  assert.equal(fs.readFileSync(attempts, "utf8"), "");
  assert.ok(fs.readFileSync(loaded, "utf8").includes("loaded"), "The network guard actually loaded");
  fs.writeFileSync(path.join(evidence, "summary.json"), JSON.stringify({ status: "passed", node: process.version, sdk: sdk.version, commands: records, networkAttempts: 0, journey: "preview/apply/review/baseline/pass/block/restore" }, null, 2));
  assert.ok(path.resolve(project).startsWith(path.join(os.tmpdir(), "evalgate public example ")));
  fs.rmSync(project, { recursive: true });
  console.log("Published SDK 3.18.2: credential-free pass/block/pass 0/2/0; no network attempts after install.");
} catch (error) {
  fs.writeFileSync(path.join(evidence, "summary.json"), JSON.stringify({ status: "failed", project, commands: records, error: String(error) }, null, 2));
  throw error;
}
