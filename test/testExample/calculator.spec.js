const { mock, before, describe, it } = require('node:test');
const assert = require('node:assert');

describe('calculator', t => {
	let calculator;
	let addSpy, multiplySpy;

	before(() => {
		addSpy = mock.fn((a, b) => 42);
		multiplySpy = mock.fn((a, b) => -1);

		mock.module('./math', {
			namedExports: {
				add: addSpy,
				multiply: multiplySpy,
			},
		});
		calculator = require('./calculator');
	});

	it('calculateSum uses mocked add function', t => {
		const result = calculator.calculateSum(2, 3);
		assert.strictEqual(result, 42);
		assert.strictEqual(addSpy.mock.calls.length, 1);
	});

	it('calculateProduct uses mocked multiply function', t => {
		const result = calculator.calculateProduct(2, 3);
		assert.strictEqual(result, -1);
		assert.strictEqual(multiplySpy.mock.calls.length, 1);
	});
});
