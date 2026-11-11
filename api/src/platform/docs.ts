import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveOpenApiPath(): string {
  const candidates = [
    // When the spec is copied to the build output
    path.resolve(__dirname, '../../docs/api/openapi.yaml'),
    // Fallbacks to workspace root during dev/test (cwd may be repo root or api/)
    path.resolve(__dirname, '../../../docs/api/openapi.yaml'),
    path.resolve(process.cwd(), '../docs/api/openapi.yaml'),
    path.resolve(process.cwd(), 'docs/api/openapi.yaml'),
  ];

  const match = candidates.find((candidate) => fs.existsSync(candidate));
  if (!match) {
    throw new Error('OpenAPI spec not found in docs/api/openapi.yaml');
  }

  return match;
}

export function registerDocsRoutes(app: Express): void {
  const openApiPath = resolveOpenApiPath();

  app.get('/api/docs/openapi.yaml', (_req, res) => {
    res.sendFile(openApiPath);
  });

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: { url: '/api/docs/openapi.yaml' },
    }),
  );
}
