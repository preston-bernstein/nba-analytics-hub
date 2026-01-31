export type GameStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'FINAL'
  | 'POSTPONED'
  | 'CANCELED';

export interface Score {
  home: number;
  away: number;
}

export interface Team {
  id: string;
  name: string;
  externalId: number;
}

export interface GameMeta {
  season: string;
  upstreamGameId: number;
}

export interface Game {
  id: string;
  provider: string;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  status: string;
  statusKind: GameStatus;
  score: Score;
  meta: GameMeta;
}

export type GameId = Game['id'];
export type TeamId = Team['id'];
