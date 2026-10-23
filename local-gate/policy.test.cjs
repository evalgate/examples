const assert = require("node:assert/strict");
const { test } = require("node:test");
const { decideRefund } = require("./policy.cjs");

test("day 30 stays inside the review window", () => {
	assert.equal(decideRefund({ daysSincePurchase: 30 }), "review");
});

test("day 31 is outside the review window", () => {
	assert.equal(decideRefund({ daysSincePurchase: 31 }), "deny");
});
