import { createServer } from 'node:http';

// Detect whether this environment allows opening a local socket. Default ON
// unless explicitly disabled (ALLOW_SOCKET_TESTS=false) and skip if listen fails.
const allowEnv = process.env.ALLOW_SOCKET_TESTS !== 'false';

const canListen = (() => {
  try {
    const server = createServer();
    server.listen(0, '127.0.0.1');
    server.close();
    return true;
  } catch {
    return false;
  }
})();

export const socketsAvailable = allowEnv && canListen;
