import { http, HttpResponse } from 'msw';
import { mockGames } from '@nba-analytics-hub/games';
import type { PredictionResponse } from '@nba-analytics-hub/prediction';

/** A number from 0 to 1 that depends only on the text, so a game always gets one prediction. */
function hash01(text: string): number {
  let h = 0;
  for (const char of text) h = (Math.imul(h, 31) + char.charCodeAt(0)) | 0;
  return (h >>> 0) / 4294967296;
}

export const gamesHandlers = [
  http.get('*/games', () => HttpResponse.json(mockGames)),
  http.get('*/predict', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const homeTeamId = params.get('homeTeamId') ?? 'HOME';
    const awayTeamId = params.get('awayTeamId') ?? 'AWAY';
    const home = Number(
      (0.3 + 0.4 * hash01(`${homeTeamId}-${awayTeamId}-${params.get('gameDate')}`)).toFixed(3)
    );
    const prediction: PredictionResponse = {
      homeTeamId,
      awayTeamId,
      homeWinProbability: home,
      awayWinProbability: Number((1 - home).toFixed(3)),
      modelVersion: 'msw-mock',
    };
    return HttpResponse.json(prediction);
  }),
];
