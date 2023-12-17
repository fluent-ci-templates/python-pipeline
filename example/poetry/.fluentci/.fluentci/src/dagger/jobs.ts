import Client, { connect } from "../../deps.ts";

export enum Job {
  test = "test",
}

export const exclude = ["node_modules", ".git", ".fluentci", ".devbox"];

export const test = async (src = ".", packageManager?: string) => {
  await connect(async (client: Client) => {
    const context = client.host().directory(src);
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

    const result = await ctr.stdout();

    console.log(result);
  });
  return "Done";
};

export type JobExec = (
  src?: string,
  packageManager?: string
) => Promise<string>;

export const runnableJobs: Record<Job, JobExec> = {
  [Job.test]: test,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.test]: "Run all tests (using pytest)",
};
