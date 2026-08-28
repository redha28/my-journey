/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/webview/**/*.{js,ts,jsx,tsx,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vscode: {
          bg: 'var(--vscode-editor-background, #1e1e1e)',
          fg: 'var(--vscode-editor-foreground, #d4d4d4)',
          sidebarBg: 'var(--vscode-sideBar-background, #252526)',
          cardBg: 'var(--vscode-editorWidget-background, #252526)',
          border: 'var(--vscode-widget-border, rgba(255, 255, 255, 0.1))',
          accent: 'var(--vscode-focusBorder, #007acc)',
          inputBg: 'var(--vscode-input-background, #3c3c3c)',
          inputFg: 'var(--vscode-input-foreground, #cccccc)',
          btnBg: 'var(--vscode-button-background, #0e639c)',
          btnFg: 'var(--vscode-button-foreground, #ffffff)',
          btnHover: 'var(--vscode-button-hoverBackground, #1177bb)',
        }
      }
    },
  },
  plugins: [],
}
