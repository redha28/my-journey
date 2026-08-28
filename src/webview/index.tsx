import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';
import { JourneyItem } from '../types/journey';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Mock message dispatcher for browser preview environment
  if (typeof (window as any).acquireVsCodeApi !== 'function') {
    window.addEventListener('load', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const mockItems: JourneyItem[] = [
        {
          id: 'demo-1',
          date: today,
          title: 'Implement interactive calendar & weekly bar chart view',
          category: 'feature',
          mrUrl: 'https://gitlab.com/org/project/-/merge_requests/42',
          mrTitle: 'feat: add timeline calendar & analytics',
          mrStatus: 'in_review',
          branchName: 'feature/timeline-calendar',
          repoName: 'my-journey',
          notes: 'Built React webview with Recharts analytics and VS Code Git integration.',
          durationMinutes: 120,
          completed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'demo-2',
          date: today,
          title: 'Fix date selector timezone offset bug',
          category: 'bugfix',
          mrUrl: 'https://gitlab.com/org/project/-/merge_requests/43',
          mrStatus: 'merged',
          branchName: 'fix/date-timezone-offset',
          repoName: 'my-journey',
          notes: 'Fixed Monday-indexed ISO calendar start day calculation.',
          durationMinutes: 45,
          completed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'demo-3',
          date: yesterday,
          title: 'Refactor storage service to support local .myjourney JSON storage',
          category: 'refactor',
          mrUrl: 'https://gitlab.com/org/project/-/merge_requests/40',
          mrStatus: 'merged',
          branchName: 'refactor/local-storage',
          repoName: 'my-journey',
          notes: 'Persist state locally in project workspace.',
          durationMinutes: 90,
          completed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setTimeout(() => {
        window.postMessage(
          {
            type: 'INIT_DATA',
            payload: {
              items: mockItems,
              gitInfo: {
                branch: 'feature/my-journey-v1',
                repoName: 'my-journey',
                remoteUrl: 'https://github.com/dhaa/my-journey.git'
              }
            }
          },
          '*'
        );
      }, 200);
    });
  }
}
