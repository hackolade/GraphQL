const { describe, it } = require('node:test');
const assert = require('assert');
const { getArgumentDefaultValue } = require('../../../forward_engineering/mappers/argumentDefaultValue');

describe('getDefaultValue', () => {
	it('should return the default value as a string for type "ID"', () => {
		assert.strictEqual(getArgumentDefaultValue('ID', '123'), '"123"');
	});

	it('should return the default value as a string for type "String"', () => {
		assert.strictEqual(getArgumentDefaultValue('String', 'test'), '"test"');
	});

	it('should return the default value as an integer for type "Int"', () => {
		assert.strictEqual(getArgumentDefaultValue('Int', '42'), 42);
	});

	it('should return the default value as a float for type "Float"', () => {
		assert.strictEqual(getArgumentDefaultValue('Float', '3.14'), 3.14);
	});

	it('should return the default value as a boolean for type "Boolean" (true)', () => {
		assert.strictEqual(getArgumentDefaultValue('Boolean', 'true'), true);
	});

	it('should return the default value as a boolean for type "Boolean" (false)', () => {
		assert.strictEqual(getArgumentDefaultValue('Boolean', 'false'), false);
	});

	it('should return the default value as is for any other types types', () => {
		assert.strictEqual(getArgumentDefaultValue('Unknown', 'default'), 'default');
	});

	it('should return an empty string for unknown types with no default value', () => {
		assert.strictEqual(getArgumentDefaultValue('Unknown'), '');
	});
});
