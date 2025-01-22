const { describe, it, mock, afterEach } = require('node:test');
const { strictEqual, deepStrictEqual } = require('node:assert');

const getDefinitionNameFromReferencePathMock = mock.fn(() => '');
const joinInlineStatementsMock = mock.fn(() => '');
const getDirectivesUsageStatementMock = mock.fn(() => '');

mock.module('../../../forward_engineering/helpers/referenceHelper', {
	namedExports: {
		getDefinitionNameFromReferencePath: getDefinitionNameFromReferencePathMock,
	},
});

mock.module('../../../forward_engineering/helpers/feStatementJoinHelper', {
	namedExports: {
		joinInlineStatements: joinInlineStatementsMock,
	},
});

mock.module('../../../forward_engineering/mappers/directives', {
	namedExports: {
		getDirectivesUsageStatement: getDirectivesUsageStatementMock,
	},
});

// This require should be after the mocks to ensure that the mocks are applied before the module is required
const { getUnionMemberTypes, mapUnion, getUnions } = require('../../../forward_engineering/mappers/unions');

describe('getUnionMemberTypes', () => {
	afterEach(() => {
		getDefinitionNameFromReferencePathMock.mock.resetCalls();
		joinInlineStatementsMock.mock.resetCalls();
		getDirectivesUsageStatementMock.mock.resetCalls();
	});

	it('should return union member types as a string', () => {
		const unionMemberTypes = [{ $ref: '#/definitions/User' }, { $ref: '#/definitions/Account' }];

		getDefinitionNameFromReferencePathMock.mock.mockImplementationOnce(() => 'User', 0);
		getDefinitionNameFromReferencePathMock.mock.mockImplementationOnce(() => 'Account', 1);

		const result = getUnionMemberTypes({ unionMemberTypes });

		strictEqual(getDefinitionNameFromReferencePathMock.mock.calls.length, 2);
		strictEqual(result, 'User | Account');
	});

	it('should filter out empty union member types', () => {
		const unionMemberTypes = [{ $ref: '#/definitions/User' }, {}];

		getDefinitionNameFromReferencePathMock.mock.mockImplementationOnce(() => 'User', 0);

		const result = getUnionMemberTypes({ unionMemberTypes });

		strictEqual(getDefinitionNameFromReferencePathMock.mock.calls.length, 1);
		strictEqual(result, 'User');
	});
});

describe('mapUnion', () => {
	afterEach(() => {
		getDefinitionNameFromReferencePathMock.mock.resetCalls();
		joinInlineStatementsMock.mock.resetCalls();
		getDirectivesUsageStatementMock.mock.resetCalls();
	});

	it('should map a union to an FEStatement', () => {
		const union = {
			oneOf: [{ $ref: '#/definitions/User' }],
			typeDirectives: [{ directiveFormat: 'Raw', rawDirective: '@directive' }],
			description: 'A union type',
			isActivated: true,
		};

		getDefinitionNameFromReferencePathMock.mock.mockImplementationOnce(() => 'User');
		getDirectivesUsageStatementMock.mock.mockImplementationOnce(() => '@directive');
		joinInlineStatementsMock.mock.mockImplementationOnce(() => 'union UserUnion @directive = User');

		const result = mapUnion({ name: 'UserUnion', union });

		strictEqual(getDefinitionNameFromReferencePathMock.mock.calls.length, 1);
		strictEqual(getDirectivesUsageStatementMock.mock.calls.length, 1);
		strictEqual(joinInlineStatementsMock.mock.calls.length, 1);
		deepStrictEqual(result, {
			statement: 'union UserUnion @directive = User',
			description: 'A union type',
			isActivated: true,
		});
	});
});

describe('getUnions', () => {
	afterEach(() => {
		getDefinitionNameFromReferencePathMock.mock.resetCalls();
		joinInlineStatementsMock.mock.resetCalls();
		getDirectivesUsageStatementMock.mock.resetCalls();
	});

	it('should map union types to an array of FEStatement', () => {
		const unions = {
			UserUnion: {
				oneOf: [{ $ref: '#/definitions/User' }],
				typeDirectives: [{ directiveFormat: 'Raw', rawDirective: '@directive' }],
				description: 'A union type',
				isActivated: true,
			},
		};

		getDefinitionNameFromReferencePathMock.mock.mockImplementationOnce(() => 'User');
		getDirectivesUsageStatementMock.mock.mockImplementationOnce(() => '@directive');
		joinInlineStatementsMock.mock.mockImplementationOnce(() => 'union UserUnion @directive = User');

		const result = getUnions({ unions });
		deepStrictEqual(result, [
			{
				statement: 'union UserUnion @directive = User',
				description: 'A union type',
				isActivated: true,
			},
		]);
	});
});
