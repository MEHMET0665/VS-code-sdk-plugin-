import * as vscode from 'vscode';
import { Project } from 'ts-morph';
import { applyImportTransform } from './transforms/importTransform';
import { applyRenameMethodTransform } from './transforms/renameMethodTransform';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'sdkMigrator.runMigration',
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('Open a workspace folder to run SDK migration.');
        return;
      }

      const rootPath = workspaceFolders[0].uri.fsPath;

      // Configure ts-morph project
      const project = new Project({
        tsConfigFilePath: vscode.Uri.joinPath(
          workspaceFolders[0].uri,
          'tsconfig.json'
        ).fsPath,
        skipAddingFilesFromTsConfig: false
      });

      const sourceFiles = project.getSourceFiles([
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx'
      ]);

      const report: {
        filePath: string;
        importChanges: number;
        methodChanges: number;
      }[] = [];

      for (const sf of sourceFiles) {
        const importChanges = applyImportTransform(sf, {
          legacyModule: 'legacy-sdk',
          newModule: 'new-sdk'
        });

        const methodChanges = applyRenameMethodTransform(sf, {
          legacyMethod: 'oldMethod',
          newMethod: 'newMethod'
        });

        if (importChanges > 0 || methodChanges > 0) {
          report.push({
            filePath: sf.getFilePath(),
            importChanges,
            methodChanges
          });
        }
      }

      // For demo purposes, skip writing and show report in webview
      // In a real extension, you would probably show a diff and then save on confirm

      const panel = vscode.window.createWebviewPanel(
        'sdkMigratorDashboard',
        'SDK Migrator Dashboard',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
        }
      );

      const scriptUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'media', 'dashboard.js')
      );

      const nonce = getNonce();

      panel.webview.html = getWebviewHtml(scriptUri.toString(), nonce, report);

      panel.webview.onDidReceiveMessage(
        async (message) => {
          switch (message.type) {
            case 'confirmApply':
              await project.save();
              vscode.window.showInformationMessage('SDK migration applied.');
              break;
            case 'requestDetails':
              // Placeholder: Here you could trigger LLM-assisted suggestions
              vscode.window.showInformationMessage(
                'LLM-assisted suggestions are not implemented in this demo.'
              );
              break;
          }
        },
        undefined,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  // no-op
}

function getWebviewHtml(
  scriptSrc: string,
  nonce: string,
  report: {
    filePath: string;
    importChanges: number;
    methodChanges: number;
  }[]
): string {
  const initialData = JSON.stringify(report);

  return /* html */ `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SDK Migrator</title>
  </head>
  <body>
    <div id="root"></div>
    <script nonce="${nonce}">
      window.__MIGRATION_REPORT__ = ${initialData};
    </script>
    <script nonce="${nonce}" src="${scriptSrc}"></script>
  </body>
</html>`;
}

function getNonce() {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


