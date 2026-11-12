import { gamesHandlers } from './games';
import { playersHandlers } from './players';

export const handlers = [...gamesHandlers, ...playersHandlers];
