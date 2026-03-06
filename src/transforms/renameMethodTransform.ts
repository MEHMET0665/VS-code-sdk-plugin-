import { SourceFile, SyntaxKind } from 'ts-morph';

export interface RenameMethodTransformConfig {
  legacyMethod: string;
  newMethod: string;
}

/**
 * Simple AST transform that renames method calls from legacyMethod to newMethod.
 *
 * Example:
 *   client.oldMethod(arg1, arg2);
 * becomes:
 *   client.newMethod(arg1, arg2);
 */
export function applyRenameMethodTransform(
  sourceFile: SourceFile,
  config: RenameMethodTransformConfig
): number {
  let changes = 0;

  const callExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  );

  for (const callExpr of callExpressions) {
    const expression = callExpr.getExpression();

    if (
      expression &&
      expression.getKindName &&
      expression.getKindName() === 'PropertyAccessExpression'
    ) {
      const nameNode = (expression as any).getNameNode();
      if (nameNode && nameNode.getText() === config.legacyMethod) {
        nameNode.replaceWithText(config.newMethod);
        changes++;
      }
    }
  }

  return changes;
}


