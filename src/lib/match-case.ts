export type Cases<K extends string | number | symbol, U, D> = Record<K, U> & {
  default?: D;
};

/**
 * emptyCaseValue - Returns this value if the case is empty and cases has no default
 * overrideDefaultValue - Returns this value if the case is empty even if cases has a default value
 */
export type MatchCaseOptions<D, O> = {
  emptyCaseValue?: D;
  overrideDefaultValue?: O;
};

/**
 * Performs as an improvement over `switch` statement.
 * @param condition The condition to match.
 * @param cases The cases to match.
 * @param options The options to override default values.
 * @returns The matched value.
 */
export function match<
  P extends string | number | symbol,
  U,
  T extends Cases<P, U, D>,
  K extends keyof T | string,
  D extends U,
  O extends U
>(condition: K, cases: T, options = {} as MatchCaseOptions<D, O>) {
  const { emptyCaseValue, overrideDefaultValue } = options;
  return (cases[condition as unknown as P] ??
    overrideDefaultValue ??
    cases.default ??
    emptyCaseValue) as typeof cases extends {
    [P in K]: infer R;
  }
    ? R
    : typeof overrideDefaultValue extends undefined | infer R
    ? R
    : typeof cases extends { default: infer R }
    ? R
    : typeof emptyCaseValue extends undefined | infer R
    ? R
    : undefined;
}
