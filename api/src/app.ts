import express, { type Express } from 'express';
import cors from 'cors';
import { registerHealthRoutes } from './routes/health';
import { registerGamesRoutes } from './routes/games';
import { registerPredictRoutes } from './routes/predict';

export const app: Express = express();

app.use(express.json());
app.use(
    cors({
        origin: 'http://localhost:4200',
        credentials: true,
    })
)

registerHealthRoutes(app);
registerGamesRoutes(app);
registerPredictRoutes(app);
