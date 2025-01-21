const { describe, it } = require('node:test');
const assert = require('node:assert');
const { getDirectivesUsageStatement } = require('../../../forward_engineering/mappers/directives');

describe('getDirectivesUsageStatement', () => {
	it('should return an empty string when no directives are provided', () => {
		const result = getDirectivesUsageStatement({ directives: [] });
		assert.strictEqual(result, '');
	});

	it('should return a single directive when one directive is provided', () => {
		const directives = [{ directiveFormat: 'Raw', rawDirective: '@directive1' }];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@directive1');
	});

	it('should return multiple directives joined by a space', () => {
		const directives = [
			{ directiveFormat: 'Raw', rawDirective: '@directive1' },
			{ directiveFormat: 'Raw', rawDirective: '@directive2' },
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@directive1 @directive2');
	});

	it('should replace new lines in rawDirective with spaces', () => {
		const directives = [{ directiveFormat: 'Raw', rawDirective: '@directive1\nline2' }];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@directive1 line2');
	});

	it('should ignore directives that are not in Raw format', () => {
		const directives = [
			{ directiveFormat: 'NonRaw', rawDirective: '@directive1' },
			{ directiveFormat: 'Raw', rawDirective: '@directive2' },
		];
		const result = getDirectivesUsageStatement({ directives });
		assert.strictEqual(result, '@directive2');
	});
});
