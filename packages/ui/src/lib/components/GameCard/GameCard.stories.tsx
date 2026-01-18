import type { Meta, StoryObj } from '@storybook/react';
import type { Game } from '@nba-analytics-hub/types';
import { GameCard } from './GameCard';

const meta: Meta<typeof GameCard> = {
  title: 'UI/GameCard',
  component: GameCard,
  decorators: [
    (Story) => (
      <div className="bg-gray-950 p-6" style={{ maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof GameCard>;

const baseGame: Game = {
  id: '1',
  provider: 'mock-provider',
  homeTeam: { id: 'ATL', name: 'Atlanta Hawks', externalId: 14 },
  awayTeam: { id: 'LAL', name: 'Los Angeles Lakers', externalId: 13 },
  startTime: new Date().toISOString(),
  status: 'SCHEDULED',
  score: { home: 0, away: 0 },
  meta: { season: '2024-2025', upstreamGameId: 9999 },
};

export const Scheduled: Story = {
  args: {
    game: baseGame,
  },
};

export const InProgress: Story = {
  args: {
    game: {
      ...baseGame,
      status: 'IN_PROGRESS',
      score: { home: 52, away: 48 },
    },
  },
};

export const FinalHomeWins: Story = {
  args: {
    game: {
      ...baseGame,
      status: 'FINAL',
      score: { home: 112, away: 98 },
    },
  },
};

export const FinalAwayWins: Story = {
  args: {
    game: {
      ...baseGame,
      status: 'FINAL',
      score: { home: 95, away: 108 },
    },
  },
};

export const Postponed: Story = {
  args: {
    game: {
      ...baseGame,
      status: 'POSTPONED',
    },
  },
};

export const Canceled: Story = {
  args: {
    game: {
      ...baseGame,
      status: 'CANCELED',
    },
  },
};
