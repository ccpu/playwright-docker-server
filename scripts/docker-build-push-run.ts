#!/usr/bin/env node
/* eslint-disable no-await-in-loop */

import type { Buffer } from 'node:buffer';
import type { Browser } from 'playwright';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';

export type RunTarget = 'dockerdesktop' | 'local';

export interface ParsedArgs {
  help: boolean;
  nonInteractive: boolean;
  image?: string;
  baseImage?: string;
  tag?: string;
  registry?: string;
  push?: boolean;
  containerName?: string;
  port?: number;
  runTarget?: string;
}

export interface ResolvedOptions {
  image: string;
  baseImage: string;
  tag: string;
  registry?: string;
  push: boolean;
  runTarget: RunTarget;
  containerName: string;
  port: number;
}

export interface RunCommandOptions {
  allowFailure?: boolean;
  captureOutput?: boolean;
}

export interface RunCommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

const REPO_ROOT = path.resolve(process.cwd());

const DEFAULT_IMAGE = 'playwright/server';
const DEFAULT_BASE_IMAGE = 'playwright/base';
const DEFAULT_CONTAINER_NAME = 'playwright-docker-server';
const DEFAULT_PORT = 3000;
const DEFAULT_RUN_TARGET: RunTarget = 'dockerdesktop';
const HEALTHCHECK_TIMEOUT_MS = 90_000;
const BROWSER_CHECK_TIMEOUT_MS = 120_000;
const HTTP_ATTEMPT_TIMEOUT_MS = 3_000;
const HTTP_RETRY_DELAY_MS = 2_000;
const WS_RETRY_DELAY_MS = 3_000;
const LOCAL_PROCESS_START_DELAY_MS = 2_000;
const LOCAL_PROCESS_STOP_DELAY_MS = 1_000;
const ARGV_SKIP_COUNT = 2;

export function printHelp(): void {
  console.log(`Usage:
  pnpm docker:release -- [options]

Options:
  --image <name>             Image name without tag (default: ${DEFAULT_IMAGE})
  --base-image <name>        Base image name used by Dockerfile (default: ${DEFAULT_BASE_IMAGE})
  --tag <tag>                Image tag (default: package.json version)
  --registry <registry>      Registry prefix, e.g. ghcr.io/my-org
  --push                     Push image after build
  --no-push                  Do not push image
  --container-name <name>    Container name to run (default: ${DEFAULT_CONTAINER_NAME})
  --port <port>              Host port to map to container 3000 (default: ${DEFAULT_PORT})
  --run-target <target>      dockerdesktop | local (default: ${DEFAULT_RUN_TARGET})
  --non-interactive          Disable prompts and use defaults
  --help                     Show this help

Examples:
  pnpm docker:release -- --push --registry ghcr.io/acme --image playwright/server --tag 2.0.0
  pnpm docker:release -- --run-target dockerdesktop --no-push
  pnpm docker:release -- --run-target local --no-push
`);
}

export function parseCliArgs(argv: string[]): ParsedArgs {
  const parsed = parseArgs({
    args: argv,
    allowPositionals: false,
    options: {
      help: { type: 'boolean', short: 'h' },
      'non-interactive': { type: 'boolean' },
      image: { type: 'string' },
      'base-image': { type: 'string' },
      tag: { type: 'string' },
      registry: { type: 'string' },
      push: { type: 'boolean' },
      'no-push': { type: 'boolean' },
      'container-name': { type: 'string' },
      port: { type: 'string' },
      'run-target': { type: 'string' },
    },
  });

  const pushRequested = parsed.values.push === true;
  const noPushRequested = parsed.values['no-push'] === true;

  if (pushRequested && noPushRequested) {
    throw new Error('Use either --push or --no-push, not both.');
  }

  const portRaw = parsed.values.port;
  const parsedPort =
    portRaw === undefined ? undefined : Number.parseInt(portRaw, 10);

  let push: boolean | undefined;
  if (pushRequested) {
    push = true;
  } else if (noPushRequested) {
    push = false;
  }

  return {
    help: parsed.values.help === true,
    nonInteractive: parsed.values['non-interactive'] === true,
    image: parsed.values.image,
    baseImage: parsed.values['base-image'],
    tag: parsed.values.tag,
    registry: parsed.values.registry,
    push,
    containerName: parsed.values['container-name'],
    port: parsedPort,
    runTarget: parsed.values['run-target'],
  };
}

export function normalizeRegistry(
  registry: string | undefined,
): string | undefined {
  if (registry === undefined || registry.trim() === '') {
    return undefined;
  }

  return registry.replace(/\/+$/u, '');
}

export function composeImageRef({
  registry,
  image,
  tag,
}: {
  registry: string | undefined;
  image: string;
  tag: string;
}): string {
  const normalizedRegistry = normalizeRegistry(registry);
  if (normalizedRegistry === undefined) {
    return `${image}:${tag}`;
  }

  return `${normalizedRegistry}/${image}:${tag}`;
}

export function commandToString(command: string, args: string[]): string {
  return `${command} ${args.join(' ')}`;
}

