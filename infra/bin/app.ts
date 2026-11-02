import { fileURLToPath } from 'node:url';
import { App, IgnoreMode, Tags } from 'aws-cdk-lib';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { ApiStack } from '../src/api-stack.js';
import { readServiceUrls } from '../src/config.js';

const app = new App();
const apiDir = fileURLToPath(new URL('../../api', import.meta.url));

const stack = new ApiStack(app, 'NbaApiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  // `nx deploy` builds and prunes `api/dist` first; the Dockerfile copies it.
  // Build for x86_64 so an Apple Silicon Mac produces an image Fargate runs.
  image: ContainerImage.fromAsset(apiDir, {
    platform: Platform.LINUX_AMD64,
    // Send only what the Dockerfile copies.
    ignoreMode: IgnoreMode.DOCKER,
    exclude: ['*', '!Dockerfile', '!dist'],
  }),
  ...readServiceUrls((key) => app.node.tryGetContext(key)),
});

// Tag every resource so the demo's cost is easy to find in AWS billing.
Tags.of(stack).add('project', 'nba-analytics-hub');
