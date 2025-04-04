const { describe, it } = require('node:test');
const assert = require('assert');
const { getDirectiveTypeDefinitions } = require('../../../../reverse_engineering/mappers/typeDefinitions/directive');

describe('getDirectiveTypeDefinitions', () => {
	it('should return an empty array when no directives are provided', () => {
		const result = getDirectiveTypeDefinitions({ directives: [] });
		assert.deepStrictEqual(result, []);
	});

	it('should correctly map a directive with basic properties', () => {
		const mockDirective = {
			name: { value: 'testDirective' },
			locations: [{ value: 'FIELD' }],
		};

		const expected = [
			{
				type: 'directive',
				name: '@testDirective',
				arguments: [],
				description: '',
				directiveLocations: {
					field: true,
				},
			},
		];

		const result = getDirectiveTypeDefinitions({ directives: [mockDirective] });
		assert.deepStrictEqual(result, expected);
	});

	it('should correctly map a directive with description', () => {
		const mockDirective = {
			name: { value: 'testDirective' },
			description: { value: 'Test description' },
			locations: [{ value: 'FIELD' }],
		};

		const expected = [
			{
				type: 'directive',
				name: '@testDirective',
				description: 'Test description',
				arguments: [],
				directiveLocations: {
					field: true,
				},
			},
		];

		const result = getDirectiveTypeDefinitions({ directives: [mockDirective] });
		assert.deepStrictEqual(result, expected);
	});

	it('should correctly map multiple locations', () => {
		const mockDirective = {
			name: { value: 'testDirective' },
			locations: [{ value: 'FIELD' }, { value: 'OBJECT' }, { value: 'SCHEMA' }],
		};

		const expected = [
			{
				type: 'directive',
				name: '@testDirective',
				arguments: [],
				description: '',
				directiveLocations: {
					field: true,
					object: true,
					schema: true,
				},
			},
		];

		const result = getDirectiveTypeDefinitions({ directives: [mockDirective] });
		assert.deepStrictEqual(result, expected);
	});

	it('should correctly map multiple directives', () => {
		const mockDirectives = [
			{
				name: { value: 'directive1' },
				locations: [{ value: 'FIELD' }],
			},
			{
				name: { value: 'directive2' },
				locations: [{ value: 'OBJECT' }],
			},
		];

		const expected = [
			{
				type: 'directive',
				name: '@directive1',
				arguments: [],
				description: '',
				directiveLocations: {
					field: true,
				},
			},
			{
				type: 'directive',
				name: '@directive2',
				arguments: [],
				description: '',
				directiveLocations: {
					object: true,
				},
			},
		];

		const result = getDirectiveTypeDefinitions({ directives: mockDirectives });
		assert.deepStrictEqual(result, expected);
	});

	it('should skip unknown location values', () => {
		const mockDirective = {
			name: { value: 'testDirective' },
			locations: [{ value: 'my_location' }],
		};

		const expected = [
			{
				type: 'directive',
				name: '@testDirective',
				arguments: [],
				description: '',
				directiveLocations: {},
			},
		];

		const result = getDirectiveTypeDefinitions({ directives: [mockDirective] });
		assert.deepStrictEqual(result, expected);
	});
});
