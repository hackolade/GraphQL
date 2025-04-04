/**
 * @import {EnumTypeDefinitionNode, EnumValueDefinitionNode} from "graphql"
 * @import {REEnumDefinition, REEnumValue, StructuredDirective} from "../../../shared/types/types"
 */

const { describe, it, mock, afterEach } = require('node:test');
const assert = require('assert');
const { astNodeKind } = require('../../../../reverse_engineering/constants/graphqlAST');

const mapDirectivesUsageMock = mock.fn(() => []);
mock.module('../../../../reverse_engineering/mappers/directiveUsage.js', {
	namedExports: {
		mapDirectivesUsage: mapDirectivesUsageMock,
	},
});

// This require should be after the mocks to ensure that the mocks are applied before the module is required
const {
	getEnumTypeDefinitions,
	mapEnum,
	mapEnumValues,
} = require('../../../../reverse_engineering/mappers/typeDefinitions/enum');

describe('getEnumTypeDefinitions', () => {
	afterEach(() => {
		mapDirectivesUsageMock.mock.resetCalls();
	});

	it('should return an empty array when no enums are provided', () => {
		const result = getEnumTypeDefinitions({ enums: [] });
		assert.deepStrictEqual(result, []);
	});

	it('should correctly map multiple enum type definitions', () => {
		const mockEnums = /** @type {EnumTypeDefinitionNode[]} */ ([
			{
				kind: astNodeKind.ENUM_TYPE_DEFINITION,
				name: {
					kind: astNodeKind.NAME,
					value: 'Status',
				},
				values: [
					{
						kind: astNodeKind.ENUM_VALUE_DEFINITION,
						name: { value: 'ACTIVE', kind: astNodeKind.NAME },
						directives: [],
					},
					{
						kind: astNodeKind.ENUM_VALUE_DEFINITION,
						name: { value: 'INACTIVE', kind: astNodeKind.NAME },
						directives: [],
					},
				],
				directives: [],
			},
			{
				name: {
					kind: astNodeKind.NAME,
					value: 'Role',
				},
				description: { value: 'User roles' },
				values: [
					{
						kind: astNodeKind.ENUM_VALUE_DEFINITION,
						name: { value: 'ADMIN', kind: astNodeKind.NAME },
						directives: [],
					},
					{
						kind: astNodeKind.ENUM_VALUE_DEFINITION,
						name: { value: 'USER', kind: astNodeKind.NAME },
						directives: [],
					},
				],
				directives: [],
			},
		]);

		/** @type {REEnumDefinition[]} */
		const expected = [
			{
				type: 'enum',
				name: 'Status',
				description: '',
				enumValues: [
					{ value: 'ACTIVE', description: '', valueDirectives: [] },
					{ value: 'INACTIVE', description: '', valueDirectives: [] },
				],
				typeDirectives: [],
			},
			{
				type: 'enum',
				name: 'Role',
				description: 'User roles',
				enumValues: [
					{ value: 'ADMIN', description: '', valueDirectives: [] },
					{ value: 'USER', description: '', valueDirectives: [] },
				],
				typeDirectives: [],
			},
		];

		const result = getEnumTypeDefinitions({ enums: mockEnums });
		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 6); // 2 enums + 4 values
	});
});

