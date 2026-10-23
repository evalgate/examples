# Local gate example

Copy this directory into a new repository. It tests a fictional support-policy
boundary with Node's built-in test runner. There are no credentials, models,
provider calls or hosted mutations. Package installation requires the network.

```bash
npm install
git init
npx @evalgate/sdk init --local --format json
npx @evalgate/sdk init --local --apply --format json
```

Review the scaffold. The supplied `evals/refund-policy.eval.cjs` checks the real
function in this example. Init also creates
`evals/smart-init/generic-node.eval.cjs`. Delete that generated placeholder after
reviewing the init plan; keep the supplied `evals/refund-policy.eval.cjs`.
Baseline acceptance refuses an untouched placeholder. Refresh discovery,
review and commit the scaffold files and lockfile, then accept a passing baseline:

```bash
rm evals/smart-init/generic-node.eval.cjs
npx @evalgate/sdk discover --manifest
git diff
git status --short
git add .
git commit -m "add reviewed boundary checks"
npx @evalgate/sdk baseline update
git add evals/baseline.json
git commit -m "accept baseline"
npx @evalgate/sdk gate --format json
```

Change `> 30` to `>= 30` in `policy.cjs`. The day-30 check must fail and the
gate must block. Restore the comparison and rerun against the original
baseline. Do not update the baseline to hide the failure.

For a source build that advertises JUnit, capture XML without changing the
process exit: `npx @evalgate/sdk gate --format junit > evalgate.xml`. The XML
contains actual spec cases where available, plus one explicit gate-admission
check. A legacy test command exposes only aggregate admission, never fabricated
individual cases. Do not use this format with older published versions.

This is the official [EvalGate examples](https://github.com/evalgate/examples)
local gate. The repository's verification workflow repeats this loop in a new
temporary repository with network access denied after installing the SDK.
