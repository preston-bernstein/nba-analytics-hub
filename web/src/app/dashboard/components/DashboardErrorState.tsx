import { DashboardErrorStateProps } from '../types.ts';

export function DashboardErrorState({ message }: DashboardErrorStateProps) {
    return (
        <section aria-label="Dashboard error state">
            <div
                role="alert"
                style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(248, 113, 113, 0.12)',
                    border: '1px solid rgba(248, 113, 113, 0.4)'
                }}
            >
                {message}
            </div>
        </section>
    );
}