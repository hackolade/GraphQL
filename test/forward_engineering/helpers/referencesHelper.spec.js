const { describe, it } = require('node:test');
const assert = require('node:assert');
const { getDefinitionNameFromReferencePath } = require('../../../forward_engineering/helpers/referencesHelper');

describe('getDefinitionNameFromReferencePath', () => {
	it('should return the last element of the reference path', () => {
		const result = getDefinitionNameFromReferencePath({ referencePath: '/path/to/definition' });
		assert.strictEqual(result, 'definition');
	});

	it('should return the last element even if there are multiple slashes', () => {
		const result = getDefinitionNameFromReferencePath({ referencePath: '/path/to/multiple/slashes/definition' });
		assert.strictEqual(result, 'definition');
	});

	it('should return the last element when there is no leading slash', () => {
		const result = getDefinitionNameFromReferencePath({ referencePath: 'path/to/definition' });
		assert.strictEqual(result, 'definition');
	});

	it('should return the last element when the path is a single element', () => {
		const result = getDefinitionNameFromReferencePath({ referencePath: 'definition' });
		assert.strictEqual(result, 'definition');
	});

	it('should return an empty string when the reference path is empty', () => {
		const result = getDefinitionNameFromReferencePath({ referencePath: '' });
		assert.strictEqual(result, '');
	});

	it('should return an empty string when the reference path is undefined', () => {
		const result = getDefinitionNameFromReferencePath({ referencePath: undefined });
		assert.strictEqual(result, '');
	});
});