describe('mapEnum', () => {
	afterEach(() => {
		mapDirectivesUsageMock.mock.resetCalls();
	});

	it('should correctly map an enum with just a name', () => {
		const mockEnum = /** @type {EnumTypeDefinitionNode} */ ({
			name: { value: 'Status' },
			values: [],
			directives: [],
		});

		/** @type {REEnumDefinition} */
		const expected = {
			type: 'enum',
			name: 'Status',
			description: '',
			enumValues: [],
			typeDirectives: [],
		};

		const result = mapEnum({ enumNode: mockEnum });
		assert.deepStrictEqual(result, expected);
	});

	it('should correctly map an enum with description', () => {
		const mockEnum = /** @type {EnumTypeDefinitionNode} */ ({
			name: { value: 'Status' },
			description: { value: 'Status of an entity' },
			values: [],
			directives: [],
		});

		/** @type {REEnumDefinition} */
		const expected = {
			type: 'enum',
			name: 'Status',
			description: 'Status of an entity',
			enumValues: [],
			typeDirectives: [],
		};

		const result = mapEnum({ enumNode: mockEnum });
		assert.deepStrictEqual(result, expected);
	});

	it('should correctly map an enum with directives', () => {
		const mockDirectiveResult = /** @type {StructuredDirective[]} */ ([
			{ directiveName: '@deprecated', rawArgumentValues: 'reason: "Use new enum"' },
		]);

		mapDirectivesUsageMock.mock.mockImplementationOnce(() => mockDirectiveResult);

		const mockEnum = /** @type {EnumTypeDefinitionNode} */ ({
			name: { value: 'Status' },
			values: [],
			directives: [{ name: { value: 'deprecated' } }],
		});

		/** @type {REEnumDefinition} */
		const expected = {
			type: 'enum',
			name: 'Status',
			description: '',
			enumValues: [],
			typeDirectives: mockDirectiveResult,
		};

		const result = mapEnum({ enumNode: mockEnum });
		assert.deepStrictEqual(result, expected);
	});

	it('should handle undefined values and directives', () => {
		const mockEnum = /** @type {EnumTypeDefinitionNode} */ ({
			name: { value: 'Status' },
			// values and directives are undefined
		});

		/** @type {REEnumDefinition} */
		const expected = {
			type: 'enum',
			name: 'Status',
			description: '',
			enumValues: [],
			typeDirectives: [],
		};

		const result = mapEnum({ enumNode: mockEnum });
		assert.deepStrictEqual(result, expected);
	});
});

describe('mapEnumValues', () => {
	afterEach(() => {
		mapDirectivesUsageMock.mock.resetCalls();
	});

	it('should correctly map enum values', () => {
		const mockValues = /** @type {EnumValueDefinitionNode[]} */ ([
			{
				kind: astNodeKind.ENUM_VALUE_DEFINITION,
				name: { value: 'ACTIVE' },
				directives: [],
			},
			{
				kind: astNodeKind.ENUM_VALUE_DEFINITION,
				name: { value: 'INACTIVE' },
				description: { value: 'Inactive status' },
				directives: [],
			},
		]);

		/** @type {REEnumValue[]} */
		const expected = [
			{ value: 'ACTIVE', description: '', valueDirectives: [] },
			{ value: 'INACTIVE', description: 'Inactive status', valueDirectives: [] },
		];

		const result = mapEnumValues({ values: mockValues });
		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 2);
	});

	it('should correctly map enum values with directives', () => {
		/** @type {StructuredDirective[]} */
		const mockDirectiveResult = [
			{
				directiveFormat: 'Structured',
				argumentValueFormat: 'Raw',
				directiveName: '@deprecated',
				rawArgumentValues: 'reason: "Use new value"',
			},
		];
		mapDirectivesUsageMock.mock.mockImplementationOnce(() => [], 0);
		mapDirectivesUsageMock.mock.mockImplementationOnce(() => mockDirectiveResult, 1);

		const mockValues = /** @type {EnumValueDefinitionNode[]} */ ([
			{
				name: { value: 'ACTIVE' },
				directives: [],
			},
			{
				name: { value: 'INACTIVE' },
				directives: [{ name: { value: 'deprecated' } }],
			},
		]);

		/** @type {REEnumValue[]} */
		const expected = [
			{ value: 'ACTIVE', description: '', valueDirectives: [] },
			{ value: 'INACTIVE', description: '', valueDirectives: mockDirectiveResult },
		];

		const result = mapEnumValues({ values: mockValues });
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 2);
		assert.deepStrictEqual(result, expected);
	});

	it('should return an empty array when no values are provided', () => {
		const result = mapEnumValues({ values: [] });
		assert.deepStrictEqual(result, []);
	});
});
