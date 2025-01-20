const { add, multiply } = require('./math');

function calculateSum(a, b) {
	return add(a, b);
}

function calculateProduct(a, b) {
	return multiply(a, b);
}

module.exports = { calculateSum, calculateProduct };
