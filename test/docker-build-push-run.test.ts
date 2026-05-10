import {
  composeImageRef,
  normalizeRegistry,
  parseCliArgs,
  resolveOptions,
} from '../scripts/docker-build-push-run';

describe('docker-build-push-run', () => {
  it('parses cli args including no-push and port', () => {
    const args = parseCliArgs([
      '--image',
      'playwright/custom',
      '--tag',
      '2.5.0',
      '--no-push',
      '--port',
      '3015',
      '--run-target',
      'local',
    ]);

    expect(args.image).toBe('playwright/custom');
    expect(args.tag).toBe('2.5.0');
    expect(args.push).toBe(false);
    expect(args.port).toBe(3015);
    expect(args.runTarget).toBe('local');
  });

  it('throws when both push flags are provided', () => {
    expect(() => parseCliArgs(['--push', '--no-push'])).toThrow(
      'Use either --push or --no-push, not both.',
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
      containerName: undefined,
      port: undefined,
    });

    expect(resolved.image).toBe('playwright/server');
    expect(resolved.baseImage).toBe('playwright/base');
    expect(resolved.runTarget).toBe('dockerdesktop');
    expect(resolved.push).toBe(false);
    expect(resolved.port).toBe(3000);
    expect(resolved.containerName).toBe('playwright-docker-server');
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
        containerName: undefined,
        port: undefined,
      }),
    ).rejects.toThrow('Invalid --run-target value: invalid-target');
  });
});
