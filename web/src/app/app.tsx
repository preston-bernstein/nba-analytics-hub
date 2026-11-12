import { useState } from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppShell, cn } from '@nba-analytics-hub/ui';
import { DashboardPage } from './games/DashboardPage';
import { LeaderboardPage } from './players/LeaderboardPage';
import { createQueryClient } from './queryClient';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn('transition-colors hover:text-foreground', isActive && 'font-medium text-foreground');

const nav = (
  <>
    <NavLink to="/" end className={navLinkClass}>
      Games
    </NavLink>
    <NavLink to="/players" className={navLinkClass}>
      Players
    </NavLink>
  </>
);

function App() {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell title="NBA Analytics Hub" nav={nav}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/players" element={<LeaderboardPage />} />
        </Routes>
      </AppShell>
    </QueryClientProvider>
  );
}

export default App;
