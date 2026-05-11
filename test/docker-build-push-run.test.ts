import {
  composeImageRef,
  imageRefToRepository,
  normalizeRegistry,
  parseCliArgs,
  resolveOptions,
  selectRelatedImageRefs,
} from '../scripts/docker-build-push-run';

describe('docker-build-push-run', () => {
  it('parses cli args including no-push, no-cleanup and port', () => {
    const args = parseCliArgs([
      '--image',
      'playwright/custom',
      '--tag',
      '2.5.0',
      '--no-push',
      '--no-cleanup',
      '--port',
      '3015',
      '--run-target',
      'local',
    ]);

    expect(args.image).toBe('playwright/custom');
    expect(args.tag).toBe('2.5.0');
    expect(args.push).toBe(false);
    expect(args.cleanup).toBe(false);
    expect(args.port).toBe(3015);
    expect(args.runTarget).toBe('local');
  });

  it('throws when both push flags are provided', () => {
    expect(() => parseCliArgs(['--push', '--no-push'])).toThrow(
      'Use either --push or --no-push, not both.',
    );
  });

  it('throws when both cleanup flags are provided', () => {
    expect(() => parseCliArgs(['--cleanup', '--no-cleanup'])).toThrow(
      'Use either --cleanup or --no-cleanup, not both.',
    );
  });

  it('normalizes registry values by trimming trailing slash', () => {
    expect(normalizeRegistry('ghcr.io/my-org/')).toBe('ghcr.io/my-org');
    expect(normalizeRegistry('')).toBeUndefined();
  });

  it('builds image ref with registry and tag', () => {
    const imageRef = composeImageRef({
      registry: 'ghcr.io/my-org',
      image: 'playwright/server',
      tag: '2.0.0',
    });

    expect(imageRef).toBe('ghcr.io/my-org/playwright/server:2.0.0');
  });

  it('extracts repository from tagged image ref with registry port', () => {
    const repository = imageRefToRepository(
      'localhost:5000/playwright/server:2.0.0',
    );

    expect(repository).toBe('localhost:5000/playwright/server');
  });

  it('selects related refs excluding only current server tags', () => {
    const refs = [
      'playwright/server:2.0.0',
      'playwright/server:1.9.0',
      'playwright/base:latest',
      'playwright/base:old',
      'redis:7',
      '<none>:<none>',
    ];

    const selected = selectRelatedImageRefs(
      refs,
      new Set(['playwright/server', 'playwright/base']),
      new Set(['playwright/server:2.0.0']),
    );

    expect(selected).toEqual([
      'playwright/server:1.9.0',
      'playwright/base:latest',
      'playwright/base:old',
    ]);
  });

  it('resolves defaults in non-interactive mode', async () => {
    const resolved = await resolveOptions({
      help: false,
      nonInteractive: true,
      push: undefined,
      runTarget: undefined,
      image: undefined,
      baseImage: undefined,
      tag: undefined,
      registry: undefined,
      cleanup: undefined,
      containerName: undefined,
      port: undefined,
    });

    expect(resolved.image).toBe('playwright/server');
    expect(resolved.baseImage).toBe('playwright/base');
    expect(resolved.runTarget).toBe('dockerdesktop');
    expect(resolved.push).toBe(false);
    expect(resolved.cleanup).toBe(true);
    expect(resolved.port).toBe(3010);
    expect(resolved.containerName).toBe('playwright-server');
  });

  it('throws for an invalid run target', async () => {
    await expect(
      resolveOptions({
        help: false,
        nonInteractive: true,
        push: false,
        runTarget: 'invalid-target',
        image: undefined,
        baseImage: undefined,
        tag: undefined,
        registry: undefined,
        cleanup: undefined,
        containerName: undefined,
        port: undefined,
      }),
    ).rejects.toThrow('Invalid --run-target value: invalid-target');
  });
});
