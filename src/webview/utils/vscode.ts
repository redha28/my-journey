import { ExtensionMessage } from '../types/journey';

declare global {
  function acquireVsCodeApi(): {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
  };
}

class VSCodeAPIWrapper {
  private vscodeApi: ReturnType<typeof acquireVsCodeApi> | null = null;

  constructor() {
    if (typeof acquireVsCodeApi === 'function') {
      try {
        this.vscodeApi = acquireVsCodeApi();
      } catch (e) {
        console.warn('VS Code API already acquired or running in browser mode:', e);
      }
    }
  }

  public postMessage(message: ExtensionMessage) {
    if (this.vscodeApi) {
      this.vscodeApi.postMessage(message);
    } else {
      console.log('[Browser Dev PostMessage]:', message);
    }
  }

  public getState<T>(): T | null {
    if (this.vscodeApi) {
      return this.vscodeApi.getState() as T;
    }
    return null;
  }

  public setState<T>(state: T) {
    if (this.vscodeApi) {
      this.vscodeApi.setState(state);
    }
  }
}

export const vscode = new VSCodeAPIWrapper();
