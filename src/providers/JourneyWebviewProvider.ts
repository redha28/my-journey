import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { StorageService } from '../services/StorageService';
import { GitService } from '../services/GitService';
import { ExcelService } from '../services/ExcelService';
import { ExtensionMessage, WebviewMessage } from '../types/journey';

export class JourneyWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'myJourney.mainView';
  private _view?: vscode.WebviewView;
  private _panel?: vscode.WebviewPanel;
  private _storageService: StorageService;
  private _extensionUri: vscode.Uri;

  constructor(private readonly context: vscode.ExtensionContext) {
    this._extensionUri = context.extensionUri;
    this._storageService = new StorageService(context);
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri,
        vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview')
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    this._setWebviewMessageListener(webviewView.webview);
  }

  public openFullDashboard() {
    if (this._panel) {
      this._panel.reveal(vscode.ViewColumn.One);
      return;
    }

    this._panel = vscode.window.createWebviewPanel(
      'myJourney.fullDashboard',
      'My Journey - Dashboard',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          this._extensionUri,
          vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview')
        ]
      }
    );

    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
    this._setWebviewMessageListener(this._panel.webview);

    this._panel.onDidDispose(() => {
      this._panel = undefined;
    }, null, this.context.subscriptions);
  }

  public triggerNewEntry() {
    this._postMessage({ type: 'TRIGGER_NEW_ENTRY' });
  }

  public triggerExportStandup() {
    this._postMessage({ type: 'TRIGGER_EXPORT_STANDUP' });
  }

  public async refresh() {
    const db = await this._storageService.getDatabase();
    const gitInfo = await GitService.getCurrentGitInfo();
    this._postMessage({
      type: 'INIT_DATA',
      payload: { items: db.items, gitInfo }
    });
  }

  private _postMessage(message: WebviewMessage) {
    if (this._view && this._view.visible) {
      this._view.webview.postMessage(message);
    }
    if (this._panel) {
      this._panel.webview.postMessage(message);
    }
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      async (message: ExtensionMessage) => {
        try {
          switch (message.command) {
            case 'READY':
            case 'FETCH_DATA': {
              const db = await this._storageService.getDatabase();
              const gitInfo = await GitService.getCurrentGitInfo();
              webview.postMessage({
                type: 'INIT_DATA',
                payload: { items: db.items, profile: db.profile, gitInfo }
              } as WebviewMessage);
              break;
            }

            case 'SAVE_PROFILE': {
              const updatedProfile = await this._storageService.saveProfile(message.payload);
              this._postMessage({
                type: 'PROFILE_UPDATED',
                payload: updatedProfile
              });
              vscode.window.showInformationMessage('Profil Timesheet berhasil disimpan!');
              break;
            }

            case 'GET_GIT_INFO': {
              const gitInfo = await GitService.getCurrentGitInfo();
              webview.postMessage({
                type: 'GIT_INFO',
                payload: gitInfo
              } as WebviewMessage);
              break;
            }

            case 'ADD_ITEM': {
              const newItem = await this._storageService.addItem(message.payload);
              this._postMessage({
                type: 'ITEM_ADDED',
                payload: newItem
              });
              vscode.window.showInformationMessage(`Logged: "${newItem.title}"`);
              break;
            }

            case 'UPDATE_ITEM': {
              const updated = await this._storageService.updateItem(message.payload);
              this._postMessage({
                type: 'ITEM_UPDATED',
                payload: updated
              });
              break;
            }

            case 'DELETE_ITEM': {
              const deleted = await this._storageService.deleteItem(message.payload.id);
              if (deleted) {
                this._postMessage({
                  type: 'ITEM_DELETED',
                  payload: { id: message.payload.id }
                });
                vscode.window.showInformationMessage('Task deleted.');
              }
              break;
            }

            case 'OPEN_EXTERNAL_URL': {
              if (message.payload.url) {
                vscode.env.openExternal(vscode.Uri.parse(message.payload.url));
              }
              break;
            }

            case 'COPY_TO_CLIPBOARD': {
              await vscode.env.clipboard.writeText(message.payload.text);
              const label = message.payload.label || 'Copied to clipboard!';
              vscode.window.showInformationMessage(`📋 ${label}`);
              break;
            }

            case 'EXPORT_EXCEL': {
              const db = await this._storageService.getDatabase();
              const itemsToExport = message.payload?.items || db.items;
              const profileToUse = message.payload?.profile || db.profile;
              await ExcelService.exportTimesheetExcel(itemsToExport, profileToUse, message.payload?.selectedMonth);
              break;
            }

            case 'SHOW_MESSAGE': {
              const { message: msg, level } = message.payload;
              if (level === 'error') {
                vscode.window.showErrorMessage(msg);
              } else if (level === 'warn') {
                vscode.window.showWarningMessage(msg);
              } else {
                vscode.window.showInformationMessage(msg);
              }
              break;
            }
          }
        } catch (err: any) {
          console.error('Error handling webview message:', err);
          vscode.window.showErrorMessage(`My Journey Error: ${err.message || err}`);
        }
      },
      undefined,
      this.context.subscriptions
    );
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const webviewDist = path.join(this._extensionUri.fsPath, 'dist', 'webview');
    const assetsDir = path.join(webviewDist, 'assets');

    let jsFile = 'index.js';
    let cssFile = 'index.css';

    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      const foundJs = files.find(f => f.endsWith('.js'));
      const foundCss = files.find(f => f.endsWith('.css'));
      if (foundJs) jsFile = foundJs;
      if (foundCss) cssFile = foundCss;
    }

    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'assets', jsFile));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'assets', cssFile));

    const nonce = getNonce();

    return /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline' https://fonts.googleapis.com; font-src ${webview.cspSource} https://fonts.gstatic.com; img-src ${webview.cspSource} https: data:; script-src 'nonce-${nonce}';">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" type="text/css" href="${styleUri}" />
  <title>My Journey</title>
</head>
<body class="bg-vscode-bg text-vscode-fg antialiased selection:bg-blue-500 selection:text-white">
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
