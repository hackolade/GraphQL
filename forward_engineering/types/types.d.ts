export type FEStatement = {
	statement: string;
	description: string;
	isActivated?: boolean;
	nestedStatements?: FEStatement[];
	useCurlyBracketsForNestedStatements?: boolean;
}
