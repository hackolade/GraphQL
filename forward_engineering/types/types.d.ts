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
}

// Object type definition
export type ObjectTypeDefinitions = Record<string, ObjectTypeDefinition>;

export type ObjectTypeDefinition = {
	description?: string; // Description of the object type
	isActivated?: boolean; // If the object type is activated
	implementsInterfaces?: ImplementsInterface[]; // Interfaces that the object type implements
	typeDirectives?: DirectivePropertyData[]; // Directives for the type
	properties: Record<string, FieldData>; // Properties of the object type
}

// Field data type
export type FieldData = RegularFieldData | ReferenceFieldData; 

type RegularFieldData = {
	type: string; // Type of the field
	isActivated?: boolean; // If the field is activated
	description?: string; // Description of the field
	typeDirectives?: DirectivePropertyData[]; // Directives for the type
	items?: ArrayItem | ArrayItem[]; // Items of the List type
	arguments?: Argument[]; // Arguments of the field
}

type ReferenceFieldData = {
	$ref: string; // Reference path to the type definition
	isActivated?: boolean; // If the field is activated
	refDescription?: string; // Description of the reference
	typeDirectives?: DirectivePropertyData[]; // Directives for the type
	arguments?: Argument[]; // Arguments of the field
}

export type ArrayItem = FieldData & {
	required?: boolean; // If the array item is required
};

// Field arguments
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

export type ImplementsInterface = {
	interface: string; // ID of the interface
};

// Unions
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
