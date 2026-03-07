## SDK Migrator VS Code Extension

This extension automates migration from a **legacy SDK** to a **new SDK** in JavaScript/TypeScript projects.

### Features

- **Command**: `SDK Migrator: Run Migration` (`sdkMigrator.runMigration`)
- **AST transforms** (via `ts-morph`):
  - Import rewrite from `legacy-sdk` → `new-sdk`
  - Method call rename from `oldMethod` → `newMethod`
- **React webview dashboard**:
  - Shows number of files touched, import changes, and method renames
  - Lets you **Apply** the migration (writes changes to disk)
  - Placeholder button to **Ask LLM for edge cases**

### Getting started

1. Install dependencies:

```bash
cd "C:\...VS-code-sdk-plugin-"
npm install
```

2. Build the webview bundle:

```bash
npm run build-webview
```

3. Compile the extension:

```bash
npm run compile
```

4. Open this folder in VS Code and press **F5** to launch the Extension Development Host.

5. In the host window, run the command palette: **SDK Migrator: Run Migration**.

> Note: The default legacy/new identifiers (`legacy-sdk` → `new-sdk`, `oldMethod` → `newMethod`) are hard-coded in `src/extension.ts` for now. Adjust them to match your real SDK names.
