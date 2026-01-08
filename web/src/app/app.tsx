import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@nba-analytics-hub/ui';
import { DashboardPage } from './dashboard/DashboardPage.tsx';

export function App() {
  return (
    <AppShell title="NBA Analytics Hub">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
