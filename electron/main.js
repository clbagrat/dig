import { app, BrowserWindow, shell } from 'electron';

const TARGET_URL = 'http://134.199.190.212:3000/';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    autoHideMenuBar: true,
    backgroundColor: '#111111',
    title: 'Hide and Dig Deck Test',
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.loadURL(TARGET_URL).catch(() => {
    win.loadURL(
      `data:text/html,${encodeURIComponent(`
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>Hide and Dig Deck Test</title>
            <style>
              body {
                margin: 0;
                min-height: 100vh;
                display: grid;
                place-items: center;
                background: #111;
                color: #f2f2f2;
                font: 16px/1.5 sans-serif;
              }
              main {
                width: min(640px, calc(100vw - 48px));
              }
              code {
                background: rgba(255, 255, 255, 0.1);
                padding: 0.15rem 0.35rem;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <main>
              <h1>Connection failed</h1>
              <p>The desktop app could not open <code>${TARGET_URL}</code>.</p>
              <p>Check that the server is online and reachable from this device.</p>
            </main>
          </body>
        </html>
      `)}`
    );
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
