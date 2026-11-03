import express, { type Express } from 'express';
import cors from 'cors';
import { registerHealthRoutes } from './routes/health.js';
import { registerGamesRoutes } from './routes/games.js';
import { registerGamesStreamRoutes } from './routes/gamesStream.js';
import { liveGames } from './kafka/liveGames.js';
import { registerPredictRoutes } from './routes/predict.js';
import { registerDocsRoutes } from './routes/docs.js';

export const app: Express = express();

app.use(express.json());
app.use(
    cors({
        origin: [
            'http://localhost:4200',
            'http://localhost:5173',
            'http://127.0.0.1:4200',
            'http://127.0.0.1:5173',
        ],
        credentials: true,
    })
)

registerDocsRoutes(app);
registerHealthRoutes(app);
// The stream route must come first so /games/:id does not catch "stream".
registerGamesStreamRoutes(app, { model: liveGames });
registerGamesRoutes(app);
registerPredictRoutes(app);
