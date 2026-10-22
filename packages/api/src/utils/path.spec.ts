import { logger } from '@aries/data-schemas';
import type { Logger } from '@aries/agents';
import { getBasePath } from './path';

describe('getBasePath', () => {
  let originalDomainClient: string | undefined;

  beforeEach(() => {
    originalDomainClient = process.env.DOMAIN_CLIENT;
  });

  afterEach(() => {
    process.env.DOMAIN_CLIENT = originalDomainClient;
  });

  it('should return empty string when DOMAIN_CLIENT is not set', () => {
    delete process.env.DOMAIN_CLIENT;
    expect(getBasePath()).toBe('');
  });

  it('should return empty string when DOMAIN_CLIENT is root path', () => {
    process.env.DOMAIN_CLIENT = 'http://localhost:3080/';
    expect(getBasePath()).toBe('');
  });

  it('should return base path for subdirectory deployment', () => {
    process.env.DOMAIN_CLIENT = 'http://localhost:3080/aries';
    expect(getBasePath()).toBe('/aries');
  });

  it('should return base path without trailing slash', () => {
    process.env.DOMAIN_CLIENT = 'http://localhost:3080/aries/';
    expect(getBasePath()).toBe('/aries');
  });

  it('should handle nested subdirectories', () => {
    process.env.DOMAIN_CLIENT = 'http://localhost:3080/apps/aries';
    expect(getBasePath()).toBe('/apps/aries');
  });

  it('should handle HTTPS URLs', () => {
    process.env.DOMAIN_CLIENT = 'https://example.com/aries';
    expect(getBasePath()).toBe('/aries');
  });

  it('should handle URLs with query parameters', () => {
    process.env.DOMAIN_CLIENT = 'http://localhost:3080/aries?param=value';
    expect(getBasePath()).toBe('/aries');
  });

  it('should handle URLs with fragments', () => {
    process.env.DOMAIN_CLIENT = 'http://localhost:3080/aries#section';
    expect(getBasePath()).toBe('/aries');
  });

  it('should return empty string for invalid URL', () => {
    process.env.DOMAIN_CLIENT = 'not-a-valid-url';
    // Accepts (infoObject: object), return value is not used
    const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {
      return logger as unknown as Logger;
    });
    expect(getBasePath()).toBe('');
    expect(loggerSpy).toHaveBeenCalledWith(
      'Error parsing DOMAIN_CLIENT for base path:',
      expect.objectContaining({
        message: 'Invalid URL',
      }),
    );
    loggerSpy.mockRestore();
  });

  it('should handle empty string DOMAIN_CLIENT', () => {
    process.env.DOMAIN_CLIENT = '';
    expect(getBasePath()).toBe('');
  });

  it('should handle undefined DOMAIN_CLIENT', () => {
    process.env.DOMAIN_CLIENT = undefined;
    expect(getBasePath()).toBe('');
  });

  it('should handle null DOMAIN_CLIENT', () => {
    // @ts-expect-error Testing null case
    process.env.DOMAIN_CLIENT = null;
    expect(getBasePath()).toBe('');
  });

  it('should handle URLs with ports', () => {
    process.env.DOMAIN_CLIENT = 'http://localhost:8080/aries';
    expect(getBasePath()).toBe('/aries');
  });

  it('should handle URLs with subdomains', () => {
    process.env.DOMAIN_CLIENT = 'https://app.example.com/aries';
    expect(getBasePath()).toBe('/aries');
  });
});
