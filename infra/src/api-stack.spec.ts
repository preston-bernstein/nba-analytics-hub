import { App } from 'aws-cdk-lib';
import { Annotations, Match, Template } from 'aws-cdk-lib/assertions';
import { ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { ApiStack } from './api-stack.js';
import { readServiceUrls } from './config.js';

const urls = {
  gamesServiceUrl: 'http://games.internal:4000',
  predictorServiceUrl: 'http://predictor.internal:5000',
};

function makeStack(desiredCount?: number): ApiStack {
  const app = new App();
  return new ApiStack(app, 'TestApiStack', {
    // A registry image keeps the test free of Docker builds.
    image: ContainerImage.fromRegistry('node:lts-alpine'),
    ...urls,
    desiredCount,
  });
}

function synth(desiredCount?: number): Template {
  return Template.fromStack(makeStack(desiredCount));
}

describe('ApiStack', () => {
  const template = synth();

  it('synthesizes with no warnings or errors', () => {
    const annotations = Annotations.fromStack(makeStack());
    annotations.hasNoWarning('*', Match.anyValue());
    annotations.hasNoError('*', Match.anyValue());
  });

  it('runs the API as one Fargate task by default, with no gap on deploy', () => {
    template.hasResourceProperties('AWS::ECS::Service', {
      LaunchType: 'FARGATE',
      DesiredCount: 1,
      DeploymentConfiguration: Match.objectLike({
        MinimumHealthyPercent: 100,
        DeploymentCircuitBreaker: { Enable: true, Rollback: true },
      }),
    });
  });

  it('accepts a custom task count', () => {
    const scaled = synth(2);
    scaled.hasResourceProperties('AWS::ECS::Service', { DesiredCount: 2 });
  });

  it('passes the port and service URLs to the container', () => {
    template.hasResourceProperties('AWS::ECS::TaskDefinition', {
      Cpu: '256',
      Memory: '512',
      RuntimePlatform: { CpuArchitecture: 'X86_64', OperatingSystemFamily: 'LINUX' },
      ContainerDefinitions: [
        Match.objectLike({
          PortMappings: [Match.objectLike({ ContainerPort: 3000 })],
          Environment: Match.arrayWith([
            { Name: 'PORT', Value: '3000' },
            { Name: 'GAMES_SERVICE_URL', Value: urls.gamesServiceUrl },
            { Name: 'PREDICTOR_SERVICE_URL', Value: urls.predictorServiceUrl },
          ]),
        }),
      ],
    });
  });

  it('puts the API behind a public load balancer that checks /health', () => {
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::LoadBalancer', {
      Scheme: 'internet-facing',
    });
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
      HealthCheckPath: '/health',
      Port: 80,
    });
  });

  it('uses no NAT gateways, to keep a demo deploy cheap', () => {
    template.resourceCountIs('AWS::EC2::NatGateway', 0);
  });

  it('keeps logs for one week and deletes them with the stack', () => {
    template.hasResource('AWS::Logs::LogGroup', {
      Properties: { RetentionInDays: 7 },
      DeletionPolicy: 'Delete',
    });
  });

  it('outputs the API URL', () => {
    template.hasOutput('ApiUrl', {});
  });
});

describe('readServiceUrls', () => {
  it('returns both URLs when they are valid', () => {
    const ctx: Record<string, string> = urls;
    expect(readServiceUrls((key) => ctx[key])).toEqual(urls);
  });

  it('rejects a missing URL', () => {
    expect(() => readServiceUrls(() => undefined)).toThrow(/gamesServiceUrl/);
  });

  it('rejects a URL that is not http or https', () => {
    const ctx: Record<string, string> = { ...urls, predictorServiceUrl: 'ftp://x' };
    expect(() => readServiceUrls((key) => ctx[key])).toThrow(/predictorServiceUrl/);
  });
});
