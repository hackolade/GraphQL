const { describe, it } = require('node:test');
const { strictEqual } = require('node:assert');
const { getSchemaVersionHeader } = require('../../../forward_engineering/mappers/schemaVersionHeader');

describe('getSchemaVersionHeader', () => {
	it('should return header with schema version and generation date', () => {
		const schemaVersion = '1.0.0';
		const result = getSchemaVersionHeader({ schemaVersion });
		const localDate = new Date().toLocaleString();
		strictEqual(result.statement.includes(`Schema Version: ${schemaVersion}`), true);
		strictEqual(result.statement.includes(`Generated on: ${localDate.split(',')[0]}`), true);
		strictEqual(result.isActivated, false);
	});

	it('should return header with only generation date if schema version is empty', () => {
		const schemaVersion = ' ';
		const result = getSchemaVersionHeader({ schemaVersion });
		const localDate = new Date().toLocaleString();
		strictEqual(result.statement.includes('Schema Version:'), false);
		strictEqual(result.statement.includes(`Generated on: ${localDate.split(',')[0]}`), true);
		strictEqual(result.isActivated, false);
	});

	it('should return header with only generation date if schema version is not provided', () => {
		const result = getSchemaVersionHeader({});
		const localDate = new Date().toLocaleString();
		strictEqual(result.statement.includes('Schema Version:'), false);
		strictEqual(result.statement.includes(`Generated on: ${localDate.split(',')[0]}`), true);
		strictEqual(result.isActivated, false);
	});
});
