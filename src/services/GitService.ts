import * as vscode from 'vscode';
import { GitInfo } from '../types/journey';

export class GitService {
  public static async getCurrentGitInfo(): Promise<GitInfo> {
    const gitInfo: GitInfo = {};

    try {
      const gitExtension = vscode.extensions.getExtension('vscode.git');
      if (gitExtension) {
        const git = gitExtension.isActive ? gitExtension.exports.getAPI(1) : (await gitExtension.activate()).getAPI(1);
        if (git && git.repositories && git.repositories.length > 0) {
          const repo = git.repositories[0];
          if (repo.state && repo.state.HEAD) {
            gitInfo.branch = repo.state.HEAD.name;
          }
        }
      }
    } catch (err) {
      console.warn('Could not read Git information:', err);
    }

    if (!gitInfo.repoName && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
      gitInfo.repoName = vscode.workspace.workspaceFolders[0].name;
    }

    return gitInfo;
  }

  // Extract Jira Issue Key from branch name (e.g. "feature/MAP-102-fix" -> "MAP-102")
  public static extractJiraKey(text?: string): string {
    if (!text) return '';
    const match = text.match(/([A-Z]{2,10}-\d+)/i);
    return match ? match[1].toUpperCase() : '';
  }
}
