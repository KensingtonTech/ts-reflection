import ts from 'typescript';

export const createVariable = (
  factory: ts.NodeFactory,
  identifier: ts.Identifier,
  initializer: ts.Expression,
): ts.Statement =>
  factory.createVariableStatement(undefined, [
    factory.createVariableDeclaration(identifier, undefined, undefined, initializer),
  ]);

export const createImportStatement = (factory: ts.NodeFactory, namedImport: string, path: string): ts.Statement =>
  // from https://stackoverflow.com/questions/59693819/generate-import-statement-programmatically-using-typescript-compiler-api
  factory.createImportDeclaration(
    /* modifiers */ undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(false, undefined, factory.createIdentifier(namedImport)),
      ]),
    ),
    factory.createStringLiteral(path),
  );

export const createRequire = (
  factory: ts.NodeFactory,
  identifier: ts.Identifier,
  path: string,
  property = 'default',
): ts.Statement[] => [
  createVariable(
    factory,
    identifier,
    factory.createPropertyAccessExpression(
      factory.createCallExpression(factory.createIdentifier('require'), undefined, [factory.createStringLiteral(path)]),
      property,
    ),
  ),
];

export const createImport = (
  factory: ts.NodeFactory,
  identifier: ts.Identifier,
  path: string,
  property = 'default',
): ts.Statement[] => [
  createImportStatement(factory, property, path),
  factory.createVariableStatement(
    undefined,
    factory.createVariableDeclarationList(
      [factory.createVariableDeclaration(identifier, undefined, undefined, factory.createIdentifier(property))],
      ts.NodeFlags.None,
    ),
  ),
];
