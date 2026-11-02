# infra

AWS CDK app that deploys the Node API (`api/`) to AWS.

## What it creates

One stack, `NbaApiStack`:

- A VPC with two public subnets and no NAT gateway.
- An ECS Fargate service that runs the API container (0.25 vCPU, 512 MB).
- A public Application Load Balancer. It checks `/health` on each task.
- A CloudWatch log group. Logs are kept for one week.

The image is built from `api/Dockerfile` for x86_64.
A deploy starts the new task before it stops the old one.
If the new task fails its health check, ECS rolls back.

The Go and Python services are not in this stack. They stay private.
The API reads their URLs from CDK context (`gamesServiceUrl`,
`predictorServiceUrl`). Synth fails if either one is not an http(s) URL.

## Commands

Run these from the repo root.

| Command | What it does |
|---|---|
| `npx nx test @nba-analytics-hub/infra` | Runs the assertion tests. No AWS account needed. |
| `npx nx synth @nba-analytics-hub/infra` | Writes the CloudFormation template to `infra/cdk.out`. |
| `npx nx diff @nba-analytics-hub/infra` | Shows what a deploy would change. |
| `npx nx deploy @nba-analytics-hub/infra` | Builds the API, builds the image, and deploys. |
| `npx nx destroy @nba-analytics-hub/infra` | Deletes the stack. |

To point the API at real services, pass context:

```bash
npx nx deploy @nba-analytics-hub/infra -- \
  -c gamesServiceUrl=https://games.example.com \
  -c predictorServiceUrl=https://predictor.example.com
```

## Before the first deploy

1. Configure AWS credentials (`aws configure` or `AWS_PROFILE`).
2. Start Docker.
3. Bootstrap the account once: `npx cdk bootstrap` from `infra/`.

## Cost

The load balancer and one Fargate task cost about $1 a day.
Run `destroy` when you are done.
All resources have the tag `project=nba-analytics-hub`.
