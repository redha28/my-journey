import * as vscode from 'vscode';
import { JourneyWebviewProvider } from './providers/JourneyWebviewProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('Activating My Journey extension for Antigravity IDE...');

  const provider = new JourneyWebviewProvider(context);

  // Register Webview View Provider for Sidebar
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(JourneyWebviewProvider.viewType, provider, {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    })
  );

  // Register Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('myJourney.openDashboard', () => {
      provider.openFullDashboard();
    }),
    vscode.commands.registerCommand('myJourney.newEntry', () => {
      provider.triggerNewEntry();
    }),
    vscode.commands.registerCommand('myJourney.exportStandup', () => {
      provider.triggerExportStandup();
    }),
    vscode.commands.registerCommand('myJourney.refresh', () => {
      provider.refresh();
      vscode.window.showInformationMessage('My Journey data refreshed.');
    })
  );
}

export function deactivate() {
  console.log('Deactivating My Journey extension.');
}
