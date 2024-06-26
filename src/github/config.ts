import { FluentGithubActions } from "../../deps.ts";

export function generateYaml(): FluentGithubActions.Workflow {
  const workflow = new FluentGithubActions.Workflow("Test");

  const push = {
    branches: ["main"],
  };

  const setupDagger = `\
  curl -L https://dl.dagger.io/dagger/install.sh | DAGGER_VERSION=0.8.1 sh
  sudo mv bin/dagger /usr/local/bin
  dagger version`;

  const tests: FluentGithubActions.JobSpec = {
    "runs-on": "ubuntu-latest",
    steps: [
      {
        uses: "actions/checkout@v2",
      },
      {
        uses: "denolib/setup-deno@v2",
        with: {
          "deno-version": "v1.36",
        },
      },
      {
        name: "Setup Fluent CI CLI",
        run: "deno install -A -r https://cli.fluentci.io -n fluentci",
      },
      {
        name: "Setup Dagger",
        run: setupDagger,
      },
      {
        name: "Run Dagger Pipelines",
        run: "fluentci run python_pipeline",
        env: {
          PACKAGE_MANAGER: "poetry",
        },
      },
    ],
  };

  workflow.on({ push }).jobs({ tests });

  return workflow;
}
