import { PropertyDescriptor } from '../types';
import { PropertyFlag } from '../../types';
import { getPropertyAccessor } from './ast';
import ts from 'typescript';

const getPropertyFlags = (property: ts.Symbol): PropertyFlag => {
  let flags: PropertyFlag = 0;

  const declaration = property.valueDeclaration;
  if (
    declaration &&
    (ts.isPropertySignature(declaration) ||
      ts.isPropertyDeclaration(declaration) ||
      ts.isMethodDeclaration(declaration) ||
      ts.isMethodSignature(declaration) ||
      ts.isParameter(declaration) ||
      ts.isGetAccessor(declaration) ||
      ts.isSetAccessor(declaration))
  ) {
    flags = flags | (declaration.questionToken ? PropertyFlag.OPTIONAL : 0);

    declaration.modifiers?.forEach((modifier) => {
      switch (modifier.kind) {
        case ts.SyntaxKind.PrivateKeyword:
          flags = flags | PropertyFlag.PRIVATE;
          break;

        case ts.SyntaxKind.ProtectedKeyword:
          flags = flags | PropertyFlag.PROTECTED;
          break;

        case ts.SyntaxKind.PublicKeyword:
          flags = flags | PropertyFlag.PUBLIC;
          break;

        case ts.SyntaxKind.ReadonlyKeyword:
          flags = flags | PropertyFlag.READONLY;
          break;
      }
    });
  }

  if (!(flags & PropertyFlag.PRIVATE) && !(flags & PropertyFlag.PROTECTED)) {
    flags = flags | PropertyFlag.PUBLIC;
  }

  return flags;
};

const getEnumMembers = (factory: ts.NodeFactory, declaration: ts.EnumDeclaration): PropertyDescriptor[] => {
  return declaration.members.map((member: ts.EnumMember) => {
    if (member.name.kind === ts.SyntaxKind.PrivateIdentifier) throw new Error('Unexpected private identifier in enum');

    const name = ts.isComputedPropertyName(member.name)
      ? member.name.expression
      : factory.createStringLiteral(member.name.text);

    const flags = PropertyFlag.PUBLIC | PropertyFlag.READONLY;
    return { name, flags };
  });
};

export const getPropertyDescriptors = (
  factory: ts.NodeFactory,
  typeChecker: ts.TypeChecker,
  scope: ts.TypeNode,
  type: ts.Type = typeChecker.getTypeFromTypeNode(scope),
): PropertyDescriptor[] => {
  const declaration = type.symbol?.valueDeclaration;
  if (declaration && ts.isEnumDeclaration(declaration)) {
    return getEnumMembers(factory, declaration);
  }

  return type.getApparentProperties().map((property: ts.Symbol) => {
    const flags = getPropertyFlags(property);
    const name = getPropertyAccessor(factory, property, typeChecker, scope);

    return { flags, name };
  });
};

export const createPropertiesOf = (
  factory: ts.NodeFactory,
  typeChecker: ts.TypeChecker,
  typeNode: ts.TypeNode,
): ts.Expression =>
  factory.createArrayLiteralExpression(
    getPropertyDescriptors(factory, typeChecker, typeNode).map(({ name, flags }) =>
      factory.createObjectLiteralExpression([
        factory.createPropertyAssignment('name', name),
        factory.createPropertyAssignment('flags', factory.createNumericLiteral(flags)),
      ]),
    ),
  );
