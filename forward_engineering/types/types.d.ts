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

type UnionMemberType = {
	$ref: string;
	GUID: string;
	displayName: string;
	isActivated: boolean;
}

type OneOfMeta = {
	choice: string;
	index: number;
	isActivated: boolean;
}

export type Union = {
	type: 'union';
	GUID: string;
	description?: string;
	comments?: string;
	typeDirectives?: DirectivePropertyData[];
	additionalProperties: boolean;
	ignore_z_value: boolean;
	isActivated: boolean;
	oneOf: UnionMemberType[];
	oneOf_meta: OneOfMeta;
	schemaType: string;
	snippet: 'union';
}

export type UnionSchema = Record<string, Union>
