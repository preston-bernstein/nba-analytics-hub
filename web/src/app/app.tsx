import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@nba-analytics-hub/ui';
import { DashboardPage } from './games/DashboardPage';
import { createQueryClient } from './queryClient';

function App() {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell title="NBA Analytics Hub">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
        </Routes>
      </AppShell>
    </QueryClientProvider>
  );
}

export default App;
