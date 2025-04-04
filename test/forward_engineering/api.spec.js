const { describe, it } = require('node:test');
const fs = require('node:fs/promises');
const { promisify } = require('node:util');
const { strictEqual } = require('node:assert');
const { generateContainerScript } = require('../../forward_engineering/api');
const containerLevelShema = require('./containerLevelSchemaAsset');
const path = require('node:path');

const generateContainerScriptPromise = promisify(generateContainerScript);

const loggerMock = {
	log: () => {},
};

const deleteSchemaVersionAndDate = script => script.split('\n').slice(3).join('\n');

describe(() => {
	it('should generate valid GraphQL schema from provided containerLevelSchema', async () => {
		const result = await generateContainerScriptPromise(containerLevelShema, loggerMock);
		const rawSchema = (await fs.readFile(path.join(__dirname, './expectedSchema.graphql'))).toString();

		// remove schema version and date from the scripts to avoid differences
		const resultSchema = deleteSchemaVersionAndDate(result);
		const expectedSchema = deleteSchemaVersionAndDate(rawSchema);

		strictEqual(resultSchema, expectedSchema);
	});
});
