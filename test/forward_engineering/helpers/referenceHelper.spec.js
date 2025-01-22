const { describe, it } = require('node:test');
const { strictEqual } = require('node:assert');
const { getDefinitionNameFromReferencePath } = require('../../../forward_engineering/helpers/referenceHelper');

describe('getDefinitionNameFromReferencePath', () => {
	it('should return the definition name from a reference path', () => {
		const referencePath = '#/model/definitions/Objects/User';
		const result = getDefinitionNameFromReferencePath({ referencePath });
		strictEqual(result, 'User');
	});

	it('should return the last element from a simple reference path', () => {
		const referencePath = '#/User';
		const result = getDefinitionNameFromReferencePath({ referencePath });
		strictEqual(result, 'User');
	});

	it('should return an empty string if the reference path is undefined', () => {
		const result = getDefinitionNameFromReferencePath({ referencePath: undefined });
		strictEqual(result, '');
	});

	it('should return the correct name when reference path has multiple slashes', () => {
		const referencePath = '#/model/definitions/Objects/Account/User';
		const result = getDefinitionNameFromReferencePath({ referencePath });
		strictEqual(result, 'User');
	});
});
