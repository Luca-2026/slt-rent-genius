import { describe, it, expect } from 'vitest';
import { stripRouteHead } from '../../scripts/seoHead.mjs';

describe('route head ownership', () => {
  it('preserves verification and removes conflicting route directives', () => {
    const result = stripRouteHead('<head><title>Old</title><meta name="robots" content="index"><meta property="og:title" content="Old"><link rel="canonical" href="/"><meta name="google-site-verification" content="verified"><script src="/assets/main.js"></script></head><body>Keep</body>');
    expect(result).not.toContain('<title>');
    expect(result).not.toContain('name="robots"');
    expect(result).not.toContain('rel="canonical"');
    expect(result).toContain('content="verified"');
    expect(result).toContain('/assets/main.js');
    expect(result).toContain('<body>Keep</body>');
  });
});