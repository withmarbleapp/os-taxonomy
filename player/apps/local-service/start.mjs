import { createService } from './server.mjs';
import { join } from 'node:path';
import { homedir } from 'node:os';
const service = await createService({
  dataDir: process.env.MARBLE_DATA_DIR ?? join(homedir(), '.local/share/marble'),
  port: Number(process.env.PORT ?? 3235),
});
console.log('Marble: ' + service.origin);
for (const s of ['SIGINT', 'SIGTERM'])
  process.on(s, async () => {
    await service.close();
    process.exit(0);
  });
