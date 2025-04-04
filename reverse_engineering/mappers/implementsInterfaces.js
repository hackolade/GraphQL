/**
 * @import {NamedTypeNode} from "graphql"
 * @import {REImplementsInterface} from "../../shared/types/types"
 */

/**
 * Maps the implements interfaces
 *
 * @param {object} params
 * @param {NamedTypeNode[]} [params.implementsInterfaces] - The implements interfaces
 * @returns {REImplementsInterface[]} The mapped implements interfaces
 */
function mapImplementsInterfaces({ implementsInterfaces = [] }) {
	return implementsInterfaces.map(interfaceData => {
		return {
			interface: interfaceData.name.value,
		};
	});
}

module.exports = {
	mapImplementsInterfaces,
};
