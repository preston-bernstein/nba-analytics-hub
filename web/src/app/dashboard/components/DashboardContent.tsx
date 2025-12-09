import { DashboardContentProps } from "../types";
import { GameCard, PredictionBadge } from "@nba-analytics-hub/ui";

export function DashboardContent ({
    games,
    predictions,
    loadingPredictions
}: DashboardContentProps) {
    return (
        <section aria-label="upcoming-games">
            <header>
                <h1>Upcoming Games</h1>
                {loadingPredictions && <p>Loading predictions...</p>}
            </header>

            <div>
                {games.map((game) => {
                    const prediction = predictions[game.id];
                    return (
                        <article key={game.id}>
                            <GameCard game={game} />
                            {prediction ? (
                                <PredictionBadge prediction={prediction} />
                            ) : (
                                <p>Prediction pending...</p>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    )
}
