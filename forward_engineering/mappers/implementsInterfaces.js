/**
 * @import {IdToNameMap, ImplementsInterface} from "../../shared/types/types"
 */

/**
 * Get implements interfaces statement
 *
 * @param {object} param0
 * @param {ImplementsInterface[]} [param0.interfaces] - The interfaces to implement.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {string} - The implements interfaces statement.
 */
function getImplementsInterfacesStatement({ interfaces = [], definitionsIdToNameMap }) {
	const implementedInterfacesList = getImplementedInterfacesList({ interfaces, definitionsIdToNameMap });
	if (!implementedInterfacesList.length) {
		return '';
	}
	const implementedInterfacesStatement = `implements ${implementedInterfacesList.join(' & ')}`;
	return implementedInterfacesStatement;
}

/**
 * Get implemented interfaces list
 *
 * @param {object} param0
 * @param {ImplementsInterface[]} param0.interfaces - The interfaces to implement.
 * @param {IdToNameMap} param0.definitionsIdToNameMap - The definitions id to name map.
 * @returns {string[]} - The implemented interfaces list.
 */
function getImplementedInterfacesList({ interfaces, definitionsIdToNameMap }) {
	return interfaces.map(interfaceData => definitionsIdToNameMap[interfaceData.interface]).filter(Boolean);
}

module.exports = {
	getImplementsInterfacesStatement,
};
