const { describe, it } = require('node:test');
const assert = require('assert');
const { getFieldDefaultValueStatement } = require('../../../forward_engineering/mappers/fieldDefaultValue');

describe('getFieldDefaultValueStatement', () => {
	it('should return the default value statement for a regular field', () => {
		const field = { type: 'String', default: 'defaultString' };
		const result = getFieldDefaultValueStatement({ field });
		assert.strictEqual(result, '= "defaultString"');
	});

	it('should return the default value statement for a reference field', () => {
		const field = { $ref: '1', refDefaultValue: 'defaultRefValue' };
		const result = getFieldDefaultValueStatement({ field });
		assert.strictEqual(result, '= "defaultRefValue"');
	});

	it('should return the default value statement for a list field with a complex default value', () => {
		const field = { type: 'List', default: '[1, 2, 3]' };
		const result = getFieldDefaultValueStatement({ field });
		assert.strictEqual(result, '= [1, 2, 3]');
	});

	it('should return an empty string if no default value is present', () => {
		const field = { type: 'String' };
		const result = getFieldDefaultValueStatement({ field });
		assert.strictEqual(result, '');
	});

	it('should return the default value statement for a number type field', () => {
		const field = { type: 'Int', default: 42 };
		const result = getFieldDefaultValueStatement({ field });
		assert.strictEqual(result, '= 42');
	});

	it('should return the default value statement for a reference field with a number default value', () => {
		const field = { $ref: '1', refDefaultValue: '42' };
		const result = getFieldDefaultValueStatement({ field });
		assert.strictEqual(result, '= 42');
	});

	it('should format a complex reference default value', () => {
		const field = { $ref: '1', refDefaultValue: '{ name: "sample name" }' };
		const result = getFieldDefaultValueStatement({ field });
		assert.strictEqual(result, '= { name: "sample name" }');
	});

	it('should prepare a complex default value by replacing newlines with spaces', () => {
		const field = { type: 'List', default: '[\n1,\n2,\n3\n]' };
		const result = getFieldDefaultValueStatement({ field });
		assert.strictEqual(result, '= [ 1, 2, 3 ]');
	});
});
