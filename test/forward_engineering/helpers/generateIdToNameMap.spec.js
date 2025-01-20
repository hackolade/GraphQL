const { describe, it } = require('node:test');
const { deepStrictEqual } = require('node:assert');
const { generateIdToNameMap } = require('../../../forward_engineering/helpers/generateIdToNameMap');

describe('generateIdToNameMap', () => {
	it('should return an empty map for an empty or undefined schema', () => {
		const result = generateIdToNameMap({});
		deepStrictEqual(result, {});
	});

	it('should return an empty map for an undefined schema', () => {
		const result = generateIdToNameMap();
		deepStrictEqual(result, {});
	});

	it('should map GUIDs to names for a simple schema', () => {
		const schema = {
			Entity1: { GUID: '123' },
			Entity2: { GUID: '456' },
		};
		const expected = {
			'123': 'Entity1',
			'456': 'Entity2',
		};
		const result = generateIdToNameMap(schema);
		deepStrictEqual(result, expected);
	});

	it('should ignore system names', () => {
		const schema = {
			Scalars: { GUID: '123', properties: {} },
			Entity1: { GUID: '456', properties: {} },
		};
		const expected = {
			'456': 'Entity1',
		};
		const result = generateIdToNameMap(schema);
		deepStrictEqual(result, expected);
	});

	it('should handle nested properties', () => {
		const schema = {
			Entity1: {
				GUID: '123',
				properties: {
					SubEntity1: {
						GUID: '456',
					},
				},
			},
		};
		const expected = {
			'123': 'Entity1',
			'456': 'SubEntity1',
		};
		const result = generateIdToNameMap(schema);
		deepStrictEqual(result, expected);
	});

	it('should handle complex nested properties inside system name', () => {
		const schema = {
			Scalars: {
				GUID: '123',
				properties: {
					SubEntity1: {
						GUID: '456',
						properties: {
							SubSubEntity1: { GUID: '789', properties: {} },
						},
					},
				},
			},
		};
		const expected = {
			'456': 'SubEntity1',
			'789': 'SubSubEntity1',
		};
		const result = generateIdToNameMap(schema);
		deepStrictEqual(result, expected);
	});
});
