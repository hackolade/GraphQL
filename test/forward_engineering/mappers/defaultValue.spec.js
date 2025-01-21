const { describe, it } = require('node:test');
const assert = require('assert');
const { getDefaultValue } = require('../../../forward_engineering/mappers/defaultValue');

describe('getDefaultValue', () => {
	it('should return the default value as a string for type "ID"', () => {
		assert.strictEqual(getDefaultValue('ID', '123'), '"123"');
	});

	it('should return the default value as a string for type "String"', () => {
		assert.strictEqual(getDefaultValue('String', 'test'), '"test"');
	});

	it('should return the default value as an integer for type "Int"', () => {
		assert.strictEqual(getDefaultValue('Int', '42'), 42);
	});

	it('should return the default value as a float for type "Float"', () => {
		assert.strictEqual(getDefaultValue('Float', '3.14'), 3.14);
	});

	it('should return the default value as a boolean for type "Boolean" (true)', () => {
		assert.strictEqual(getDefaultValue('Boolean', 'true'), true);
	});

	it('should return the default value as a boolean for type "Boolean" (false)', () => {
		assert.strictEqual(getDefaultValue('Boolean', 'false'), false);
	});

	it('should return the default value as is for any other types types', () => {
		assert.strictEqual(getDefaultValue('Unknown', 'default'), 'default');
	});

	it('should return an empty string for unknown types with no default value', () => {
		assert.strictEqual(getDefaultValue('Unknown'), '');
	});
});
