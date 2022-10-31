import ts from 'typescript';

const isLiteral = (type: ts.Type): type is ts.LiteralType =>
  type.isLiteral() || !!(type.flags & ts.TypeFlags.BigIntLiteral);

const isStringLiteral = (type: ts.Type): type is ts.StringLiteralType => type.isStringLiteral();

const isNumberLiteral = (type: ts.Type): type is ts.NumberLiteralType => type.isNumberLiteral();

const isBigIntLiteral = (type: ts.Type): type is ts.BigIntLiteralType => !!(type.flags & ts.TypeFlags.BigIntLiteral);

const isTrueKeyword = (typeNode: ts.TypeNode | undefined): boolean => typeNode?.kind === ts.SyntaxKind.TrueKeyword;

const isFalseKeyword = (typeNode: ts.TypeNode | undefined): boolean => typeNode?.kind === ts.SyntaxKind.FalseKeyword;

const isBoolean = (type: ts.Type): boolean => !!(type.flags & ts.TypeFlags.BooleanLiteral);

const isNull = (type: ts.Type): boolean => !!(type.flags & ts.TypeFlags.Null);

const isUndefined = (type: ts.Type): boolean =>
  !!(type.flags & ts.TypeFlags.Undefined || type.flags & ts.TypeFlags.Void);

export const getPossibleValues = (
  factory: ts.NodeFactory,
  typeChecker: ts.TypeChecker,
  scope: ts.TypeNode,
  type: ts.Type = typeChecker.getTypeFromTypeNode(scope),
): ts.Expression[] => {
  const typeNode = typeChecker.typeToTypeNode(type, scope, undefined);

  switch (true) {
    // Literal types
    case isLiteral(type) && (type as ts.LiteralType).value === undefined:
      const typeName = typeChecker.typeToString(type, scope);
      throw new Error('Could not find value for a literal type ' + typeName);

    case isStringLiteral(type):
      return [factory.createStringLiteral((type as ts.StringLiteralType).value)];

    case isNumberLiteral(type):
      return [factory.createNumericLiteral((type as ts.NumberLiteralType).value)];

    case isBigIntLiteral(type):
      return [factory.createBigIntLiteral((type as ts.BigIntLiteralType).value)];

    // Null
    case isNull(type):
      return [factory.createNull()];

    // Boolean
    case isBoolean(type):
      return [factory.createTrue(), factory.createFalse()];

    // Undefined, Void
    case isUndefined(type):
      return [factory.createIdentifier('undefined')];

    // Union types
    case type.isUnion(): {
      const possibleValues = new Set(
        (type as ts.UnionType).types
          .map((unionType) => getPossibleValues(factory, typeChecker, scope, unionType))
          .reduce((all, one) => [...all, ...one])
          .filter((literal, index, all) => {
            const isBool = [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].includes(literal.kind);
            if (!isBool) {
              return true;
            }
            const found = index === all.findIndex((t) => t.kind === literal.kind);
            return !found;
          }),
      );
      return Array.from(possibleValues);
    }

    // true
    case typeNode && isTrueKeyword(typeNode):
      return [factory.createTrue()];

    // false
    case typeNode && isFalseKeyword(typeNode):
      return [factory.createFalse()];

    default:
      return [];
  }
};

export const createValuesOf = (
  factory: ts.NodeFactory,
  typeChecker: ts.TypeChecker,
  typeNode: ts.TypeNode,
): ts.Expression => {
  return factory.createArrayLiteralExpression(getPossibleValues(factory, typeChecker, typeNode));
};
