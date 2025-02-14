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
				directiveFormat: 'Structured',
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
				directiveFormat: 'Structured',
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
				directiveFormat: 'Structured',
				directiveName: 'first',
				argumentValueFormat: 'Raw',
				rawArgumentValues: '',
			},
			{
				directiveFormat: 'Structured',
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
				directiveFormat: 'Structured',
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
				directiveFormat: 'Structured',
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
				directiveFormat: 'Structured',
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
				directiveFormat: 'Structured',
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
				directiveFormat: 'Structured',
				directiveName: 'test',
				argumentValueFormat: 'Raw',
				rawArgumentValues: '(arg: 123)',
			},
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@test(arg: 123)');
	});

	it('should handle raw directive format', () => {
		const directives = [
			{
				directiveFormat: 'Raw',
				rawDirective: '@custom(arg: "value")',
			},
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@custom(arg: "value")');
	});

	it('should handle multiline raw directive', () => {
		const directives = [
			{
				directiveFormat: 'Raw',
				rawDirective: '@custom(\n  arg1: "value1",\n  arg2: "value2"\n)',
			},
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@custom(   arg1: "value1",   arg2: "value2" )');
	});

	it('should handle multiple raw directives', () => {
		const directives = [
			{
				directiveFormat: 'Raw',
				rawDirective: '@first',
			},
			{
				directiveFormat: 'Raw',
				rawDirective: '@second(x: 123)',
			},
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@first @second(x: 123)');
	});

	it('should handle mix of raw and structured directives', () => {
		const directives = [
			{
				directiveFormat: 'Raw',
				rawDirective: '@raw(x: 1)',
			},
			{
				directiveFormat: 'Structured',
				directiveName: 'structured',
				argumentValueFormat: 'Raw',
				rawArgumentValues: 'y: 2',
			},
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@raw(x: 1) @structured(y: 2)');
	});

	it('should return empty string for invalid raw directive', () => {
		const directives = [
			{
				directiveFormat: 'Raw',
				rawDirective: null,
			},
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '');
	});
});
