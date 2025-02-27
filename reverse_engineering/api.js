/**
 * @import { FileREData, REFromFileCallback } from "./types/types"
 */

const { getFileName } = require('./helpers/getFileName');
const { parseSchema } = require('./helpers/parseSchema');
const { readFileContent } = require('./helpers/readFileContent');
const { getMappedSchema } = require('./mappers/schema');

module.exports = {
	/**
	 * RE a GraphQL schema file and returns the mapped schema
	 * @param {FileREData} data
	 * @param {Logger} logger
	 * @param {REFromFileCallback} callback
	 */
	async reFromFile(data, logger, callback) {
		try {
			const fileContent = await readFileContent({ filePath: data.filePath });
			const fileName = getFileName(data.filePath);
			const { parsedSchema, validationErrors } = parseSchema({ schemaContent: fileContent }); // TODO: validation warnings can be returned in modelData
			const mappedEntities = getMappedSchema({
				schemaItems: parsedSchema.definitions,
				graphName: fileName,
				logger,
			});

			callback(null, mappedEntities, {}, [], 'multipleSchema');
		} catch (error) {
			logger.log('error', error, 'Failed to read GraphQL schema file');
			callback(error);
		}
	},
};
