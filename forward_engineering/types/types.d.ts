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

export type IdToNameMap = Record<string, string>;

// Object type definition
export type ObjectLikeTypeDefinitions = Record<string, ObjectLikeTypeDefinition>;

export type ObjectLikeTypeDefinition = {
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
	fieldDirectives?: DirectivePropertyData[]; // Directives for the field
	items?: ArrayItem | ArrayItem[]; // Items of the List type
	arguments?: Argument[]; // Arguments of the field
	default?: unknown; // Default value of the field
}

type ReferenceFieldData = {
	$ref: string; // Reference path to the type definition
	isActivated?: boolean; // If the field is activated
	refDescription?: string; // Description of the reference
	fieldDirectives?: DirectivePropertyData[]; // Directives for the field
	arguments?: Argument[]; // Arguments of the field
	default?: unknown; // Default value of the reference
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

// Directives
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

export type DirectiveDefinitions = Record<string, Directive>

export type DirectivePropertyData = {
	directiveFormat: 'Raw';
	rawDirective: string;
}

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

export type UnionDefinitions = Record<string, Union>

// Root types
export type RootTypeNamesParameter = {
	query: string;
	mutation: string;
	subscription: string;
}

export type ContainerData = {
	containerData: object[]; // container properties by tab
	jsonSchema: Record<string, string>; // JSON schemas of entities by entity ID
	entityData: Record<string, object[]>; // entity properties by entity ID
}
