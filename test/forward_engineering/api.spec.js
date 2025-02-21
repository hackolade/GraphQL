/**
 * @import { Logger } from '../../types/types
 */

const { describe, it } = require('node:test');
const fs = require('node:fs/promises');
const { promisify } = require('node:util');
const { strictEqual } = require('node:assert');
const { generateContainerScript } = require('../../forward_engineering/api');
const containerLevelShema = require('./containerLevelSchemaAsset');
const path = require('node:path');

const generateContainerScriptPromise = promisify(generateContainerScript);

/**
 * @type {Logger}
 */
const loggerMock = {
	log: () => {},
};

describe(() => {
	it('should generate valid GraphQL schema from provided containerLevelSchema', async () => {
		const result = await generateContainerScriptPromise(containerLevelShema, loggerMock);
		const resultSchema = result.split('\n').slice(3).join('\n'); // Remove first 3 lines

		const expectedSchema = (await fs.readFile(path.join(__dirname, './expectedSchema.graphql'))).toString();
		strictEqual(resultSchema, expectedSchema);
	});
});
