import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle } from '@nba-analytics-hub/ui';
import { DashboardErrorStateProps } from '../types';

export function DashboardErrorState({ message }: DashboardErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle aria-label="warning" />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
}
