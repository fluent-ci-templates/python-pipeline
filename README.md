# Python Pipeline

[![fluentci pipeline](https://shield.fluentci.io/x/python_pipeline)](https://pkg.fluentci.io/python_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.41)
[![dagger-min-version](https://shield.fluentci.io/dagger/v0.11.7)](https://dagger.io)
[![](https://jsr.io/badges/@fluentci/python)](https://jsr.io/@fluentci/python)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/python-pipeline)](https://codecov.io/gh/fluent-ci-templates/python-pipeline)

A ready-to-use Pipeline for your Python projects.

## 🚀 Usage

Run the following command in your project:

```bash
fluentci run python_pipeline
```

Or, if you want to use it as a template:

```bash
fluentci init -t python
```

This will create a `.fluentci` folder in your project.

Now you can run the pipeline with:

```bash
fluentci run .
```

## Dagger Module

Use as a [Dagger](https://dagger.io) module:

```bash
dagger install github.com/fluent-ci-templates/python-pipeline@main
```

## Environment variables

| Variable         | Description                                          | Default       |
| ---------------- | ------------------------------------------------------| ------------- |
|`PACKAGE_MANAGER` | The package manager to use (`poetry`, `pip`, `pipenv`) | `poetry`      |

## Jobs

| Job       | Description              |
| --------- | ------------------------ |
| test      | Run tests (using pytest) |

```typescript
test(
  src?: Directory | string,
  packageManager?: string
): Promise<string>
```

## Programmatic usage

You can also use this pipeline programmatically:

```ts
import { test } from "jsr:@fluentci/python";

await test();
```
