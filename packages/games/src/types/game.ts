// Canonical Game/Team/Score/GameMeta shapes, generated from nba-data-service's
// OpenAPI spec rather than hand-mirrored from its Go structs. Hand-mirroring
// silently drifted before (GameMeta was missing period/postseason/time; Team
// had a fictional externalId field that doesn't exist upstream) -- generating
// from the spec turns a future drift into a codegen diff instead of a silent gap.
//
// Do not hand-edit shapes here. To refresh:
//   npm run refresh:openapi        # pulls the latest spec from ../nba-data-service
//   npm run generate:games-types   # regenerates ./generated.ts from the spec
// See codegen/openapi/README.md for details.
import type { components } from './generated.js';

export type GameStatus = components['schemas']['Game']['statusKind'];
export type Score = components['schemas']['Score'];
export type Team = components['schemas']['Team'];
export type GameMeta = components['schemas']['GameMeta'];
export type Game = components['schemas']['Game'];

export type GameId = Game['id'];
export type TeamId = Team['id'];
