import { spawnSync } from 'node:child_process';

// Detect whether this environment allows opening a local socket. Default ON
// unless explicitly disabled (ALLOW_SOCKET_TESTS=false) and skip if listen fails.
const allowEnv = process.env.ALLOW_SOCKET_TESTS !== 'false';

const canListen = (() => {
  const probe = spawnSync(process.execPath, [
    '-e',
    `
    const { createServer } = require('node:http');
    const server = createServer();
    server.once('error', () => process.exit(1));
    server.listen(0, '0.0.0.0', () => server.close(() => process.exit(0)));
    setTimeout(() => process.exit(1), 500);
    `,
  ]);

  return probe.status === 0;
})();

export const socketsAvailable = allowEnv && canListen;
