import { SourceFile } from 'ts-morph';

export interface ImportTransformConfig {
  legacyModule: string;
  newModule: string;
}

/**
 * Simple AST transform that rewrites imports from a legacy SDK module
 * to a new SDK module, preserving imported bindings.
 *
 * Example:
 *   import { Client } from 'legacy-sdk';
 * becomes:
 *   import { Client } from 'new-sdk';
 */
export function applyImportTransform(
  sourceFile: SourceFile,
  config: ImportTransformConfig
): number {
  let changes = 0;

  const imports = sourceFile.getImportDeclarations();
  for (const imp of imports) {
    const moduleSpecifierValue = imp.getModuleSpecifierValue();
    if (moduleSpecifierValue === config.legacyModule) {
      imp.setModuleSpecifier(config.newModule);
      changes++;
    }
  }

  return changes;
}


