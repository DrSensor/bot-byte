export function transformExpression(
  arg: (expr: any, index: number, length: number) => string,
  suffix?: (expr: any[]) => string
): TaggedTemplateLiterals {
  return (str, ...keys) => str.reduce((acc, curr, idx) => acc + arg(keys[idx - 1], idx, keys.length) + curr)
                        + (suffix ? suffix(keys) : '')
}
