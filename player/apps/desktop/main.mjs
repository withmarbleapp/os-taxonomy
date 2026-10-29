import { app, BrowserWindow, session, dialog, Menu, shell } from 'electron';
import { createService } from '../local-service/server.mjs';
let service, window;
app.setName('Marble');
if (!app.requestSingleInstanceLock()) app.quit();
else
  app
    .whenReady()
    .then(async () => {
      // Do not await readiness at module scope: Electron must finish loading this
      // ESM entry before it can emit ready.
      if (process.platform !== 'darwin') Menu.setApplicationMenu(null);
      service = await createService({ dataDir: app.getPath('userData') });
      const trusted = (url) => {
        try {
          return (
            new URL(url).origin === service.origin && !new URL(url).pathname.startsWith('/content/')
          );
        } catch {
          return false;
        }
      };
      session.defaultSession.setPermissionRequestHandler(
        (contents, permission, callback, details) =>
          callback(
            permission === 'media' &&
              trusted(details.requestingUrl) &&
              details.isMainFrame &&
              (!details.mediaTypes || details.mediaTypes.every((t) => t === 'audio')),
          ),
      );
      session.defaultSession.setPermissionCheckHandler(
        (contents, permission, origin, details) =>
          permission === 'media' &&
          trusted(origin) &&
          details.isMainFrame !== false &&
          details.mediaType !== 'video',
      );
      const create = () => {
        window = new BrowserWindow({
          width: 1280,
          height: 900,
          minWidth: 700,
          minHeight: 650,
          backgroundColor: '#faf3df',
          title: 'Marble',
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true,
            webviewTag: false,
          },
        });
        const helpUrls = new Set([
          'https://ollama.com/download',
          'https://docs.ollama.com/quickstart',
          'https://lmstudio.ai/download',
          'https://lmstudio.ai/docs/developer/core/server',
          'https://code.claude.com/docs/en/setup',
          'https://developers.openai.com/codex/cli/',
        ]);
        window.webContents.setWindowOpenHandler(({ url }) => {
          if (helpUrls.has(url)) shell.openExternal(url).catch(console.error);
          return { action: 'deny' };
        });
        window.webContents.on('will-navigate', (e, url) => {
          if (!trusted(url)) e.preventDefault();
        });
        window.webContents.on('will-frame-navigate', (e) => {
          if (new URL(e.url).origin !== service.origin) e.preventDefault();
        });
        window.webContents.on('will-attach-webview', (e) => e.preventDefault());
        window.loadURL(service.origin).catch((error) => {
          console.error('Marble window failed to load:', error);
          dialog.showErrorBox('Marble could not open', error.message);
          app.quit();
        });
        console.log('Marble desktop: ' + service.origin);
        if (process.env.MARBLE_SMOKE_TEST === '1')
          window.webContents.once('did-finish-load', () => {
            console.log('Desktop loaded ' + window.webContents.getURL());
            setTimeout(() => app.quit(), 700);
          });
      };
      create();
      app.on('second-instance', () => {
        if (window?.isMinimized()) window.restore();
        window?.focus();
      });
      app.on('activate', () => {
        if (!BrowserWindow.getAllWindows().length) create();
      });
      app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
      });
      app.on('before-quit', () => service?.close());
    })
    .catch((error) => {
      console.error('Marble startup failed:', error);
      dialog.showErrorBox('Marble could not start', error.message);
      app.quit();
    });
