import { match } from '@/lib/match-case';

describe('Match case function should work correctly', () => {
  it('should return the correct value', () => {
    const result = match('bob', {
      alice: 100,
      bob: 200,
      carl: 300,
    });
    expect(result).toBe(200);
  });
  it('should return the correct value even when default is set', () => {
    const result = match('bob', {
      alice: 100,
      bob: 200,
      carl: 300,
      default: 500,
    });
    expect(result).toBe(200);
  });
  it('should return the correct value even when override default is set', () => {
    const result = match(
      'bob',
      {
        alice: 100,
        bob: 200,
        carl: 300,
      },
      {
        overrideDefaultValue: 600,
      }
    );
    expect(result).toBe(200);
  });
  it('should return the correct value even when empty case default is set', () => {
    const result = match(
      'bob',
      {
        alice: 100,
        bob: 200,
        carl: 300,
      },
      {
        emptyCaseValue: 600,
      }
    );
    expect(result).toBe(200);
  });
  it('should return undefined when nothing found', () => {
    const result = match('bad', { test: 100 });
    expect(result).toBe(undefined);
  });
  it('should return default value when nothing found', () => {
    const result = match('test2', { test: 100, default: 500 });
    expect(result).toBe(500);
  });
  it('should return empty case value when nothing found', () => {
    const result = match('test2', { test: 100 }, { emptyCaseValue: 600 });
    expect(result).toBe(600);
  });
  it('should return default value when nothing found and empty case value is set', () => {
    const result = match(
      'bad',
      { test: 100, default: 500 },
      { emptyCaseValue: 600 }
    );
    expect(result).toBe(500);
  });
  it('should return override value when nothing found and default value is set', () => {
    const result = match(
      'bad',
      { test: 100, default: 500 },
      { overrideDefaultValue: 600 }
    );
    expect(result).toBe(600);
  });
});