export async function runCommand(
  command: string,
  args: string[],
  options: RunCommandOptions = {},
): Promise<RunCommandResult> {
  const { allowFailure = false, captureOutput = false } = options;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: REPO_ROOT,
      env: process.env,
      shell: false,
      stdio: captureOutput ? 'pipe' : 'inherit',
    });

    let stdout = '';
    let stderr = '';

    if (captureOutput && child.stdout !== null && child.stderr !== null) {
      child.stdout.on('data', (chunk: Buffer | string) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk: Buffer | string) => {
        stderr += chunk.toString();
      });
    }

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      const exitCode = code ?? 1;
      if (!allowFailure && exitCode !== 0) {
        reject(
          new Error(
            `Command failed (${exitCode}): ${commandToString(command, args)}`,
          ),
        );
        return;
      }

      resolve({ exitCode, stdout, stderr });
    });
  });
}

export async function askText(
  rl: readline.Interface,
  question: string,
  defaultValue: string,
): Promise<string> {
  const answer = await rl.question(`${question} [${defaultValue}]: `);
  if (answer.trim() === '') {
    return defaultValue;
  }

  return answer.trim();
}

export async function askYesNo(
  rl: readline.Interface,
  question: string,
  defaultValue: boolean,
): Promise<boolean> {
  const defaultText = defaultValue ? 'Y/n' : 'y/N';

  while (true) {
    const answer = (await rl.question(`${question} (${defaultText}): `))
      .trim()
      .toLowerCase();

    if (answer === '') {
      return defaultValue;
    }

    if (answer === 'y' || answer === 'yes') {
      return true;
    }

    if (answer === 'n' || answer === 'no') {
      return false;
    }

    console.warn('Please answer y or n.');
  }
}

export async function resolveOptions(
  cliArgs: ParsedArgs,
): Promise<ResolvedOptions> {
  const packagePath = path.join(REPO_ROOT, 'package.json');
  const packageRaw = await readFile(packagePath, 'utf8');
  const packageJson = JSON.parse(packageRaw) as { version?: string };

  const interactive =
    !cliArgs.nonInteractive && process.stdin.isTTY && process.stdout.isTTY;

  const resolvedPort =
    typeof cliArgs.port === 'number' && Number.isFinite(cliArgs.port)
      ? cliArgs.port
      : DEFAULT_PORT;

  const resolved: Omit<ResolvedOptions, 'runTarget'> & {
    runTarget?: string;
  } = {
    image: cliArgs.image ?? DEFAULT_IMAGE,
    baseImage: cliArgs.baseImage ?? DEFAULT_BASE_IMAGE,
    tag: cliArgs.tag ?? packageJson.version ?? 'latest',
    registry: normalizeRegistry(cliArgs.registry),
    push: cliArgs.push ?? false,
    runTarget: cliArgs.runTarget,
    containerName: cliArgs.containerName ?? DEFAULT_CONTAINER_NAME,
    port: resolvedPort,
  };

  if (!Number.isInteger(resolved.port) || resolved.port <= 0) {
    throw new Error(`Invalid --port value: ${String(cliArgs.port)}`);
  }

  const rl = interactive
    ? readline.createInterface({ input: process.stdin, output: process.stdout })
    : null;

  try {
    if (resolved.runTarget === undefined) {
      if (rl === null) {
        resolved.runTarget = DEFAULT_RUN_TARGET;
      } else {
        resolved.runTarget = await askText(
          rl,
          'Run target (dockerdesktop/local)',
          DEFAULT_RUN_TARGET,
        );
      }
    }

    if (cliArgs.push === undefined && rl !== null) {
      resolved.push = await askYesNo(rl, 'Push image after build?', false);
    }

    if (resolved.push && resolved.registry === undefined && rl !== null) {
      const registry = await askText(
        rl,
        'Registry prefix (empty to push image name as-is)',
        '',
      );
      resolved.registry = normalizeRegistry(registry);
    }
  } finally {
    if (rl !== null) {
      rl.close();
    }
  }

  if (
    resolved.runTarget !== 'dockerdesktop' &&
    resolved.runTarget !== 'local'
  ) {
    throw new Error(
      `Invalid --run-target value: ${resolved.runTarget}. Use dockerdesktop or local.`,
    );
  }

  return resolved as ResolvedOptions;
}

export async function waitForHttp(url: string): Promise<number> {
  const started = Date.now();
  let lastError: unknown;

  while (Date.now() - started < HEALTHCHECK_TIMEOUT_MS) {
    const controller = new AbortController();
    const abortTimeout = setTimeout(
      () => controller.abort(),
      HTTP_ATTEMPT_TIMEOUT_MS,
    );

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(abortTimeout);
      return response.status;
    } catch (error) {
      clearTimeout(abortTimeout);
      lastError = error;
      await delay(HTTP_RETRY_DELAY_MS);
    }
  }

  throw new Error(`HTTP health check failed for ${url}: ${String(lastError)}`);
}

