const { describe, it } = require('node:test');
const assert = require('node:assert');
const { getDirectivesUsageStatement } = require('../../../forward_engineering/mappers/directiveUsageStatements');

describe('getDirectivesUsageStatement', () => {
	it('should return empty string for empty directives array', () => {
		const result = getDirectivesUsageStatement({ directives: [] });
		assert.strictEqual(result, '');
	});

	it('should return empty string for undefined directives', () => {
		const result = getDirectivesUsageStatement({});
		assert.strictEqual(result, '');
	});

	it('should format single directive without arguments', () => {
		const directives = [
			{
				directiveName: 'test',
				argumentValueFormat: 'Raw',
				rawArgumentValues: '',
			},
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@test');
	});

	it('should format single directive with arguments', () => {
		const directives = [
			{
				directiveName: 'test',
				argumentValueFormat: 'Raw',
				rawArgumentValues: 'key: "value"',
			},
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@test(key: "value")');
	});

	it('should join multiple directives with spaces', () => {
		const directives = [
			{
				directiveName: 'first',
				argumentValueFormat: 'Raw',
				rawArgumentValues: '',
			},
			{
				directiveName: 'second',
				argumentValueFormat: 'Raw',
				rawArgumentValues: 'x: 123',
			},
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@first @second(x: 123)');
	});

	it('should resolve directive names from definitionsIdToNameMap', () => {
		const directives = [
			{
				directiveName: 'directiveId',
				argumentValueFormat: 'Raw',
				rawArgumentValues: '',
			},
		];
		const definitionsIdToNameMap = {
			'directiveId': 'resolvedName',
		};
		const result = getDirectivesUsageStatement({
			directives,
			definitionsIdToNameMap,
		});
		assert.strictEqual(result, '@resolvedName');
	});

	it('should skip invalid UUID directives', () => {
		const directives = [
			{
				directiveName: '123e4567-e89b-12d3-a456-426614174000',
				argumentValueFormat: 'Raw',
				rawArgumentValues: '',
			},
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '');
	});

	it('should preserve existing @ prefix in directive names', () => {
		const directives = [
			{
				directiveName: '@existing',
				argumentValueFormat: 'Raw',
				rawArgumentValues: '',
			},
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@existing');
	});

	it('should handle multiline arguments', () => {
		const directives = [
			{
				directiveName: 'test',
				argumentValueFormat: 'Raw',
				rawArgumentValues: 'arg1: "value1"\narg2: "value2"',
			},
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@test(arg1: "value1" arg2: "value2")');
	});

	it('should preserve existing parentheses in arguments', () => {
		const directives = [
			{
				directiveName: 'test',
				argumentValueFormat: 'Raw',
				rawArgumentValues: '(arg: 123)',
			},
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@test(arg: 123)');
	});
});
