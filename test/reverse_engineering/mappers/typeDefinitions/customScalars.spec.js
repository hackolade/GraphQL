const { describe, it, mock, afterEach } = require('node:test');
const assert = require('assert');

const mapDirectivesUsageMock = mock.fn(() => []);

mock.module('../../../../reverse_engineering/mappers/directiveUsage', {
	namedExports: {
		mapDirectivesUsage: mapDirectivesUsageMock,
	},
});

const {
	getCustomScalarTypeDefinitions,
} = require('../../../../reverse_engineering/mappers/typeDefinitions/customScalar');

describe('getCustomScalarTypeDefinitions', () => {
	afterEach(() => {
		mapDirectivesUsageMock.mock.resetCalls();
	});

	it('should return an empty array when no custom scalars are provided', () => {
		const result = getCustomScalarTypeDefinitions({ customScalars: [] });
		assert.deepStrictEqual(result, []);
	});

	it('should correctly map a scalar with just a name', () => {
		const mockScalar = {
			name: { value: 'DateTime' },
			directives: [],
		};

		const expected = [
			{
				type: 'scalar',
				name: 'DateTime',
				description: '',
				typeDirectives: [],
			},
		];

		const result = getCustomScalarTypeDefinitions({ customScalars: [mockScalar] });
		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0], { directives: [] });
	});

	it('should correctly map a scalar with description', () => {
		const mockScalar = {
			name: { value: 'DateTime' },
			description: { value: 'ISO-8601 encoded UTC date string' },
			directives: [],
		};

		const expected = [
			{
				type: 'scalar',
				name: 'DateTime',
				description: 'ISO-8601 encoded UTC date string',
				typeDirectives: [],
			},
		];

		const result = getCustomScalarTypeDefinitions({ customScalars: [mockScalar] });
		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
	});

	it('should correctly map a scalar with directives', () => {
		const mockDirectiveResult = [
			{ directiveName: '@specifiedBy', rawArgumentValues: 'url: "https://example.com/datetime"' },
		];
		mapDirectivesUsageMock.mock.mockImplementationOnce(() => mockDirectiveResult);

		const mockScalar = {
			name: { value: 'DateTime' },
			directives: [
				{
					name: { value: 'specifiedBy' },
					arguments: [{ name: { value: 'url' }, value: { value: 'https://example.com/datetime' } }],
				},
			],
		};

		const expected = [
			{
				type: 'scalar',
				name: 'DateTime',
				description: '',
				typeDirectives: mockDirectiveResult,
			},
		];

		const result = getCustomScalarTypeDefinitions({ customScalars: [mockScalar] });
		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.deepStrictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0], {
			directives: mockScalar.directives,
		});
	});

	it('should correctly map multiple scalars', () => {
		const mockScalars = [
			{
				name: { value: 'DateTime' },
				directives: [],
			},
			{
				name: { value: 'URL' },
				description: { value: 'URL scalar type' },
				directives: [],
			},
		];

		const expected = [
			{
				type: 'scalar',
				name: 'DateTime',
				description: '',
				typeDirectives: [],
			},
			{
				type: 'scalar',
				name: 'URL',
				description: 'URL scalar type',
				typeDirectives: [],
			},
		];

		const result = getCustomScalarTypeDefinitions({ customScalars: mockScalars });
		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 2);
	});

	it('should handle undefined directives', () => {
		const mockScalar = {
			name: { value: 'DateTime' },
			// directives are undefined
		};

		const expected = [
			{
				type: 'scalar',
				name: 'DateTime',
				description: '',
				typeDirectives: [],
			},
		];

		const result = getCustomScalarTypeDefinitions({ customScalars: [mockScalar] });
		assert.deepStrictEqual(result, expected);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls.length, 1);
		assert.strictEqual(mapDirectivesUsageMock.mock.calls[0].arguments[0].directives, undefined);
	});
});
