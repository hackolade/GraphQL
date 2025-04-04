const { describe, it, mock, afterEach } = require('node:test');
const assert = require('assert');

// Mock dependencies
const mapDirectivesUsageMock = mock.fn(() => []);

mock.module('../../../../reverse_engineering/mappers/directiveUsage.js', {
	namedExports: {
		mapDirectivesUsage: mapDirectivesUsageMock,
	},
});

const { getUnionTypeDefinitions } = require('../../../../reverse_engineering/mappers/typeDefinitions/union');

describe('getUnionTypeDefinitions', () => {
	afterEach(() => {
		mapDirectivesUsageMock.mock.resetCalls();
	});

	it('should return an empty array when no union types are provided', () => {
		const result = getUnionTypeDefinitions({
			unions: [],
			definitionCategoryByNameMap: {},
		});
		assert.deepStrictEqual(result, []);
	});

	it('should correctly map a simple union with member types', () => {
		const mockUnion = {
			name: { value: 'SearchResult' },
			types: [{ name: { value: 'User' } }, { name: { value: 'Post' } }],
			directives: [],
		};

		const definitionCategoryByNameMap = {
			'User': 'Objects',
			'Post': 'Objects',
		};

		const expected = [
			{
				type: 'union',
				name: 'SearchResult',
				description: '',
				typeDirectives: [],
				oneOf: [{ $ref: '#model/definitions/Objects/User' }, { $ref: '#model/definitions/Objects/Post' }],
			},
		];

		const result = getUnionTypeDefinitions({
			unions: [mockUnion],
			definitionCategoryByNameMap,
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0], {
			directives: [],
		});
	});

	it('should correctly map a union with description', () => {
		const mockUnion = {
			name: { value: 'Result' },
			description: { value: 'A result can be either success or error' },
			types: [{ name: { value: 'Success' } }, { name: { value: 'Error' } }],
			directives: [],
		};

		const definitionCategoryByNameMap = {
			'Success': 'Objects',
			'Error': 'Objects',
		};

		const expected = [
			{
				type: 'union',
				name: 'Result',
				description: 'A result can be either success or error',
				typeDirectives: [],
				oneOf: [{ $ref: '#model/definitions/Objects/Success' }, { $ref: '#model/definitions/Objects/Error' }],
			},
		];

		const result = getUnionTypeDefinitions({
			unions: [mockUnion],
			definitionCategoryByNameMap,
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
	});

	it('should correctly map a union with directives', () => {
		const mockDirectiveResult = [
			{ directiveName: '@deprecated', rawArgumentValues: 'reason: "Use NewResult instead"' },
		];
		mapDirectivesUsageMock.mock.mockImplementationOnce(() => mockDirectiveResult);

		const mockUnion = {
			name: { value: 'OldResult' },
			types: [{ name: { value: 'TypeA' } }, { name: { value: 'TypeB' } }],
			directives: [
				{
					name: { value: 'deprecated' },
					arguments: [{ name: { value: 'reason' }, value: { value: 'Use NewResult instead' } }],
				},
			],
		};

		const definitionCategoryByNameMap = {
			'TypeA': 'Objects',
			'TypeB': 'Objects',
		};

		const expected = [
			{
				type: 'union',
				name: 'OldResult',
				description: '',
				typeDirectives: mockDirectiveResult,
				oneOf: [{ $ref: '#model/definitions/Objects/TypeA' }, { $ref: '#model/definitions/Objects/TypeB' }],
			},
		];

		const result = getUnionTypeDefinitions({
			unions: [mockUnion],
			definitionCategoryByNameMap,
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0], {
			directives: mockUnion.directives,
		});
	});

	it('should correctly map union with types from different definition categories', () => {
		const mockUnion = {
			name: { value: 'MixedResult' },
			types: [{ name: { value: 'CustomObject' } }, { name: { value: 'StandardInterface' } }],
			directives: [],
		};

		const definitionCategoryByNameMap = {
			'CustomObject': 'Objects',
			'StandardInterface': 'Interfaces',
		};

		const expected = [
			{
				type: 'union',
				name: 'MixedResult',
				description: '',
				typeDirectives: [],
				oneOf: [
					{ $ref: '#model/definitions/Objects/CustomObject' },
					{ $ref: '#model/definitions/Interfaces/StandardInterface' },
				],
			},
		];

		const result = getUnionTypeDefinitions({
			unions: [mockUnion],
			definitionCategoryByNameMap,
		});

		assert.deepStrictEqual(result, expected);
	});

	it('should handle undefined member types array', () => {
		const mockUnion = {
			name: { value: 'EmptyUnion' },
			// types is undefined
			directives: [],
		};

		const expected = [
			{
				type: 'union',
				name: 'EmptyUnion',
				description: '',
				typeDirectives: [],
				oneOf: [],
			},
		];

		const result = getUnionTypeDefinitions({
			unions: [mockUnion],
			definitionCategoryByNameMap: {},
		});

		assert.deepStrictEqual(result, expected);
	});

	it('should handle undefined directives', () => {
		const mockUnion = {
			name: { value: 'UnionWithoutDirectives' },
			types: [{ name: { value: 'TypeA' } }],
			// directives is undefined
		};

		const definitionCategoryByNameMap = {
			'TypeA': 'Objects',
		};

		const expected = [
			{
				type: 'union',
				name: 'UnionWithoutDirectives',
				description: '',
				typeDirectives: [],
				oneOf: [{ $ref: '#model/definitions/Objects/TypeA' }],
			},
		];

		const result = getUnionTypeDefinitions({
			unions: [mockUnion],
			definitionCategoryByNameMap,
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0].directives, []);
	});

	it('should correctly map multiple union types', () => {
		const mockUnions = [
			{
				name: { value: 'Union1' },
				types: [{ name: { value: 'TypeA' } }],
				directives: [],
			},
			{
				name: { value: 'Union2' },
				types: [{ name: { value: 'TypeB' } }, { name: { value: 'TypeC' } }],
				directives: [],
			},
		];

		const definitionCategoryByNameMap = {
			'TypeA': 'Objects',
			'TypeB': 'Objects',
			'TypeC': 'Objects',
		};

		const expected = [
			{
				type: 'union',
				name: 'Union1',
				description: '',
				typeDirectives: [],
				oneOf: [{ $ref: '#model/definitions/Objects/TypeA' }],
			},
			{
				type: 'union',
				name: 'Union2',
				description: '',
				typeDirectives: [],
				oneOf: [{ $ref: '#model/definitions/Objects/TypeB' }, { $ref: '#model/definitions/Objects/TypeC' }],
			},
		];

		const result = getUnionTypeDefinitions({
			unions: mockUnions,
			definitionCategoryByNameMap,
		});

		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 2);
	});

	it('should default to Objects category if no mapping exists for a type', () => {
		const mockUnion = {
			name: { value: 'FallbackUnion' },
			types: [{ name: { value: 'KnownType' } }, { name: { value: 'UnknownType' } }],
			directives: [],
		};

		const definitionCategoryByNameMap = {
			'KnownType': 'Objects',
			// UnknownType is not in the map
		};

		const expected = [
			{
				type: 'union',
				name: 'FallbackUnion',
				description: '',
				typeDirectives: [],
				oneOf: [
					{ $ref: '#model/definitions/Objects/KnownType' },
					{ $ref: '#model/definitions/Objects/UnknownType' }, // Fallback to Objects
				],
			},
		];

		const result = getUnionTypeDefinitions({
			unions: [mockUnion],
			definitionCategoryByNameMap,
		});

		assert.deepStrictEqual(result, expected);
	});
});
