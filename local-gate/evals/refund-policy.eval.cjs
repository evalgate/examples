const { createResult, defineEval } = require("@evalgate/sdk");
const { decideRefund } = require("../policy.cjs");

defineEval("day 30 stays inside the review window", async () => {
	const output = decideRefund({ daysSincePurchase: 30 });
	const pass = output === "review";
	return createResult({ pass, score: pass ? 100 : 0, output });
});

defineEval("day 31 is outside the review window", async () => {
	const output = decideRefund({ daysSincePurchase: 31 });
	const pass = output === "deny";
	return createResult({ pass, score: pass ? 100 : 0, output });
});
