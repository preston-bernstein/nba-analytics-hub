import express, { type Express } from 'express';
import { registerHealthRoutes } from './routes/health';
import { registerGamesRoutes } from './routes/games';
import { registerPredictRoutes } from './routes/predict';

export const app: Express = express();

app.use(express.json());

registerHealthRoutes(app);
registerGamesRoutes(app);
registerPredictRoutes(app);
