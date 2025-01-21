export type FEStatement = {
	statement: string;
	description?: string;
	isActivated?: boolean;
	nestedStatements?: FEStatement[];
	useCNestedStatementSigns?: boolean;
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
