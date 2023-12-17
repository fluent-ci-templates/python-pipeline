import { Client, Directory } from "../../sdk/client.gen.ts";
import { connect } from "../../sdk/connect.ts";
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
  let result = "";
  await connect(async (client: Client) => {
    const context = getDirectory(client, src);
    const pm = Deno.env.get("PACKAGE_MANAGER") || packageManager || "poetry";

    const baseCtr = client
      .pipeline(Job.test)
      .container()
      .from("ghcr.io/fluentci-io/devbox:latest")
      .withExec(["mv", "/nix/store", "/nix/store-orig"])
      .withMountedCache("/nix/store", client.cacheVolume("nix-cache"))
      .withExec(["sh", "-c", "cp -r /nix/store-orig/* /nix/store/"])
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
          .withExec([
            "sh",
            "-c",
            "devbox run -- pip install -r requirements.txt",
          ])
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

    result = await ctr.stdout();
  });
  return result;
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
