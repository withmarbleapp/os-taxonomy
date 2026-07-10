import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { api } from './routes/api.js';
import { getConfig } from './config.js';
import { ensureStorageDirs, getDb } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import { listChildren } from './db/repository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '../..');

async function bootstrap() {
  ensureStorageDirs();
  getDb();

  if (listChildren().length === 0) {
    await seedDatabase();
  }

  const app = new Hono();
  app.use('/api/*', cors({ origin: '*' }));
  app.route('/api', api);

  const isProd = process.env.NODE_ENV === 'production';
  const clientDist = path.join(APP_ROOT, 'dist/client');

  if (isProd && fs.existsSync(clientDist)) {
    app.use('/*', serveStatic({ root: './dist/client' }));
    app.get('*', async (c) => {
      const index = fs.readFileSync(path.join(clientDist, 'index.html'), 'utf8');
      return c.html(index);
    });
  } else {
    app.get('/', (c) =>
      c.text(
        'Weekend Worksheets API is running. Start the Vite client with: npm run dev:client',
      ),
    );
  }

  return app;
}

const config = getConfig();
const app = await bootstrap();
const port = Number(process.env.API_PORT ?? (process.env.NODE_ENV === 'production' ? config.port : 8787));

serve({ fetch: app.fetch, port, hostname: config.host }, (info) => {
  console.log(
    `API listening on http://${info.address}:${info.port} (demoMode=${getConfig().demoMode})`,
  );
});
