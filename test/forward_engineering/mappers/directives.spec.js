const { describe, it, mock, afterEach } = require('node:test');
const { strictEqual, deepStrictEqual } = require('node:assert');

const getArgumentsMock = mock.fn(() => '');

mock.module('../../../forward_engineering/mappers/arguments', {
	namedExports: {
		getArguments: getArgumentsMock,
	},
});

// This require should be after the mocks to ensure that the mocks are applied before the module is required
const {
	getDirectives,
	mapDirective,
	getDirectiveName,
	mapDirectiveLocations,
} = require('../../../forward_engineering/mappers/directives');

describe('getDirectiveName', () => {
	it('should return the directive name with "@" prefix if not present', () => {
		const result = getDirectiveName('directiveName');
		strictEqual(result, '@directiveName');
	});

	it('should return the directive name as is if "@" prefix is present', () => {
		const result = getDirectiveName('@directiveName');
		strictEqual(result, '@directiveName');
	});
});

describe('mapDirectiveLocations', () => {
	it('should skip id key in directive locations object', () => {
		const directiveLocations = { id: '12', query: true };
		const result = mapDirectiveLocations({ directiveLocations });
		strictEqual(result, 'QUERY');
	});

	it('should map directive locations to a string', () => {
		const directiveLocations = { field: true, query: true };
		const result = mapDirectiveLocations({ directiveLocations });
		strictEqual(result, 'FIELD | QUERY');
	});

	it('should return UNKNOWN_LOCATION if no valid locations are provided', () => {
		const directiveLocations = {};
		const result = mapDirectiveLocations({ directiveLocations });
		strictEqual(result, 'UNKNOWN_LOCATION # Please specify the directive locations');
	});
});

describe('mapDirective', () => {
	afterEach(() => {
		getArgumentsMock.mock.resetCalls();
	});

	it('should map a directive to an FEStatement object', () => {
		const directive = {
			directiveLocations: { field: true },
			arguments: [
				{
					id: '1',
					type: 'String',
					name: 'testArgument',
				},
			],
			description: 'A test directive',
			isActivated: true,
		};
		const idToNameMap = {};

		getArgumentsMock.mock.mockImplementationOnce(() => '(testArgument: String)');

		const result = mapDirective({ name: 'testDirective', directive, idToNameMap });

		strictEqual(getArgumentsMock.mock.calls.length, 1);
		deepStrictEqual(result, {
			statement: 'directive @testDirective(testArgument: String) on FIELD',
			description: 'A test directive',
			isActivated: true,
		});
	});

	it("should map a directive to an FEStatement object if directive doesn't have arguments", () => {
		const directive = {
			directiveLocations: { field: true },
			description: 'A test directive',
			isActivated: true,
		};
		const idToNameMap = {};

		const result = mapDirective({ name: 'testDirective', directive, idToNameMap });

		deepStrictEqual(result, {
			statement: 'directive @testDirective on FIELD',
			description: 'A test directive',
			isActivated: true,
		});
	});

	it('should map a directive to an FEStatement object if directive is deactivated', () => {
		const directive = {
			directiveLocations: { field: true },
			description: 'A test directive',
			isActivated: false,
		};
		const idToNameMap = {};

		const result = mapDirective({ name: 'testDirective', directive, idToNameMap });

		deepStrictEqual(result, {
			statement: 'directive @testDirective on FIELD',
			description: 'A test directive',
			isActivated: false,
		});
	});
});

describe('getDirectives', () => {
	it('should map directives to an array of FEStatement objects', () => {
		const directives = {
			testDirective: {
				directiveLocations: { field: true },
				arguments: [],
				description: 'A test directive',
				isActivated: true,
			},
		};
		const idToNameMap = {};
		const result = getDirectives({ idToNameMap, directives });
		deepStrictEqual(result, [
			{
				statement: 'directive @testDirective on FIELD',
				description: 'A test directive',
				isActivated: true,
			},
		]);
	});
});
