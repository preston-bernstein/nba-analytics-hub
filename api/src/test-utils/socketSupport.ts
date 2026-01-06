import { createServer } from 'node:http';

// Detect whether this environment allows opening a local socket. Only run
// supertest-based route tests when ALLOW_SOCKET_TESTS=true *and* the listen
// check succeeds.
const allowEnv = process.env.ALLOW_SOCKET_TESTS === 'true';

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
