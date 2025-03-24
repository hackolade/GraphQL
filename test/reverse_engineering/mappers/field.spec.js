const { describe, it, mock, afterEach } = require('node:test');
const assert = require('assert');

// Mock dependencies
const mapDirectivesUsageMock = mock.fn(() => []);

mock.module('../../../reverse_engineering/mappers/directiveUsage', {
	namedExports: {
		mapDirectivesUsage: mapDirectivesUsageMock,
	},
});

const astNodeKindMock = {
	NAMED_TYPE: 'NamedType',
	NON_NULL_TYPE: 'NonNullType',
	LIST_TYPE: 'ListType',
};

const { mapField } = require('../../../reverse_engineering/mappers/field');

describe('field', () => {
	afterEach(() => {
		mapDirectivesUsageMock.mock.resetCalls();
	});

	describe('mapField', () => {
		it('should map basic field with scalar type', () => {
			const field = {
				name: { value: 'name' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'String' },
				},
				directives: [],
			};
			const definitionCategoryByNameMap = {};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'name',
				type: 'String',
				required: false,
				fieldDirectives: [],
				description: undefined,
			});
			assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		});

		it('should map field with description', () => {
			const field = {
				name: { value: 'name' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'String' },
				},
				description: { value: 'User name' },
				directives: [],
			};
			const definitionCategoryByNameMap = {};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'name',
				type: 'String',
				required: false,
				fieldDirectives: [],
				description: 'User name',
			});
		});

		it('should map field with directives', () => {
			const mockDirectives = [{ name: { value: 'deprecated' }, arguments: [] }];
			const mockMappedDirectives = [{ directiveName: '@deprecated', rawArgumentValues: '' }];
			mapDirectivesUsageMock.mock.mockImplementationOnce(() => mockMappedDirectives);

			const field = {
				name: { value: 'oldField' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'String' },
				},
				directives: mockDirectives,
			};
			const definitionCategoryByNameMap = {};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'oldField',
				type: 'String',
				required: false,
				fieldDirectives: mockMappedDirectives,
				description: undefined,
			});
			assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
			assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0], {
				directives: mockDirectives,
			});
		});

		it('should map field with reference type', () => {
			const field = {
				name: { value: 'user' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'User' },
				},
				description: { value: 'The user' },
				directives: [],
			};
			const definitionCategoryByNameMap = {
				'User': 'Objects',
			};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'user',
				$ref: '#model/definitions/Objects/User',
				required: false,
				fieldDirectives: [],
				refDescription: 'The user',
			});
		});

		it('should map field with required type', () => {
			const field = {
				name: { value: 'id' },
				type: {
					kind: astNodeKindMock.NON_NULL_TYPE,
					type: {
						kind: astNodeKindMock.NAMED_TYPE,
						name: { value: 'ID' },
					},
				},
				directives: [],
			};
			const definitionCategoryByNameMap = {};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'id',
				type: 'ID',
				required: true,
				fieldDirectives: [],
				description: undefined,
			});
		});

		it('should map field with list type', () => {
			const field = {
				name: { value: 'friends' },
				type: {
					kind: astNodeKindMock.LIST_TYPE,
					type: {
						kind: astNodeKindMock.NAMED_TYPE,
						name: { value: 'User' },
					},
				},
				directives: [],
			};
			const definitionCategoryByNameMap = {
				'User': 'Objects',
			};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'friends',
				type: 'List',
				items: [
					{
						$ref: '#model/definitions/Objects/User',
						required: false,
					},
				],
				required: false,
				fieldDirectives: [],
				description: undefined,
			});
		});

		it('should map field with required list of required items', () => {
			const field = {
				name: { value: 'requiredFriends' },
				type: {
					kind: astNodeKindMock.NON_NULL_TYPE,
					type: {
						kind: astNodeKindMock.LIST_TYPE,
						type: {
							kind: astNodeKindMock.NON_NULL_TYPE,
							type: {
								kind: astNodeKindMock.NAMED_TYPE,
								name: { value: 'User' },
							},
						},
					},
				},
				directives: [],
			};
			const definitionCategoryByNameMap = {
				'User': 'Objects',
			};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'requiredFriends',
				type: 'List',
				items: [
					{
						$ref: '#model/definitions/Objects/User',
						required: true,
					},
				],
				required: true,
				fieldDirectives: [],
				description: undefined,
			});
		});

		it('should handle undefined directives', () => {
			const field = {
				name: { value: 'name' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'String' },
				},
				// directives property is omitted
			};
			const definitionCategoryByNameMap = {};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'name',
				type: 'String',
				required: false,
				fieldDirectives: [],
				description: undefined,
			});
			assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
			assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0].directives, []);
		});

		it('should fallback to string type for unknown named types', () => {
			const field = {
				name: { value: 'customType' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'UnknownType' },
				},
				directives: [],
			};
			const definitionCategoryByNameMap = {}; // UnknownType not in map

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'customType',
				type: 'string', // Fallback to string
				required: false,
				fieldDirectives: [],
				description: undefined,
			});
		});
	});
});
