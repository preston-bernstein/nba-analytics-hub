import express, { type Express } from 'express';
import cors from 'cors';
import { registerHealthRoutes } from './routes/health.js';
import { registerGamesRoutes } from './routes/games.js';
import { registerPredictRoutes } from './routes/predict.js';
import { registerDocsRoutes } from './routes/docs.js';

export const app: Express = express();

app.use(express.json());
app.use(
    cors({
        origin: 'http://localhost:4200',
        credentials: true,
    })
)

registerDocsRoutes(app);
registerHealthRoutes(app);
registerGamesRoutes(app);
registerPredictRoutes(app);
