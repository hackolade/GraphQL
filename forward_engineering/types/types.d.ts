export type FEStatement = {
	statement: string;
	description: string;
	isActivated?: boolean;
	nestedStatements?: FEStatement[];
	useCurlyBracketsForNestedStatements?: boolean;
}

export type DirectivePropertyData = {
	directiveFormat: 'Raw',
	rawDirective: string;
}

// Object type definition
export type ObjectTypeDefinition = {
	description?: string; // Description of the object type
	isActivated?: boolean; // If the object type is activated
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
}

type ReferenceFieldData = {
	$ref: string; // Reference path to the type definition
	isActivated?: boolean; // If the field is activated
	refDescription?: string; // Description of the reference
	typeDirectives?: DirectivePropertyData[]; // Directives for the type
}

export type ArrayItem = FieldData & {
	required?: boolean; // If the array item is required
};
