import { CfnOutput, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as logs from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';
import type { ServiceUrls } from './config.js';

const API_PORT = 3000;

export interface ApiStackProps extends StackProps, ServiceUrls {
  /** The Node API container image. The app builds it from `api/Dockerfile`. */
  image: ecs.ContainerImage;
  /** Number of running tasks. Defaults to 1. */
  desiredCount?: number;
}

/**
 * Runs the Node API (the only public backend) on ECS Fargate behind a
 * public Application Load Balancer.
 *
 * Cost choices for a demo: public subnets only, so no NAT gateway; the
 * smallest Fargate size; logs kept for one week and removed with the stack.
 */
export class ApiStack extends Stack {
  /** The public URL of the API, shown after `cdk deploy`. */
  readonly apiUrl: CfnOutput;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [{ name: 'public', subnetType: ec2.SubnetType.PUBLIC }],
    });

    const logGroup = new logs.LogGroup(this, 'ApiLogs', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Api', {
      vpc,
      cpu: 256,
      memoryLimitMiB: 512,
      desiredCount: props.desiredCount ?? 1,
      // Start the new task before stopping the old one, so a deploy has no gap.
      minHealthyPercent: 100,
      publicLoadBalancer: true,
      assignPublicIp: true,
      taskSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      circuitBreaker: { rollback: true },
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
      taskImageOptions: {
        image: props.image,
        containerPort: API_PORT,
        environment: {
          NODE_ENV: 'production',
          PORT: String(API_PORT),
          GAMES_SERVICE_URL: props.gamesServiceUrl,
          PREDICTOR_SERVICE_URL: props.predictorServiceUrl,
        },
        logDriver: ecs.LogDrivers.awsLogs({ streamPrefix: 'api', logGroup }),
      },
    });

    service.targetGroup.configureHealthCheck({ path: '/health' });

    this.apiUrl = new CfnOutput(this, 'ApiUrl', {
      value: `http://${service.loadBalancer.loadBalancerDnsName}`,
      description: 'Public URL of the Node API',
    });
  }
}
