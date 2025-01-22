export type FEStatement = {
	statement: string;
	description?: string;
	isActivated?: boolean;
	nestedStatements?: FEStatement[];
	useNestedStatementSigns?: boolean;
	nestedStatementsSeparator?: string;
	startNestedStatementsSign?: string;
	endNestedStatementsSign?: string;
};

export type DirectivePropertyData = {
	directiveFormat: 'Raw';
	rawDirective: string;
};

type ArgumentRequirements = '<Type>' | '<Type>!' | '[<Type>]' | '[<Type>]!' | '[<Type>!]' | '[<Type>!]!';

export type Argument = {
	id: string;
	type: string;
	name: string;
	default?: string;
	description?: string;
	directives?: DirectivePropertyData[];
	required?: ArgumentRequirements;
};

export type IdToNameMap = Record<string, string>;

export type DirectiveLocations = {
	GUID: string;
	argumentDefinition?: boolean;
	enum?: boolean;
	enumValue?: boolean;
	field?: boolean;
	fieldDefinition?: boolean;
	inputFieldDefinition?: boolean;
	inputObject?: boolean;
	interface?: boolean;
	mutation?: boolean;
	object?: boolean;
	query?: boolean;
	scalar?: boolean;
	schema?: boolean;
	subscription?: boolean;
	union?: boolean;
}

export type Directive = {
	GUID: string;
	type: 'directive';
	description?: string;
	additionalProperties?: boolean;
	comments?: string;
	ignore_z_value: boolean;
	isActivated?: boolean;
	schemaType: string;
	directiveLocations?: DirectiveLocations;
	arguments?: Argument[];
}

export type DirectivesSchema = Record<string, Directive>
