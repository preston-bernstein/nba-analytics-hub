import 'dotenv/config';
import { app } from './app.js';
import { startLiveGamesConsumer } from './kafka/liveGames.js';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const server = app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

let consumer: Awaited<ReturnType<typeof startLiveGamesConsumer>>;
try {
  consumer = await startLiveGamesConsumer();
  if (!consumer) console.log('[ kafka ] KAFKA_BROKERS not set; consumer disabled');
} catch (err) {
  console.error('[ kafka ] consumer failed to start; API keeps running', err);
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    server.close();
    void consumer?.stop().finally(() => process.exit(0));
    if (!consumer) process.exit(0);
  });
}
