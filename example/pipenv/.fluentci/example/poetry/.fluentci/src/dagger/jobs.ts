import Client from "@fluentci.io/dagger";
import { withDevbox } from "https://nix.fluentci.io/v0.4.1/src/dagger/steps.ts";

export enum Job {
  test = "test",
}

export const exclude = ["node_modules", ".git", ".fluentci", ".devbox"];

export const test = async (client: Client, src = ".") => {
  const context = client.host().directory(src);
  const packageManager = Deno.env.get("PACKAGE_MANAGER") || "poetry";

  const baseCtr = withDevbox(
    client
      .pipeline(Job.test)
      .container()
      .from("alpine:latest")
      .withExec(["apk", "update"])
      .withExec(["apk", "add", "bash", "curl"])
      .withMountedCache("/nix", client.cacheVolume("nix"))
      .withMountedCache("/etc/nix", client.cacheVolume("nix-etc"))
  );

  let ctr = baseCtr
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app");

  switch (packageManager) {
    case "poetry":
      ctr = ctr
        .withExec(["sh", "-c", "devbox run -- poetry install"])
        .withExec(["sh", "-c", "devbox run -- poetry run pytest"]);
      break;
    case "pip":
      ctr = ctr
        .withExec(["sh", "-c", "devbox run -- pip install -r requirements.txt"])
        .withExec(["sh", "-c", "devbox run -- pytest"]);
      break;
    case "pipenv":
      ctr = ctr
        .withExec(["sh", "-c", "devbox run -- pipenv install --dev"])
        .withExec(["sh", "-c", "devbox run -- pipenv run pytest"]);
      break;
    default:
      throw new Error(`Unknown package manager: ${packageManager}`);
  }

  const result = await ctr.stdout();

  console.log(result);
};

export type JobExec = (client: Client, src?: string) => Promise<void>;

export const runnableJobs: Record<Job, JobExec> = {
  [Job.test]: test,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.test]: "Run all tests (using pytest)",
};
