const { describe, it } = require('node:test');
const assert = require('node:assert');
const { getImplementsInterfacesStatement } = require('../../../forward_engineering/mappers/implementsInterfaces');

describe('getImplementsInterfacesStatement', () => {
	it('should return an empty string when no interfaces are provided', () => {
		const result = getImplementsInterfacesStatement({ interfaces: [], definitionsIdToNameMap: {} });
		assert.strictEqual(result, '');

		const result2 = getImplementsInterfacesStatement({ interfaces: undefined, definitionsIdToNameMap: {} });
		assert.strictEqual(result2, '');
	});

	it('should return a single interface when one interface is provided', () => {
		const interfaces = [{ interface: '1' }];
		const definitionsIdToNameMap = { '1': 'Interface1' };
		const result = getImplementsInterfacesStatement({ interfaces, definitionsIdToNameMap });
		assert.strictEqual(result, 'implements Interface1');
	});

	it('should return multiple interfaces joined by " & "', () => {
		const interfaces = [{ interface: '1' }, { interface: '2' }];
		const definitionsIdToNameMap = { '1': 'Interface1', '2': 'Interface2' };
		const result = getImplementsInterfacesStatement({ interfaces, definitionsIdToNameMap });
		assert.strictEqual(result, 'implements Interface1 & Interface2');
	});

	it('should ignore interfaces that are not in the definitionsIdToNameMap', () => {
		const interfaces = [{ interface: '1' }, { interface: '2' }];
		const definitionsIdToNameMap = { '1': 'Interface1' };
		const result = getImplementsInterfacesStatement({ interfaces, definitionsIdToNameMap });
		assert.strictEqual(result, 'implements Interface1');
	});
});