export async function waitForPlaywrightEndpoint(
  wsEndpoint: string,
): Promise<void> {
  const started = Date.now();
  let lastError: unknown;

  while (Date.now() - started < BROWSER_CHECK_TIMEOUT_MS) {
    let browser: Browser | undefined;

    try {
      browser = await chromium.connect({ wsEndpoint, timeout: 15_000 });
      const page = await browser.newPage();
      await page.goto('data:text/html,<html><body>ok</body></html>');
      const body = await page.textContent('body');

      if (body?.trim() !== 'ok') {
        throw new Error(`Unexpected page body content: ${String(body)}`);
      }

      await browser.close();
      return;
    } catch (error) {
      lastError = error;

      if (browser !== undefined) {
        await browser.close().catch(() => {
          // ignore close failure during retry loop
        });
      }

      await delay(WS_RETRY_DELAY_MS);
    }
  }

  throw new Error(
    `Playwright WS verification failed for ${wsEndpoint}: ${String(lastError)}`,
  );
}

export async function verifyServer(port: number): Promise<void> {
  const httpUrl = `http://127.0.0.1:${port}/`;
  const wsEndpoint = `ws://127.0.0.1:${port}/chromium`;

  const status = await waitForHttp(httpUrl);
  console.log(`HTTP check passed (${httpUrl}) with status ${status}.`);

  await waitForPlaywrightEndpoint(wsEndpoint);
  console.log(`Playwright WS check passed (${wsEndpoint}).`);
}

export async function main(): Promise<void> {
  const cliArgs = parseCliArgs(process.argv.slice(ARGV_SKIP_COUNT));

  if (cliArgs.help) {
    printHelp();
    return;
  }

  const options = await resolveOptions(cliArgs);

  const localImageRef = composeImageRef({
    image: options.image,
    registry: undefined,
    tag: options.tag,
  });

  const pushImageRef = composeImageRef({
    image: options.image,
    registry: options.registry,
    tag: options.tag,
  });

  console.log('Resolved options:');
  console.log(`- run target: ${options.runTarget}`);
  console.log(`- local image: ${localImageRef}`);
  console.log(`- push image: ${pushImageRef}`);
  console.log(`- push enabled: ${options.push ? 'yes' : 'no'}`);
  console.log(`- container name: ${options.containerName}`);
  console.log(`- port mapping: ${options.port}:3000`);

  console.log('\n[1/7] Validating Docker availability...');
  await runCommand('docker', ['info']);

  console.log('\n[2/7] Building project (pnpm build)...');
  await runCommand('pnpm', ['build']);

  console.log('\n[3/7] Building base Docker image...');
  await runCommand('docker', [
    'build',
    '--rm',
    '-f',
    'Dockerfile.base',
    '-t',
    options.baseImage,
    '.',
  ]);

  console.log('\n[4/7] Building server Docker image...');
  await runCommand('docker', [
    'build',
    '--progress=plain',
    '--rm',
    '-f',
    'Dockerfile',
    '-t',
    localImageRef,
    '.',
  ]);

  console.log('\n[5/7] Tagging/pushing image (if enabled)...');
  if (options.push) {
    if (pushImageRef !== localImageRef) {
      await runCommand('docker', ['tag', localImageRef, pushImageRef]);
    }

    await runCommand('docker', ['push', pushImageRef]);
    console.log(`Image pushed: ${pushImageRef}`);
  } else {
    console.log('Push skipped.');
  }

  console.log('\n[6/7] Starting runtime target...');
  let localProcess: ReturnType<typeof spawn> | undefined;

  if (options.runTarget === 'dockerdesktop') {
    await runCommand('docker', ['rm', '-f', options.containerName], {
      allowFailure: true,
    });

    const result = await runCommand(
      'docker',
      [
        'run',
        '-d',
        '--name',
        options.containerName,
        '-p',
        `${options.port}:3000`,
        localImageRef,
      ],
      { captureOutput: true },
    );

    console.log(`Container started: ${result.stdout.trim()}`);
  } else {
    localProcess = spawn('node', ['build/src/main.js'], {
      cwd: REPO_ROOT,
      env: process.env,
      stdio: 'inherit',
      shell: false,
    });

    await delay(LOCAL_PROCESS_START_DELAY_MS);
    console.log(
      `Local process started with PID ${localProcess.pid ?? 'unknown'}.`,
    );
  }

  console.log('\n[7/7] Verifying HTTP and Playwright connectivity...');
  try {
    await verifyServer(options.port);
  } finally {
    if (localProcess !== undefined) {
      localProcess.kill('SIGINT');
      await delay(LOCAL_PROCESS_STOP_DELAY_MS);
      if (localProcess.exitCode === null) {
        localProcess.kill('SIGKILL');
      }
    }
  }

  console.log(
    '\nDone. Build, image, run, and verification steps completed successfully.',
  );

  if (options.runTarget === 'dockerdesktop') {
    console.log(
      `Container is running. Stop it with: docker rm -f ${options.containerName}`,
    );
  }
}

function isDirectExecution(): boolean {
  return require.main === module;
}

if (isDirectExecution()) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
