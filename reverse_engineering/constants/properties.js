/**
 * @import {ArgumentValueFormat, DirectiveFormats} from '../../shared/types/types'
 */

/**
 * @type {{ structured: 'Structured'; raw: 'Raw' }}
 * @readonly
 */
const DIRECTIVE_FORMAT = {
	structured: 'Structured',
	raw: 'Raw',
};

/**
 * @type {{ raw: ArgumentValueFormat }}
 * @readonly
 */
const ARGUMENT_VALUE_FORMAT = {
	raw: 'Raw',
};

module.exports = {
	DIRECTIVE_FORMAT,
	ARGUMENT_VALUE_FORMAT,
};
