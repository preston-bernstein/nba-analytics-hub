import type { TeamId } from './team';

export type GameId = string;

export interface Game {
  id: GameId;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  startTimeUtc: string;
}