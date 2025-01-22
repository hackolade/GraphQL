const { describe, it } = require('node:test');
const assert = require('assert');
const { getArgumentDefaultValue } = require('../../../forward_engineering/mappers/argumentDefaultValue');

describe('getDefaultValue', () => {
	it('should return the default value as a string for type "ID"', () => {
		assert.strictEqual(getArgumentDefaultValue({ type: 'ID', defaultValue: '123' }), '"123"');
	});

	it('should return the default value as a string for type "String"', () => {
		assert.strictEqual(getArgumentDefaultValue({ type: 'String', defaultValue: 'test' }), '"test"');
	});

	it('should return the default value as an integer for type "Int"', () => {
		assert.strictEqual(getArgumentDefaultValue({ type: 'Int', defaultValue: '42' }), 42);
	});

	it('should return the default value as a float for type "Float"', () => {
		assert.strictEqual(getArgumentDefaultValue({ type: 'Float', defaultValue: '3.14' }), 3.14);
	});

	it('should return the default value as a boolean for type "Boolean" (true)', () => {
		assert.strictEqual(getArgumentDefaultValue({ type: 'Boolean', defaultValue: 'true' }), true);
	});

	it('should return the default value as a boolean for type "Boolean" (false)', () => {
		assert.strictEqual(getArgumentDefaultValue({ type: 'Boolean', defaultValue: 'false' }), false);
	});

	it('should return the default value as is for any other types types', () => {
		assert.strictEqual(getArgumentDefaultValue({ type: 'Unknown', defaultValue: 'default' }), 'default');
	});

	it('should return an empty string for unknown types with no default value', () => {
		assert.strictEqual(getArgumentDefaultValue({ type: 'Unknown' }), '');
	});
});
