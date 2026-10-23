// Fictional teaching policy. This does not implement a production refund rule.
exports.decideRefund = ({ daysSincePurchase }) =>
	daysSincePurchase > 30 ? "deny" : "review";
