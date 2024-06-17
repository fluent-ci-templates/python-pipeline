import { Directory, dag, env } from "../../deps.ts";
import { getDirectory } from "./lib.ts";

export enum Job {
  test = "test",
}

export const exclude = ["node_modules", ".git", ".fluentci", ".devbox"];

/**
 * @function
 * @description Run all tests (using pytest)
 * @param {string | Directory} src
 * @param {string} packageManager
 * @returns {Promise<string>}
 */
export async function test(
  src: Directory | string | undefined = ".",
  packageManager?: string
): Promise<string> {
  const context = await getDirectory(src);
  const pm = env.get("PACKAGE_MANAGER") || packageManager || "poetry";

  const baseCtr = dag
    .pipeline(Job.test)
    .container()
    .from("ghcr.io/fluentci-io/devbox:latest")
    .withExec(["sh", "-c", "devbox version update"]);

  let ctr = baseCtr
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app");

  switch (pm) {
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
      throw new Error(`Unknown package manager: ${pm}`);
  }

  return ctr.stdout();
}

export type JobExec = (
  src?: Directory | string,
  packageManager?: string
) => Promise<string>;

export const runnableJobs: Record<Job, JobExec> = {
  [Job.test]: test,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.test]: "Run all tests (using pytest)",
};
