# EvalGate examples

Official, executable examples for [`@evalgate/sdk`](https://www.npmjs.com/package/@evalgate/sdk).
Always use the scoped package; `npx evalgate` is a different publisher's package.

Start with [the local gate](local-gate/README.md). In about five minutes you can
review two deterministic cases, accept a passing baseline, break the day-30
boundary, see exit **2**, and restore it. No account or provider credential is
needed. Installing the pinned SDK requires internet access.

The example pins the published SDK **3.18.2** and uses Node **24**. It makes no
model calls. A passing gate proves only its configured checks.

The [verification workflow](.github/workflows/local-gate.yml) runs the entire
loop in a new temporary repository. After installation, network access is
denied for the SDK and its child processes. It requires pass/block/pass exit
codes **0/2/0** and emits a receipt.

```bash
npm run verify
```

See the [feature inventory](https://www.evalgate.com/docs/platform/feature-status)
for product availability. Package publication does not establish deployment of
hosted APIs. [MIT license](LICENSE).
