const { describe, it, mock, afterEach } = require('node:test');
const assert = require('assert');

// Mock dependencies
const mapDirectivesUsageMock = mock.fn(() => []);

mock.module('../../../reverse_engineering/mappers/directiveUsage.js', {
	namedExports: {
		mapDirectivesUsage: mapDirectivesUsageMock,
	},
});

const astNodeKindMock = {
	NAMED_TYPE: 'NamedType',
	NON_NULL_TYPE: 'NonNullType',
	LIST_TYPE: 'ListType',
	INT: 'IntValue',
	FLOAT: 'FloatValue',
	STRING: 'StringValue',
	BOOLEAN: 'BooleanValue',
	NULL: 'NullValue',
	ENUM: 'EnumValue',
	LIST: 'ListValue',
	OBJECT: 'ObjectValue',
	OBJECT_FIELD: 'ObjectField',
};

mock.module('../../../reverse_engineering/constants/graphqlAST.js', {
	namedExports: {
		astNodeKind: astNodeKindMock,
	},
});

mock.module('../../../reverse_engineering/constants/types.js', {
	namedExports: {
		BUILT_IN_SCALAR_LIST: ['String', 'Int', 'Float', 'Boolean', 'ID'],
	},
});

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

	describe('default value handling', () => {
		it('should map field with string default value', () => {
			const field = {
				name: { value: 'username' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'String' },
				},
				directives: [],
				defaultValue: {
					kind: astNodeKindMock.STRING,
					value: 'anonymous',
				},
			};
			const definitionCategoryByNameMap = {};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'username',
				type: 'String',
				required: false,
				fieldDirectives: [],
				description: undefined,
				default: 'anonymous',
			});
		});

		it('should map field with numeric default value', () => {
			const field = {
				name: { value: 'age' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'Int' },
				},
				directives: [],
				defaultValue: {
					kind: astNodeKindMock.INT,
					value: '30',
				},
			};
			const definitionCategoryByNameMap = {};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'age',
				type: 'Int',
				required: false,
				fieldDirectives: [],
				description: undefined,
				default: 30,
			});
		});

		it('should map field with boolean default value', () => {
			const field = {
				name: { value: 'isActive' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'Boolean' },
				},
				directives: [],
				defaultValue: {
					kind: astNodeKindMock.BOOLEAN,
					value: true,
				},
			};
			const definitionCategoryByNameMap = {};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'isActive',
				type: 'Boolean',
				required: false,
				fieldDirectives: [],
				description: undefined,
				default: 'true',
			});
		});

		it('should map field with enum default value', () => {
			const field = {
				name: { value: 'role' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'Role' },
				},
				directives: [],
				defaultValue: {
					kind: astNodeKindMock.ENUM,
					value: 'USER',
				},
			};
			const definitionCategoryByNameMap = {
				'Role': 'Enums',
			};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'role',
				$ref: '#model/definitions/Enums/Role',
				required: false,
				fieldDirectives: [],
				refDescription: undefined,
				default: 'USER',
			});
		});

		it('should map field with null default value', () => {
			const field = {
				name: { value: 'optionalField' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'String' },
				},
				directives: [],
				defaultValue: {
					kind: astNodeKindMock.NULL,
				},
			};
			const definitionCategoryByNameMap = {};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'optionalField',
				type: 'String',
				required: false,
				fieldDirectives: [],
				description: undefined,
				default: 'null',
			});
		});

		it('should map field with list default value', () => {
			const field = {
				name: { value: 'tags' },
				type: {
					kind: astNodeKindMock.LIST_TYPE,
					type: {
						kind: astNodeKindMock.NAMED_TYPE,
						name: { value: 'String' },
					},
				},
				directives: [],
				defaultValue: {
					kind: astNodeKindMock.LIST,
					values: [
						{
							kind: astNodeKindMock.STRING,
							value: 'tag1',
						},
						{
							kind: astNodeKindMock.STRING,
							value: 'tag2',
						},
					],
				},
			};
			const definitionCategoryByNameMap = {};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'tags',
				type: 'List',
				items: [
					{
						type: 'String',
						required: false,
					},
				],
				required: false,
				fieldDirectives: [],
				description: undefined,
				default: '["tag1", "tag2"]',
			});
		});

		it('should map field with object default value', () => {
			const field = {
				name: { value: 'settings' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'UserSettings' },
				},
				directives: [],
				defaultValue: {
					kind: astNodeKindMock.OBJECT,
					fields: [
						{
							name: { value: 'theme' },
							value: {
								kind: astNodeKindMock.STRING,
								value: 'dark',
							},
						},
						{
							name: { value: 'notifications' },
							value: {
								kind: astNodeKindMock.BOOLEAN,
								value: true,
							},
						},
					],
				},
			};
			const definitionCategoryByNameMap = {
				'UserSettings': 'Input objects',
			};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'settings',
				$ref: '#model/definitions/Input objects/UserSettings',
				required: false,
				fieldDirectives: [],
				refDescription: undefined,
				default: '{ theme: "dark", notifications: true }',
			});
		});

		it('should handle nested default values correctly', () => {
			const field = {
				name: { value: 'complexField' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'ComplexInput' },
				},
				directives: [],
				defaultValue: {
					kind: astNodeKindMock.OBJECT,
					fields: [
						{
							name: { value: 'name' },
							value: {
								kind: astNodeKindMock.STRING,
								value: 'John',
							},
						},
						{
							name: { value: 'preferences' },
							value: {
								kind: astNodeKindMock.OBJECT,
								fields: [
									{
										name: { value: 'favoriteColors' },
										value: {
											kind: astNodeKindMock.LIST,
											values: [
												{
													kind: astNodeKindMock.STRING,
													value: 'blue',
												},
												{
													kind: astNodeKindMock.STRING,
													value: 'green',
												},
											],
										},
									},
								],
							},
						},
					],
				},
			};
			const definitionCategoryByNameMap = {
				'ComplexInput': 'Input objects',
			};

			const result = mapField({ field, definitionCategoryByNameMap });

			assert.deepStrictEqual(result, {
				name: 'complexField',
				$ref: '#model/definitions/Input objects/ComplexInput',
				required: false,
				fieldDirectives: [],
				refDescription: undefined,
				default: '{ name: "John", preferences: { favoriteColors: ["blue", "green"] } }',
			});
		});

		it('should properly handle quotes in string default values', () => {
			// Test for top-level string (no quotes)
			const topLevelField = {
				name: { value: 'greeting' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'String' },
				},
				directives: [],
				defaultValue: {
					kind: astNodeKindMock.STRING,
					value: 'Hello World',
				},
			};

			// Test for nested string (should have quotes)
			const nestedField = {
				name: { value: 'user' },
				type: {
					kind: astNodeKindMock.NAMED_TYPE,
					name: { value: 'UserInput' },
				},
				directives: [],
				defaultValue: {
					kind: astNodeKindMock.OBJECT,
					fields: [
						{
							name: { value: 'name' },
							value: {
								kind: astNodeKindMock.STRING,
								value: 'Taras',
							},
						},
					],
				},
			};

			const definitionCategoryByNameMap = {
				'UserInput': 'Input objects',
			};

			const topLevelResult = mapField({ field: topLevelField, definitionCategoryByNameMap });
			const nestedResult = mapField({ field: nestedField, definitionCategoryByNameMap });

			// Top-level string should not have quotes
			assert.strictEqual(topLevelResult.default, 'Hello World');

			// Nested string should have quotes
			assert.strictEqual(nestedResult.default, '{ name: "Taras" }');
		});
	});
});
