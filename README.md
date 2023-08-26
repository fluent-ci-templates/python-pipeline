# Python Pipeline

[![deno module](https://shield.deno.dev/x/python_pipeline)](https://deno.land/x/python_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.34)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/python-pipeline)](https://codecov.io/gh/fluent-ci-templates/python-pipeline)

A ready-to-use Pipeline for your Python projects.

## 🚀 Usage

Run the following command in your project:

```bash
dagger run fluentci python_pipeline
```

Or, if you want to use it as a template:

```bash
fluentci init -t python
```

This will create a `.fluentci` folder in your project.

Now you can run the pipeline with:

```bash
dagger run fluentci .
```

## Environment variables

| Variable         | Description                                          | Default       |
| ---------------- | ------------------------------------------------------| ------------- |
|`PACKAGE_MANAGER` | The package manager to use (`poetry`, `pip`, `pipenv`) | `poetry`      |


## Jobs

| Job       | Description              |
| --------- | ------------------------ |
| test      | Run tests (using pytest) |

## Programmatic usage

You can also use this pipeline programmatically:

```ts
import { Client, connect } from "https://esm.sh/@dagger.io/dagger@0.8.1";
import { Dagger } from "https://deno.land/x/python_pipeline/mod.ts";

const { test } = Dagger;

function pipeline(src = ".") {
  connect(async (client: Client) => {
    await test(client, src);
  });
}

pipeline();
```
